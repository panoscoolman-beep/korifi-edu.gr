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
  created_at: string
}

export type Lesson = {
  id: string
  title: string
  course_id: string
  order: number
  content_type: 'pdf' | 'text'
  pdf_url: string | null
  content: string | null
  is_free: boolean
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  role: 'student' | 'admin'
  created_at: string
}
