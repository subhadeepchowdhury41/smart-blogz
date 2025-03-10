import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode } from '@nestjs/common';
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

  // Get blogs by authenticated user
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  findMyBlogs(@Request() req) {
    return this.blogsService.findByUser(req.user.sub);
  }
}
