import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Role } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtRolesGuard } from 'src/auth/guards/jwt-roles.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, JwtRolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/segments')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get user segments by ID' })
  @ApiParam({ name: 'id', description: 'ID user' })
  async getUserSegments(@Param('id') userId: string) {
    return this.usersService.getUserSegments(userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (only for ADMIN)' })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    return this.usersService.getAllUsers(skip, limitNum);
  }
}
