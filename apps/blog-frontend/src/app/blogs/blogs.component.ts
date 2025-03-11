import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from './blog.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  deletingBlogId: string | null = null;
  showDeleteConfirm = false;

  constructor(
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  async loadBlogs() {
    try {
      this.loading = true;
      this.blogs = await this.blogService.getBlogs();
    } catch {
      // Error already handled by blog service
    } finally {
      this.loading = false;
    }
  }

  confirmDelete(id: string) {
    this.deletingBlogId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingBlogId = null;
    this.showDeleteConfirm = false;
  }

  async deleteBlog(id: string) {
    try {
      await this.blogService.deleteBlog(id);
      this.blogs = this.blogs.filter(blog => blog.id !== id);
      this.showDeleteConfirm = false;
      this.deletingBlogId = null;
    } catch {
      // Error already handled by blog service
    }
  }
}
