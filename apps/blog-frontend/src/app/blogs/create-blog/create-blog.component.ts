import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateBlogComponent {
  blog = {
    title: '',
    content: '',
    tags: [] as string[],
    imageUrl: ''
  };
  newTag = '';
  isSubmitting = false;
  error: string | null = null;
  touched = {
    title: false,
    content: false,
    imageUrl: false
  };

  constructor(
    private blogService: BlogService,
    private router: Router,
    private snackbar: SnackbarService
  ) {}

  markAsTouched(field: keyof typeof this.touched) {
    this.touched[field] = true;
  }

  get titleError(): string | null {
    if (!this.touched.title) return null;
    if (!this.blog.title.trim()) return 'Title is required';
    if (this.blog.title.length < 3) return 'Title must be at least 3 characters';
    if (this.blog.title.length > 100) return 'Title must be less than 100 characters';
    return null;
  }

  get contentError(): string | null {
    if (!this.touched.content) return null;
    if (!this.blog.content.trim()) return 'Content is required';
    if (this.blog.content.length < 10) return 'Content must be at least 10 characters';
    return null;
  }

  addTag() {
    const trimmedTag = this.newTag.trim();
    if (trimmedTag && !this.blog.tags.includes(trimmedTag)) {
      if (this.blog.tags.length >= 5) {
        this.snackbar.showMessage('Maximum 5 tags allowed', 'error');
        return;
      }
      this.blog.tags.push(trimmedTag);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.blog.tags = this.blog.tags.filter(t => t !== tag);
  }

  async handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.snackbar.showMessage('Image size should be less than 5MB', 'error');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.snackbar.showMessage('Only JPEG, PNG and WebP images are allowed', 'error');
        return;
      }
      try {
        this.markAsTouched('imageUrl');
        const imageUrl = await this.blogService.uploadImage(file);
        this.blog.imageUrl = imageUrl;
        this.snackbar.showMessage('Image uploaded successfully', 'success');
      } catch (error) {
        console.error('Failed to upload image:', error);
        this.snackbar.showMessage('Failed to upload image', 'error');
      }
    }
  }

  async createBlog() {
    // Mark all fields as touched
    Object.keys(this.touched).forEach(key => {
      this.markAsTouched(key as keyof typeof this.touched);
    });

    // Check for validation errors
    if (this.titleError || this.contentError) {
      this.snackbar.showMessage('Please fix the validation errors', 'error');
      return;
    }

    if (!this.blog.title.trim() || !this.blog.content.trim()) {
      this.snackbar.showMessage('Title and content are required', 'error');
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = null;
      await this.blogService.createBlog({
        title: this.blog.title.trim(),
        content: this.blog.content.trim(),
        tags: this.blog.tags,
        imageUrl: this.blog.imageUrl
      });
      this.snackbar.showMessage('Blog created successfully', 'success');
      this.router.navigate(['/blogs']);
    } catch (error) {
      console.error('Failed to create blog:', error);
      this.snackbar.showMessage('Failed to create blog', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }
}
