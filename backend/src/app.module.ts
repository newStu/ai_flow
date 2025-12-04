import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CaptchaModule } from './captcha/captcha.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, RedisModule, CaptchaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
