import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AuthCallbackComponent } from './auth/auth-callback.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blogs', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login/callback',
    component: AuthCallbackComponent
  },
  {
    path: 'blogs',
    loadComponent: () => import('./blogs/blogs.component').then(m => m.BlogsComponent)
  },
  {
    path: 'blogs/create',
    loadComponent: () => import('./blogs/create-blog/create-blog.component').then(m => m.CreateBlogComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'blogs/edit/:id',
    loadComponent: () => import('./blogs/edit-blog/edit-blog.component').then(m => m.EditBlogComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
