import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsString, MinLength } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './guard/permissions.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginAttemptsService } from './login-attempts.service';

class ChangePasswordDto {
  @IsString()
  @MinLength(4)
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' })
  newPassword: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttempts: LoginAttemptsService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lockRemaining = this.loginAttempts.getLockRemainingSeconds(dto.email);
    if (lockRemaining > 0) {
      throw new HttpException(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(lockRemaining / 60)} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const result = await this.authService.login(dto.email, dto.password, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refresh_token', result.rawRefreshToken, REFRESH_COOKIE_OPTIONS);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.refresh_token as string | undefined;
    try {
      const result = await this.authService.refresh(rawToken, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      res.cookie('refresh_token', result.rawRefreshToken, REFRESH_COOKIE_OPTIONS);
      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    } catch (err) {
      res.clearCookie('refresh_token', { path: '/api/auth' });
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.refresh_token as string | undefined;
    await this.authService.logout(rawToken);
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: Request & { user: AuthenticatedUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(req.user.sub);
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: AuthenticatedUser }) {
    return {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      permissions: req.user.permissions,
    };
  }
}
