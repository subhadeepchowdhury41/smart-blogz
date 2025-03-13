import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService, Blog } from './blog.service';
import { AuthService } from '../auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = false;
  activeTab: 'all' | 'my' = 'all';
  currentUserId: string | null = null;
  deletingBlogId: string | null = null;
  showDeleteConfirm = false;

  constructor(
    private blogService: BlogService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      const user = await firstValueFrom(this.authService.user$);
      this.currentUserId = user?.id || null;
      await this.loadBlogs();
    } catch (error) {
      console.error('Error loading blogs:', error);
    }
  }

  async loadBlogs() {
    try {
      this.loading = true;
      this.blogs = await this.blogService.getBlogs();
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      this.loading = false;
    }
  }

  get displayedBlogs(): Blog[] {
    if (this.activeTab === 'my' && this.currentUserId) {
      return this.blogs.filter(blog => blog.authorId === this.currentUserId);
    }
    return this.blogs;
  }

  switchTab(tab: 'all' | 'my') {
    this.activeTab = tab;
  }

  confirmDelete(blogId: string, event: Event) {
    event.stopPropagation();
    this.deletingBlogId = blogId;
    this.showDeleteConfirm = true;
  }

  async deleteBlog() {
    if (this.deletingBlogId) {
      try {
        await this.blogService.deleteBlog(this.deletingBlogId);
        this.blogs = this.blogs.filter(blog => blog.id !== this.deletingBlogId);
      } catch (error) {
        console.error('Error deleting blog:', error);
      } finally {
        this.showDeleteConfirm = false;
        this.deletingBlogId = null;
      }
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deletingBlogId = null;
  }
}
