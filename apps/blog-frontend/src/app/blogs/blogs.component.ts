import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from './blog.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  error: string | null = null;
  deletingBlogId: string | null = null;
  showDeleteConfirm = false;

  constructor(
    private blogService: BlogService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  async loadBlogs() {
    try {
      this.loading = true;
      this.error = null;
      this.blogs = await this.blogService.getBlogs();
    } catch (error) {
      console.error('Error loading blogs:', error);
      this.snackbar.showMessage('Failed to load blogs', 'error');
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
      this.error = null;
      await this.blogService.deleteBlog(id);
      this.blogs = this.blogs.filter(blog => blog.id !== id);
      this.showDeleteConfirm = false;
      this.deletingBlogId = null;
      this.snackbar.showMessage('Blog deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting blog:', error);
      this.snackbar.showMessage('Failed to delete blog', 'error');
    }
  }
}
