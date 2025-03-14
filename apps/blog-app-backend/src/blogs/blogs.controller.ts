import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Express } from 'express';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

class CreateBlogDto {
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
}

class UpdateBlogDto {
  title?: string;
  content?: string;
  tags?: string[];
  imageUrl?: string;
}

@Controller('blogs')
export class BlogsController {

  constructor(private readonly blogsService: BlogsService) {}
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(req.user.sub, createBlogDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.update(id, req.user.sub, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Request() req, @Param('id') id: string) {
    await this.blogsService.delete(id, req.user.sub);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        console.log('file____________', file);
        
        const uploadPath = join(process.cwd(), 'apps', 'blog-app-backend', 'uploads');
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname).toLowerCase();
        callback(null, `${uniqueSuffix}${ext}`);
      },
    })
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and GIF files are allowed');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const url = `/uploads/${file.filename}`;
    return { url };
  }

  // Get blogs by authenticated user
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  findMyBlogs(@Request() req) {
    return this.blogsService.findByUser(req.user.sub);
  }
}
