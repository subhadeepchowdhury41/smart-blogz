import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class EditBlogComponent implements OnInit {
  blogForm: FormGroup;
  loading = false;
  newTag = '';
  tags: string[] = [];
  blogId: string;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    public router: Router,
    private snackbar: SnackbarService
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['']
    });

    this.blogId = this.route.snapshot.params['id'];
  }

  async ngOnInit() {
    if (!this.blogId) {
      this.snackbar.showError('Blog ID is required');
      this.router.navigate(['/blogs']);
      return;
    }

    try {
      this.loading = true;
      const blog = await this.blogService.getBlog(this.blogId);
      
      this.blogForm.patchValue({
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl
      });
      
      this.tags = blog.tags || [];
    } catch (error) {
      this.snackbar.showError('Failed to load blog');
      this.router.navigate(['/blogs']);
    } finally {
      this.loading = false;
    }
  }

  addTag() {
    const trimmedTag = this.newTag.trim();
    if (trimmedTag && !this.tags.includes(trimmedTag)) {
      if (this.tags.length >= 5) {
        this.snackbar.showError('Maximum 5 tags allowed');
        return;
      }
      this.tags.push(trimmedTag);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  async handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.snackbar.showError('Image size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.snackbar.showError('Only JPEG, PNG and WebP images are allowed');
        return;
      }
      try {
        const imageUrl = await this.blogService.uploadImage(file);
        this.blogForm.patchValue({ imageUrl });
        this.snackbar.showSuccess('Image uploaded successfully');
      } catch {
        // Error already handled by blog service
      }
    }
  }

  async onSubmit() {
    if (this.blogForm.invalid) {
      Object.keys(this.blogForm.controls).forEach(key => {
        const control = this.blogForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.snackbar.showError('Please fix the form errors');
      return;
    }

    try {
      this.loading = true;
      const blogData = {
        ...this.blogForm.value,
        tags: this.tags
      };

      await this.blogService.updateBlog(this.blogId, blogData);
      this.router.navigate(['/blogs']);
    } catch {
      // Error already handled by blog service
    } finally {
      this.loading = false;
    }
  }
}
