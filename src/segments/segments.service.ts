import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Segment } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SegmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSegments(): Promise<Segment[]> {
    return Object.values(Segment);
  }

  async getUserSegments(userId: string): Promise<{ segments: Segment[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { segments: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { segments: user.segments };
  }

  async addSegmentToUser(userId: string, segment: Segment): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not foud`);
    }

    if (user.segments.includes(segment)) {
      throw new BadRequestException(`User already has segment ${segment}`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        segments: {
          push: segment,
        },
      },
    });
  }

  async addSegmentToUsers(
    userIds: string[],
    segment: Segment,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.addSegmentToUser(userId, segment);
        success++;
      } catch (err) {
        if (err.message.includes('already has segment')) {
          failed++;
        } else {
          throw err;
        }
      }
    }

    return { success, failed };
  }

  async addSegmentToPercentage(
    segment: Segment,
    percentage: number,
  ): Promise<{ affectedUsers: number; message: string }> {
    if (percentage < 1 || percentage > 100) {
      throw new BadRequestException('Percentage must be between 1 and 100');
    }

    const allUsers = await this.prisma.user.findMany({
      select: { id: true, segments: true },
    });

    const totalUsers = allUsers.length;
    console.log(`Total users: ${totalUsers}`);

    const targetCount = Math.floor((totalUsers * percentage) / 100);
    console.log(`Target users count: ${targetCount}`);

    if (targetCount === 0) {
      return {
        affectedUsers: 0,
        message: `Cannot assign segment to ${percentage}% of users. Need at least ${Math.ceil(100 / percentage)} users.`,
      };
    }

    const eligibleUsers = allUsers.filter(
      (user) => !user.segments.includes(segment),
    );
    console.log(`Users without segment ${segment}: ${eligibleUsers.length}`);

    if (eligibleUsers.length === 0) {
      return {
        affectedUsers: 0,
        message: `All users already have the segment ${segment}`,
      };
    }

    const selectedUsers = this.getRandomUsers(
      eligibleUsers,
      Math.min(targetCount, eligibleUsers.length),
    );
    console.log(
      `Selected users: ${selectedUsers.length}`,
      selectedUsers.map((u) => u.id),
    );

    for (const user of selectedUsers) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          segments: {
            push: segment,
          },
        },
      });
    }

    return {
      affectedUsers: selectedUsers.length,
      message: `Segment ${segment} assigned to ${selectedUsers.length} users (${percentage}% of ${totalUsers})`,
    };
  }

  async removeSegmentFromUser(userId: string, segment: Segment): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.segments.includes(segment)) {
      throw new BadRequestException(`User does not have segment ${segment}`);
    }

    const updateSegments = user.segments.filter((s) => s !== segment);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        segments: updateSegments,
      },
    });
  }

  async getSegmentsStats(): Promise<
    { segment: Segment; count: number; percentage: number }[]
  > {
    const allUsers = await this.prisma.user.findMany({
      select: { segments: true },
    });

    const totalUsers = allUsers.length;

    return Object.values(Segment).map((segment) => {
      const count = allUsers.filter((user) =>
        user.segments.includes(segment),
      ).length;
      const percentage =
        totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

      return { segment, count, percentage };
    });
  }

  async getUsersInSegment(segment: Segment): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        segments: {
          has: segment,
        },
      },
      select: { id: true },
    });

    return users.map((user) => user.id);
  }

  private getRandomUsers(
    users: { id: string }[],
    count: number,
  ): { id: string }[] {
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
