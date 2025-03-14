import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException, ExecutionContext, Type } from '@nestjs/common';
import { HttpArgumentsHost, RpcArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { Express, Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';

// Mock fs module
const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
};

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  const uploadPath = join(process.cwd(), 'apps', 'blog-app-backend', 'uploads');

  const mockUser = {
    sub: 'user-123',
    email: 'test@example.com',
    provider: 'GOOGLE'
  };

  const mockBlog = {
    id: 'blog-123',
    title: 'Test Blog',
    content: 'Test Content',
    published: false,
    tags: ['test', 'blog'],
    imageUrl: 'http://example.com/image.jpg',
    authorId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'http://example.com/avatar.jpg',
      provider: 'GOOGLE',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: uploadPath,
    filename: 'test-123.jpg',
    path: join(uploadPath, 'test-123.jpg'),
    buffer: Buffer.from('test'),
    stream: null
  };

  const mockExecutionContext = (hasValidToken = false): ExecutionContext => {
    const request = {
      headers: {
        authorization: hasValidToken ? 'Bearer valid-token' : undefined
      },
      user: hasValidToken ? mockUser : undefined,
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      range: jest.fn(),
      param: jest.fn(),
      is: jest.fn(),
      protocol: 'http',
      secure: false,
      ip: '::1',
      ips: [],
      subdomains: [],
      path: '/',
      hostname: 'localhost',
      host: 'localhost',
      fresh: false,
      stale: true,
      xhr: false,
      body: {},
      cookies: {},
      method: 'GET',
      params: {},
      query: {},
      route: {},
      signedCookies: {},
      originalUrl: '/',
      url: '/',
      baseUrl: '',
      app: {} as any,
      res: {} as any,
      next: jest.fn()
    } as unknown as Request;

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      locals: {},
      headersSent: false
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    const httpArgumentsHost: HttpArgumentsHost = {
      getRequest: <T = Request>() => request as T,
      getResponse: <T = Response>() => response as T,
      getNext: <T = NextFunction>() => next as T
    };

    const rpcArgumentsHost: RpcArgumentsHost = {
      getContext: <T = any>() => ({} as T),
      getData: <T = any>() => ({} as T)
    };

    const wsArgumentsHost: WsArgumentsHost = {
      getClient: <T = any>() => ({} as T),
      getData: <T = any>() => ({} as T),
      getPattern: () => ({} as any)
    };

    const context: ExecutionContext = {
      switchToHttp: () => httpArgumentsHost,
      getHandler: () => function mockHandler() {},
      getClass: <T = any>() => BlogsController as Type<T>,
      getType: <T extends string = string>() => 'http' as T,
      getArgs: <T extends any[] = any[]>() => [request, response, next] as T,
      getArgByIndex: <T = any>(index: number) => [request, response, next][index] as T,
      switchToRpc: () => rpcArgumentsHost,
      switchToWs: () => wsArgumentsHost
    };

    return context;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        BlogsService,
        {
          provide: PrismaService,
          useValue: {
            blog: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            }
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          return !!request.headers.authorization;
        })
      })
      .compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
    jwtService = module.get<JwtService>(JwtService);
    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockBlog]);
      const result = await controller.findAll();
      expect(result).toEqual([mockBlog]);
    });
  });

  describe('findOne', () => {
    it('should return a single blog', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockBlog);
      const result = await controller.findOne('blog-123');
      expect(result).toEqual(mockBlog);
    });

    it('should throw NotFoundException when blog not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Blog',
      content: 'New Content',
      tags: ['new', 'blog'],
      imageUrl: 'http://example.com/new.jpg'
    };

    it('should create a blog when authenticated', async () => {
      const newBlog = { ...mockBlog, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(newBlog);
      
      const result = await controller.create({ user: mockUser }, createDto);
      expect(result).toEqual(newBlog);
      expect(service.create).toHaveBeenCalledWith(mockUser.sub, createDto);
    });

    it('should block requests without valid JWT token', async () => {
      const context = mockExecutionContext(false);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
    });

    it('should allow requests with valid JWT token', async () => {
      const context = mockExecutionContext(true);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Blog',
      content: 'Updated Content',
      tags: ['updated', 'blog']
    };

    it('should update a blog when user owns it', async () => {
      const updatedBlog = { ...mockBlog, ...updateDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedBlog);
      
      const result = await controller.update({ user: mockUser }, 'blog-123', updateDto);
      expect(result).toEqual(updatedBlog);
      expect(service.update).toHaveBeenCalledWith('blog-123', mockUser.sub, updateDto);
    });

    it('should throw ForbiddenException when updating another user\'s blog', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new ForbiddenException());
      await expect(controller.update({ user: mockUser }, 'blog-123', updateDto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should block unauthorized update requests', async () => {
      const context = mockExecutionContext(false);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a blog when user owns it', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);
      await controller.delete({ user: mockUser }, 'blog-123');
      expect(service.delete).toHaveBeenCalledWith('blog-123', mockUser.sub);
    });

    it('should throw ForbiddenException when deleting another user\'s blog', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new ForbiddenException());
      await expect(controller.delete({ user: mockUser }, 'blog-123'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should block unauthorized delete requests', async () => {
      const context = mockExecutionContext(false);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
    });
  });

  describe('uploadImage', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReset();
      mockFs.mkdirSync.mockReset();
    });

    it('should not create directory if it already exists', async () => {
      mockFs.existsSync.mockReturnValue(true);
      const result = await controller.uploadImage(mockFile);
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(result).toEqual({ url: `/uploads/${mockFile.filename}` });
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      await expect(controller.uploadImage(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = {
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
        size: 1024,
        filename: 'test.pdf',
        path: 'test.pdf',
        destination: 'test.pdf',
        encoding: 'test.pdf',
        buffer: Buffer.from('test.pdf'),
        fieldname: 'test.pdf'
      };
      await expect(controller.uploadImage(invalidFile as Express.Multer.File))
        .rejects.toThrow(new BadRequestException('Only JPG, PNG, and GIF files are allowed'));
    });

    it('should throw BadRequestException for files over 5MB', async () => {
      const largeFile = { ...mockFile, size: 6 * 1024 * 1024 };
      await expect(controller.uploadImage(largeFile as Express.Multer.File))
        .rejects.toThrow(new BadRequestException('File size exceeds 5MB limit'));
    });
  });

  describe('findMyBlogs', () => {
    it('should return user\'s blogs when authenticated', async () => {
      jest.spyOn(service, 'findByUser').mockResolvedValue([mockBlog]);
      const result = await controller.findMyBlogs({ user: mockUser });
      expect(result).toEqual([mockBlog]);
      expect(service.findByUser).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should block unauthenticated requests', async () => {
      const context = mockExecutionContext(false);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
    });

    it('should allow authenticated requests', async () => {
      const context = mockExecutionContext(true);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  });
});
