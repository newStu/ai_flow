import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async sendVerificationEmail(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        type: 'EMAIL',
      },
    });
    await this.emailService.sendMail(email, 'Verify your email', `Your code is ${code}`);
  }

  async verifyEmail(email: string, code: string) {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: { email, code, expiresAt: { gt: new Date() } },
    });
    if (!verificationCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    await this.prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });
  }
}
