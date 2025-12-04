import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';
import { CaptchaService } from '../captcha/captcha.service';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
  private readonly LOGIN_ATTEMPT_WINDOW = 60 * 60; // 1 hour in seconds

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private redis: RedisService,
    private captchaService: CaptchaService,
  ) {}

  async signIn(
    username: string,
    pass: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Check if account is locked
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check database-level account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpException(
        `Account is locked. Please try again in ${remainingMinutes} minutes.`,
        HttpStatus.LOCKED,
      );
    }

    // Check Redis-based IP lockout
    const ipLockKey = `login_lock:ip:${ipAddress}`;
    const ipFailCount = await this.redis.get(ipLockKey);
    if (ipFailCount && parseInt(ipFailCount) >= this.MAX_LOGIN_ATTEMPTS) {
      throw new HttpException(
        'Too many failed login attempts from this IP. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Verify password
    const isPasswordValid: boolean = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, username, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.resetFailedAttempts(user.id, ipAddress);

    // Update user login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Generate tokens
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken: string = await this.jwtService.signAsync(payload, {
      expiresIn:
        (process.env.JWT_EXPIRATION_TIME as unknown as number) || '15M',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:
        (process.env.JWT_REFRESH_EXPIRATION_TIME as unknown as number) || '7D',
    });

    // Create session record
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(
    userId: number,
    username: string,
    ipAddress?: string,
  ): Promise<void> {
    // Increment user's failed attempts in database
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCKOUT_DURATION * 1000);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'locked',
          lockedUntil: lockUntil,
        },
      });
    }

    // Track IP-based failed attempts in Redis
    if (ipAddress) {
      const ipLockKey = `login_lock:ip:${ipAddress}`;
      const current = await this.redis.get(ipLockKey);
      const count = current ? parseInt(current) + 1 : 1;
      await this.redis.setex(
        ipLockKey,
        this.LOGIN_ATTEMPT_WINDOW,
        count.toString(),
      );
    }
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedAttempts(
    userId: number,
    ipAddress?: string,
  ): Promise<void> {
    // Reset user's failed attempts
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        status: 'active',
        lockedUntil: null,
      },
    });

    // Clear IP lockout
    if (ipAddress) {
      const ipLockKey = `login_lock:ip:${ipAddress}`;
      await this.redis.del(ipLockKey);
    }
  }

  /**
   * Send verification email for registration
   */
  async sendVerificationEmail(
    email: string,
    type: 'register' | 'login' | 'reset_password' = 'register',
  ) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type,
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Cache in Redis for faster lookup
    const redisKey = `verification:${email}:${type}`;
    await this.redis.setex(redisKey, 300, code); // 5 minutes TTL

    // Send email
    const subject =
      type === 'register'
        ? 'Verify your email'
        : type === 'login'
          ? 'Login verification code'
          : 'Reset your password';
    await this.emailService.sendMail(
      email,
      subject,
      `Your verification code is: ${code}. This code will expire in 5 minutes.`,
    );

    return { message: 'Verification code sent successfully' };
  }

  /**
   * Verify email and activate account
   */
  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Check Redis cache first for better performance
    const redisKey = `verification:${email}:register`;
    const cachedCode = await this.redis.get(redisKey);

    // Verify code from database
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'register',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode || (cachedCode && cachedCode !== code)) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Mark verification code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Delete from Redis
    await this.redis.del(redisKey);

    // Update user: set emailVerified and activate account
    const user = await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        status: 'active',
      },
    });

    // Auto-login: Generate tokens
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn:
        (process.env.JWT_EXPIRATION_TIME as unknown as number) || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:
        (process.env.JWT_REFRESH_EXPIRATION_TIME as unknown as number) || '7d',
    });

    // Create session
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Handle forgot password request
   * T097-T100: Implement forgot-password endpoint
   */
  async forgotPassword(
    username: string,
    email: string,
  ): Promise<{ message: string }> {
    // Verify user identity: match username + email
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        email,
      },
    });

    if (!user) {
      // Don't reveal whether user exists for security reasons
      throw new UnauthorizedException('Invalid username or email');
    }

    // Check rate limiting for password reset attempts
    const rateLimitKey = `password_reset:${email}`;
    const recentAttempt = await this.redis.get(rateLimitKey);
    if (recentAttempt) {
      throw new HttpException(
        'Password reset code already sent. Please check your email or try again in 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'reset_password',
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Cache in Redis
    const redisKey = `verification:${email}:reset_password`;
    await this.redis.setex(redisKey, 300, code); // 5 minutes TTL

    // Set rate limit: 5 minutes cooldown
    await this.redis.setex(rateLimitKey, 300, '1');

    // Send reset email
    await this.emailService.sendMail(
      email,
      'Reset your password',
      `Your password reset code is: ${code}. This code will expire in 5 minutes. If you didn't request this, please ignore this email.`,
    );

    return {
      message: 'Password reset code sent to your email',
    };
  }

  /**
   * Reset password with verification code
   * T101-T105: Implement reset-password endpoint
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Verify reset code
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'reset_password',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        passwordHistories: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if new password matches any of last 5 passwords
    for (const history of user.passwordHistories) {
      const isSamePassword = await bcrypt.compare(
        newPassword,
        history.passwordHash,
      );
      if (isSamePassword) {
        throw new HttpException(
          'New password cannot be the same as your last 5 passwords',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Check if new password is same as current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      throw new HttpException(
        'New password cannot be the same as your current password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Save current password to history before updating
    await this.prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: user.password,
      },
    });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Mark verification code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Delete from Redis
    const redisKey = `verification:${email}:reset_password`;
    await this.redis.del(redisKey);

    // Invalidate all old sessions for security
    await this.prisma.userSession.deleteMany({
      where: { userId: user.id },
    });

    // Send notification email
    await this.emailService.sendMail(
      email,
      'Password changed successfully',
      `Your password has been changed successfully. If you didn't make this change, please contact support immediately.`,
    );

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Send login code to email
   * T122-T125: Implement send-code endpoint with captcha validation and rate limiting
   */
  async sendLoginCode(
    email: string,
    captchaId: string,
    captchaInput: string,
  ): Promise<{ message: string }> {
    // Verify captcha first
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      captchaId,
      captchaInput,
    );
    if (!isCaptchaValid) {
      throw new HttpException('Invalid captcha', HttpStatus.BAD_REQUEST);
    }

    // Check if user exists and email is verified
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.emailVerified) {
      throw new HttpException(
        'Email not verified. Please verify your email first.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check rate limiting: 1 code per minute per email
    const rateLimitKey = `email_login_code:${email}`;
    const recentCode = await this.redis.get(rateLimitKey);
    if (recentCode) {
      const ttl = await this.redis.ttl(rateLimitKey);
      throw new HttpException(
        `Please wait ${ttl} seconds before requesting a new code`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'login',
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Cache in Redis
    const redisKey = `verification:${email}:login`;
    await this.redis.setex(redisKey, 300, code); // 5 minutes TTL

    // Set rate limit: 60 seconds cooldown
    await this.redis.setex(rateLimitKey, 60, '1');

    // Send email
    await this.emailService.sendMail(
      email,
      'Login verification code',
      `Your login code is: ${code}. This code will expire in 5 minutes.`,
    );

    return {
      message: 'Login code sent to your email',
    };
  }

  /**
   * Login with email verification code
   * T126-T127: Implement email-login endpoint
   */
  async emailLogin(
    email: string,
    code: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Verify code
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'login',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid or expired login code');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpException(
        `Account is locked. Please try again in ${remainingMinutes} minutes.`,
        HttpStatus.LOCKED,
      );
    }

    // Mark verification code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Delete from Redis
    const redisKey = `verification:${email}:login`;
    await this.redis.del(redisKey);

    // Update user login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        status: 'active',
      },
    });

    // Generate tokens
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn:
        (process.env.JWT_EXPIRATION_TIME as unknown as number) || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:
        (process.env.JWT_REFRESH_EXPIRATION_TIME as unknown as number) || '7d',
    });

    // Create session record
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
