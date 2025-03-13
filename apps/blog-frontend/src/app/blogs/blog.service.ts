import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../shared/snackbar.service';

export interface Author {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  imageUrl?: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly apiUrl = `${environment.apiUrl}/blogs`;

  constructor(
    private http: HttpClient,
    private snackbar: SnackbarService
  ) {}

  private handleError(error: HttpErrorResponse, operation: string) {
    console.error(`${operation} failed:`, error);
    if (error.status === 401) {
      this.snackbar.showError('Please log in to continue');
    } else {
      this.snackbar.showError(`Failed to ${operation.toLowerCase()}. Please try again.`);
    }
    return throwError(() => error);
  }

  async getBlogs(): Promise<Blog[]> {
    try {
      return await firstValueFrom(
        this.http.get<Blog[]>(this.apiUrl).pipe(
          catchError(error => this.handleError(error, 'Load blogs'))
        )
      );
    } catch (error) {
      this.snackbar.showError('Failed to fetch blogs');
      throw error;
    }
  }

  async getBlog(id: string): Promise<Blog> {
    try {
      return await firstValueFrom(
        this.http.get<Blog>(`${this.apiUrl}/${id}`).pipe(
          catchError(error => this.handleError(error, 'Load blog'))
        )
      );
    } catch (error) {
      this.snackbar.showError('Failed to fetch blog');
      throw error;
    }
  }

  async createBlog(blog: CreateBlogDto): Promise<Blog> {
    try {
      const newBlog = await firstValueFrom(
        this.http.post<Blog>(this.apiUrl, blog).pipe(
          catchError(error => this.handleError(error, 'Create blog'))
        )
      );
      this.snackbar.showSuccess('Blog created successfully');
      return newBlog;
    } catch (error) {
      this.snackbar.showError('Failed to create blog');
      throw error;
    }
  }

  async updateBlog(id: string, blog: CreateBlogDto): Promise<Blog> {
    try {
      const updatedBlog = await firstValueFrom(
        this.http.put<Blog>(`${this.apiUrl}/${id}`, blog).pipe(
          catchError(error => this.handleError(error, 'Update blog'))
        )
      );
      this.snackbar.showSuccess('Blog updated successfully');
      return updatedBlog;
    } catch (error) {
      this.snackbar.showError('Failed to update blog');
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
          catchError(error => this.handleError(error, 'Delete blog'))
        )
      );
      this.snackbar.showSuccess('Blog deleted successfully');
    } catch (error) {
      this.snackbar.showError('Failed to delete blog');
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData)
      );
      // Construct full URL for the image
      const imageUrl = `${environment.fileUrl}${response.url}`;
      this.snackbar.showSuccess('Image uploaded successfully');
      return imageUrl;
    } catch (error) {
      this.snackbar.showError('Failed to upload image');
      throw error;
    }
  }
}
