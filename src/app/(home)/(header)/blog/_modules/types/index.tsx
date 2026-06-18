// types/blog.ts

export type BlogCategory =
  | "All"
  | "Deep Dive"
  | "Tutorial"
  | "Release"
  | "Customer story";

export interface Author {
  name: string;
  role?: string;
  initials: string;
  avatarColor: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readingTime: string;
  imageUrl: string;
  author: Author;
  isFeatured?: boolean;
}
