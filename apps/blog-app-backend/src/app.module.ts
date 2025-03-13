import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { BlogsModule } from './blogs/blogs.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true
    }),
    SharedModule,
    AuthModule,
    BlogsModule,
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
})
export class AppModule {}
