export type Subject = {
  id: string
  name: string
  slug: string
  icon: string | null
  order: number
  created_at: string
}

export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  subject_id: string
  is_free: boolean
  cover_image: string | null
  icon: string | null
  created_at: string
}

export type CourseAccessCode = {
  id: string
  course_id: string
  code: string
  description: string | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export type Lesson = {
  id: string
  title: string
  course_id: string
  order: number
  content_type: 'pdf' | 'text' | 'article'
  pdf_url: string | null
  content: string | null
  cover_image: string | null
  is_free: boolean
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export type UserRole = 'student' | 'teacher' | 'admin'

export type Profile = {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

// ---------------------------------------------------------------------
// Phase 2.5 content types
// ---------------------------------------------------------------------

export type Article = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_md: string
  cover_image: string | null
  author_name: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type Page = {
  id: string
  slug: string
  title: string
  content_md: string
  cover_image: string | null
  meta_description: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export type PageSection = {
  id: string
  page_id: string
  kind: 'content' | 'modal' | 'cta' | 'accordion' | 'gallery'
  title: string | null
  body_md: string
  sort_order: number
  metadata: Record<string, unknown>
}

export type Teacher = {
  id: string
  slug: string
  full_name: string
  role: string | null
  bio_md: string
  photo_url: string | null
  email: string | null
  social_links: Record<string, string>
  sort_order: number
  is_published: boolean
  created_at: string
}

export type Event = {
  id: string
  slug: string
  title: string
  description_md: string
  cover_image: string | null
  starts_at: string | null
  ends_at: string | null
  location: string | null
  link_url: string | null
  is_online: boolean
  is_published: boolean
  created_at: string
}

export type Testimonial = {
  id: string
  author_name: string
  author_role: string | null
  quote: string
  full_quote: string | null
  photo_url: string | null
  sort_order: number
  is_published: boolean
  source_ref: string | null
}

export type Partner = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  sort_order: number
  is_published: boolean
}

export type GalleryAlbum = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  event_date: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export type GalleryPhoto = {
  id: string
  album_id: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}
