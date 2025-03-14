import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BlogsService', () => {
  let service: BlogsService;
  let prisma: PrismaService;

  const mockBlog = {
    id: 'blog-123',
    title: 'Test Blog',
    content: 'Test Content',
    tags: ['test', 'blog'],
    imageUrl: 'http://example.com/image.jpg',
    authorId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'user-123',
      name: 'Test User',
      avatar: 'http://example.com/avatar.jpg'
    }
  };

  const mockPrisma = {
    blog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: PrismaService,
          useValue: mockPrisma
        }
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all blogs with author information', async () => {
      mockPrisma.blog.findMany.mockResolvedValue([mockBlog]);
      const result = await service.findAll();
      expect(result).toEqual([mockBlog]);
      expect(mockPrisma.blog.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return a single blog with author information', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue(mockBlog);
      const result = await service.findOne('blog-123');
      expect(result).toEqual(mockBlog);
      expect(mockPrisma.blog.findUnique).toHaveBeenCalledWith({
        where: { id: 'blog-123' },
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
    });

    it('should throw NotFoundException when blog not found', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Blog',
      content: 'New Content',
      tags: ['new', 'blog'],
      imageUrl: 'http://example.com/new.jpg'
    };

    it('should create a blog with author connection', async () => {
      const newBlog = { ...mockBlog, ...createDto };
      mockPrisma.blog.create.mockResolvedValue(newBlog);

      const result = await service.create('user-123', createDto);
      expect(result).toEqual(newBlog);
      expect(mockPrisma.blog.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          author: {
            connect: { id: 'user-123' }
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
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Blog',
      content: 'Updated Content',
      tags: ['updated', 'blog']
    };

    beforeEach(() => {
      mockPrisma.blog.findUnique.mockResolvedValue({ authorId: 'user-123' });
    });

    it('should update a blog if user owns it', async () => {
      const updatedBlog = { ...mockBlog, ...updateDto };
      mockPrisma.blog.update.mockResolvedValue(updatedBlog);

      const result = await service.update('blog-123', 'user-123', updateDto);
      expect(result).toEqual(updatedBlog);
      expect(mockPrisma.blog.update).toHaveBeenCalledWith({
        where: { id: 'blog-123' },
        data: updateDto,
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
    });

    it('should throw ForbiddenException when updating another user\'s blog', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue({ authorId: 'other-user' });
      await expect(service.update('blog-123', 'user-123', updateDto))
        .rejects.toThrow(ForbiddenException);
      expect(mockPrisma.blog.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when blog not found', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue(null);
      await expect(service.update('non-existent', 'user-123', updateDto))
        .rejects.toThrow(NotFoundException);
      expect(mockPrisma.blog.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockPrisma.blog.findUnique.mockResolvedValue({ authorId: 'user-123' });
    });

    it('should delete a blog if user owns it', async () => {
      await service.delete('blog-123', 'user-123');
      expect(mockPrisma.blog.delete).toHaveBeenCalledWith({
        where: { id: 'blog-123' }
      });
    });

    it('should throw ForbiddenException when deleting another user\'s blog', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue({ authorId: 'other-user' });
      await expect(service.delete('blog-123', 'user-123'))
        .rejects.toThrow(ForbiddenException);
      expect(mockPrisma.blog.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when blog not found', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue(null);
      await expect(service.delete('non-existent', 'user-123'))
        .rejects.toThrow(NotFoundException);
      expect(mockPrisma.blog.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return all blogs for a specific user', async () => {
      mockPrisma.blog.findMany.mockResolvedValue([mockBlog]);
      const result = await service.findByUser('user-123');
      expect(result).toEqual([mockBlog]);
      expect(mockPrisma.blog.findMany).toHaveBeenCalledWith({
        where: { authorId: 'user-123' },
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
    });
  });
});
