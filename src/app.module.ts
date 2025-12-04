import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateAppConfig } from './app.config';
import { AuthModule } from './auth/auth.module';
import { SegmentsModule } from './segments/segments.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtRolesGuard } from './auth/guards/jwt-roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateAppConfig,
    }),
    AuthModule,
    SegmentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtRolesGuard,
    },
  ],
})
export class AppModule {}
