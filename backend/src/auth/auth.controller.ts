import { Controller, Post, Body, HttpCode, HttpStatus, Req, Ip } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendLoginCodeDto, EmailLoginDto } from './dto/email-login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.signIn(
      signInDto.username,
      signInDto.password,
      ip,
      userAgent,
    );
  }

  @Public()
  @Post('send-verification-email')
  sendVerificationEmail(@Body('email') email: string) {
    return this.authService.sendVerificationEmail(email);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyEmail(email, code);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(
      forgotPasswordDto.username,
      forgotPasswordDto.email,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('send-login-code')
  sendLoginCode(@Body() sendLoginCodeDto: SendLoginCodeDto) {
    return this.authService.sendLoginCode(
      sendLoginCodeDto.email,
      sendLoginCodeDto.captchaId,
      sendLoginCodeDto.captchaInput,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('email-login')
  async emailLogin(
    @Body() emailLoginDto: EmailLoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.emailLogin(
      emailLoginDto.email,
      emailLoginDto.code,
      ip,
      userAgent,
    );
  }
}
