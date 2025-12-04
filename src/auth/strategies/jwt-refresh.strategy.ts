import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from 'src/app.config';
import { PrismaService } from 'src/prisma.service';
import { JwtPayloadWithRefreshToken } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<AppConfig['REFRESH_TOKEN_SECRET']>(
        'REFRESH_TOKEN_SECRET',
      ),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    req: Request,
    payload: any,
  ): Promise<JwtPayloadWithRefreshToken> {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
