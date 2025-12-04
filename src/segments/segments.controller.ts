import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SegmentsService } from './segments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { AssignSegmentDto, RemoveSegmentDto } from './dto/segment.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtRolesGuard } from 'src/auth/guards/jwt-roles.guard';

@ApiTags('segments')
@ApiBearerAuth()
@Controller('segments')
@UseGuards(JwtAuthGuard, JwtRolesGuard)
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all availeble segments' })
  @ApiResponse({ status: 200, description: 'Map of all segments' })
  async getAllSegments() {
    return this.segmentsService.getAllSegments();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get segments statistics' })
  async getSegmentsStats() {
    return this.segmentsService.getSegmentsStats();
  }

  @Post('assign')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Appoint segment to user' })
  async assignSegment(@Body() assignDto: AssignSegmentDto) {
    if (assignDto.userIds && assignDto.userIds.length > 0) {
      const result = await this.segmentsService.addSegmentToUsers(
        assignDto.userIds,
        assignDto.segment,
      );
      return {
        message: `Segment ${assignDto.segment} appointed for user`,
        ...result,
      };
    } else if (assignDto.percentage) {
      const result = await this.segmentsService.addSegmentToPercentage(
        assignDto.segment,
        assignDto.percentage,
      );
      return {
        message: `Segment ${assignDto.segment} appointed ${assignDto.percentage}% users`,
        ...result,
      };
    } else {
      throw new Error('Should be userIds or percentage');
    }
  }

  @Delete('remove')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user segment' })
  async removeSegment(@Body() removeDto: RemoveSegmentDto) {
    await this.segmentsService.removeSegmentFromUser(
      removeDto.userId,
      removeDto.segment,
    );
    return {
      message: `Segment ${removeDto.segment} removed to user ${removeDto.userId}`,
    };
  }

  @Get('users')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get users in segment' })
  @ApiQuery({
    name: 'segment',
    enum: ['MAIL_VOICE_MESSAGES', 'CLOUD_DISCOUNT_30', 'MAIL_GPT'],
  })
  async getUsersInSegment(@Query('segment') segment: string) {
    const segmentEnum = segment as any;
    return this.segmentsService.getUsersInSegment(segmentEnum);
  }
}
