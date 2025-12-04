import { ApiProperty } from '@nestjs/swagger';
import { Segment } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class AssignSegmentDto {
  @ApiProperty({
    enum: Segment,
    example: Segment.MAIL_GPT,
  })
  @IsEnum(Segment)
  @IsNotEmpty()
  segment: Segment;

  @ApiProperty({
    required: false,
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsArray()
  userIds?: string[];

  @ApiProperty({
    required: false,
    example: 30,
    description: 'Percent of users (1-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage?: number;
}

export class RemoveSegmentDto {
  @ApiProperty({
    enum: Segment,
    example: Segment.MAIL_GPT,
  })
  @IsEnum(Segment)
  @IsNotEmpty()
  segment: Segment;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  userId: string;
}
