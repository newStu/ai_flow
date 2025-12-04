import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() 
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne(username);
    return { available: !user };
  }

  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { available: !user };
  }
}
