import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Public()
  @Get('generate')
  async generateCaptcha() {
    return this.captchaService.generateCaptcha();
  }

  @Public()
  @Post('verify')
  async verifyCaptcha(
    @Body('captchaId') captchaId: string,
    @Body('userInput') userInput: string,
  ) {
    const isValid = await this.captchaService.verifyCaptcha(captchaId, userInput);
    
    if (!isValid) {
      throw new HttpException('Invalid captcha', HttpStatus.BAD_REQUEST);
    }

    return { message: 'Captcha verified successfully' };
  }
}
