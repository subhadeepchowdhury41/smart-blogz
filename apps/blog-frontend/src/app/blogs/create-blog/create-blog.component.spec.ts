import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateBlogComponent } from './create-blog.component';
import { BlogService, Blog, CreateBlogDto } from '../blog.service';
import { AuthService, User } from '../../auth/auth.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jest } from '@jest/globals';

describe('CreateBlogComponent', () => {
  let component: CreateBlogComponent;
  let fixture: ComponentFixture<CreateBlogComponent>;
  let blogService: Partial<BlogService>;
  let authService: Partial<AuthService>;
  let router: Router;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'test-avatar.jpg',
    provider: 'google'
  };

  const mockBlog: Blog = {
    id: '1',
    title: 'Test Blog',
    content: 'Test Content',
    published: true,
    authorId: 'test-user-id',
    author: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['test', 'blog'],
    imageUrl: 'test-image.jpg'
  };

  // Define mock routes
  const routes: Routes = [
    { path: 'blogs', component: {} as any },
    { path: 'blogs/create', component: CreateBlogComponent }
  ];

  beforeEach(async () => {
    const userSubject = new BehaviorSubject<User | null>(mockUser);

    const mockBlogService = {
      createBlog: jest.fn(),
      uploadImage: jest.fn(),
      updateBlog: jest.fn(),
      getBlog: jest.fn()
    };

    const mockAuthService = {
      user$: userSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        CommonModule
      ],
      providers: [
        { provide: BlogService, useValue: mockBlogService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject({})
          }
        }
      ]
    }).compileComponents();

    blogService = TestBed.inject(BlogService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Initialize router navigation
    await router.navigate(['/blogs/create']);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.blogForm.get('title')?.value).toBe('');
    expect(component.blogForm.get('content')?.value).toBe('');
    expect(component.tags).toEqual([]);
  });

  describe('Image Upload', () => {
    it('should handle valid image upload', fakeAsync(() => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [file] }
      };

      (blogService as any).uploadImage.mockResolvedValue('test-url.jpg');

      component.handleImageUpload(mockEvent);
      tick();

      expect(component.error).toBeNull();
      expect(component.blogForm.get('imageUrl')?.value).toBe('test-url.jpg');
      expect((blogService as any).uploadImage).toHaveBeenCalledWith(file);
    }));

    it('should handle invalid file type', fakeAsync(() => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockEvent = {
        target: { files: [file] }
      };

      component.handleImageUpload(mockEvent);
      tick();

      expect(component.error).toBe('Only JPEG, PNG, and WebP images are allowed');
      expect((blogService as any).uploadImage).not.toHaveBeenCalled();
    }));

    it('should handle file size over 5MB', fakeAsync(() => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [largeFile] }
      };

      component.handleImageUpload(mockEvent);
      tick();

      expect(component.error).toBe('File size must be less than 5MB');
      expect((blogService as any).uploadImage).not.toHaveBeenCalled();
    }));

    it('should handle upload error', fakeAsync(() => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [file] }
      };

      (blogService as any).uploadImage.mockRejectedValue(new Error('Upload failed'));

      component.handleImageUpload(mockEvent);
      tick();
      
      expect(component.error).toBe('Failed to upload image');
      expect(component.blogForm.get('imageUrl')?.value).toBe('');
    }));
  });

  describe('Blog Creation', () => {
    beforeEach(() => {
      component.blogForm.patchValue({
        title: 'Test Blog',
        content: 'Test Content',
        imageUrl: 'test-image.jpg'
      });
      component.tags = ['test', 'blog'];
    });

    it('should create blog successfully', fakeAsync(async () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      (blogService as any).createBlog.mockResolvedValue(mockBlog);

      component.onSubmit();
      tick();
      await fixture.whenStable();

      expect((blogService as any).createBlog).toHaveBeenCalledWith({
        title: 'Test Blog',
        content: 'Test Content',
        imageUrl: 'test-image.jpg',
        tags: ['test', 'blog']
      } as CreateBlogDto);
      expect(navigateSpy).toHaveBeenCalledWith(['/blogs']);
      expect(component.isSubmitting).toBeFalsy();
    }));

    it('should handle blog creation error', fakeAsync(async () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      (blogService as any).createBlog.mockRejectedValue(new Error('Creation failed'));

      component.onSubmit();
      tick();
      await fixture.whenStable();

      expect(component.error).toBe('Failed to create blog');
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.isSubmitting).toBeFalsy();
    }));
  });

  describe('Tag Management', () => {
    it('should add tag', () => {
      component.newTag = 'newtag';
      component.addTag();

      expect(component.tags).toContain('newtag');
      expect(component.newTag).toBe('');
    });

    it('should not add duplicate tag', () => {
      component.tags = ['existing'];
      component.newTag = 'existing';
      component.addTag();

      expect(component.tags).toEqual(['existing']);
      expect(component.newTag).toBe('');
      expect(component.error).toBe('Tag already exists');
    });

    it('should not add more than 5 tags', () => {
      component.tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
      component.newTag = 'tag6';
      component.addTag();

      expect(component.tags.length).toBe(5);
      expect(component.tags).not.toContain('tag6');
    });

    it('should remove tag', () => {
      component.tags = ['tag1', 'tag2'];
      component.removeTag('tag1');

      expect(component.tags).toEqual(['tag2']);
    });
  });
});
