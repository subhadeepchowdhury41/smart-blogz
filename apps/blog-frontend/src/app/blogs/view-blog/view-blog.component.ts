import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService, Blog } from '../blog.service';

@Component({
  selector: 'app-view-blog',
  templateUrl: './view-blog.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ViewBlogComponent implements OnInit {
  blog: Blog | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  async ngOnInit() {
    try {
      const blogId = this.route.snapshot.paramMap.get('id');
      if (!blogId) {
        this.error = true;
        return;
      }
      this.blog = await this.blogService.getBlog(blogId);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getAuthorName(blog: Blog): string {
    return blog.author.name;
  }
}
