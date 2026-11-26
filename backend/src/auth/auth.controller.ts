import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimited } from '../common/rate-limit';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login do admin; devolve o JWT (1h)' })
  @HttpCode(200)
  @RateLimited()
  login(@Body() { email, password }: LoginDto) {
    return this.auth.login(email, password);
  }
}
