import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogService } from '../blog.service';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    .editor-container {
      min-height: 300px;
      margin-bottom: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class CreateBlogComponent implements OnInit {
  blogForm: FormGroup;
  loading = false;
  isEditing = false;
  blogId: string | null = null;
  newTag = '';
  tags: string[] = [];
  imageUrl = '';
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.blogId = id;
        this.isEditing = true;
        this.loadBlog(id);
      }
    });
  }

  async loadBlog(id: string) {
    try {
      this.loading = true;
      const blog = await this.blogService.getBlog(id);
      this.blogForm.patchValue({
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl
      });
      this.tags = blog.tags || [];
    } catch {
      // Error already handled by blog service
      this.router.navigate(['/blogs']);
    } finally {
      this.loading = false;
    }
  }

  addTag() {
    const trimmedTag = this.newTag.trim();
    if (trimmedTag && !this.tags.includes(trimmedTag)) {
      if (this.tags.length >= 5) {
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
        this.error = 'File size must be less than 5MB';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.error = 'Only JPEG, PNG, and WebP images are allowed';
        return;
      }
      try {
        this.loading = true;
        const imageUrl = await this.blogService.uploadImage(file);
        console.log('Uploaded image URL:', imageUrl);
        this.blogForm.patchValue({ imageUrl });
        this.error = null;
      } catch (error) {
        this.error = 'Failed to upload image';
        console.error('Image upload error:', error);
      } finally {
        this.loading = false;
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
      return;
    }

    try {
      this.isSubmitting = true;
      const blogData = {
        ...this.blogForm.value,
        tags: this.tags
      };

      if (this.isEditing && this.blogId) {
        await this.blogService.updateBlog(this.blogId, blogData);
      } else {
        await this.blogService.createBlog(blogData);
      }

      this.router.navigate(['/blogs']);
    } catch {
      // Error already handled by blog service
    } finally {
      this.isSubmitting = false;
    }
  }
}
