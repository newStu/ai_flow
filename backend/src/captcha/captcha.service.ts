import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { RedisService } from '../redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CaptchaService {
  private readonly CAPTCHA_EXPIRY = 300; // 5 minutes

  constructor(private redis: RedisService) {}

  /**
   * Generate captcha image
   */
  async generateCaptcha(): Promise<{ captchaId: string; svg: string }> {
    // Generate captcha
    const captcha = svgCaptcha.create({
      size: 4, // 4 characters
      noise: 2, // Noise level
      color: true, // Colored characters
      background: '#f0f0f0',
    });

    // Generate unique ID for this captcha
    const captchaId = randomBytes(16).toString('hex');

    // Store captcha text in Redis with ID as key
    const redisKey = `captcha:${captchaId}`;
    await this.redis.setex(redisKey, this.CAPTCHA_EXPIRY, captcha.text.toLowerCase());

    return {
      captchaId,
      svg: captcha.data,
    };
  }

  /**
   * Verify captcha
   */
  async verifyCaptcha(captchaId: string, userInput: string): Promise<boolean> {
    const redisKey = `captcha:${captchaId}`;
    const storedText = await this.redis.get(redisKey);

    if (!storedText) {
      return false; // Captcha expired or doesn't exist
    }

    // Delete captcha after verification (one-time use)
    await this.redis.del(redisKey);

    // Compare (case-insensitive)
    return storedText === userInput.toLowerCase();
  }
}
