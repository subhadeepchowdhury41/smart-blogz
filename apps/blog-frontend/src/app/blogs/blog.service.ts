import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../shared/snackbar.service';

export interface Blog {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
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
      this.snackbar.showMessage('Please log in to continue', 'error');
    } else {
      this.snackbar.showMessage(`Failed to ${operation.toLowerCase()}. Please try again.`, 'error');
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
      console.error('Error fetching blogs:', error);
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
      console.error(`Error fetching blog ${id}:`, error);
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
      this.snackbar.showMessage('Blog created successfully', 'success');
      return newBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
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
      this.snackbar.showMessage('Blog updated successfully', 'success');
      return updatedBlog;
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error);
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
      this.snackbar.showMessage('Blog deleted successfully', 'success');
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData)
    );
    
    return response.url;
  }
}
