import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  async getBlogs(): Promise<Blog[]> {
    return firstValueFrom(this.http.get<Blog[]>(this.apiUrl));
  }

  async getBlog(id: string): Promise<Blog> {
    return firstValueFrom(this.http.get<Blog>(`${this.apiUrl}/${id}`));
  }

  async createBlog(blog: Partial<Blog>): Promise<Blog> {
    return firstValueFrom(this.http.post<Blog>(this.apiUrl, blog));
  }

  async updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
    return firstValueFrom(this.http.put<Blog>(`${this.apiUrl}/${id}`, blog));
  }

  async deleteBlog(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
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
