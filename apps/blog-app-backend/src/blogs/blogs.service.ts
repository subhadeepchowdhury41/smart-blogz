import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.blog.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async create(authorId: string, data: { title: string; content: string; tags: string[]; imageUrl?: string }) {
    return this.prisma.blog.create({
      data: {
        ...data,
        author: {
          connect: { id: authorId }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  async update(id: string, userId: string, data: { title?: string; content?: string; tags?: string[]; imageUrl?: string }) {
    // Check if blog exists and belongs to user
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own blogs');
    }

    return this.prisma.blog.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    // Check if blog exists and belongs to user
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.prisma.blog.delete({
      where: { id }
    });
  }

  async findByUser(userId: string) {
    return this.prisma.blog.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }
}
