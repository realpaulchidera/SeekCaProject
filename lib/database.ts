import { supabase } from './supabase'

// Database helper functions for type-safe queries

export interface Job {
  id: string
  hirer_id: string
  title: string
  description: string
  category: string
  job_type: string
  location: string
  remote_allowed: boolean
  salary_type: string
  salary_min: number
  salary_max: number
  currency: string
  required_skills: string[]
  required_licenses: string[]
  requirements: string[]
  is_urgent: boolean
  status: string
  expires_at: string
  view_count: number
  application_count: number
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  professional_id: string
  cover_letter: string
  proposed_rate: number
  estimated_duration: string
  availability_start: string
  status: string
  hirer_notes: string
  created_at: string
  updated_at: string
}

export interface ProfessionalProfile {
  id: string
  user_id: string
  title: string
  hourly_rate: number
  experience_years: number
  skills: string[]
  certifications: string[]
  licenses: string[]
  education: any[]
  portfolio_url: string
  availability_status: string
  response_time_hours: number
  rating: number
  total_reviews: number
  completed_projects: number
  total_earnings: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  file_url?: string
  file_name?: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  job_id?: string
  hirer_id: string
  professional_id: string
  last_message_at: string
  created_at: string
  updated_at: string
}

// Job queries
export const jobQueries = {
  async getActiveJobs(filters?: {
    category?: string
    location?: string
    salary_min?: number
    salary_max?: number
    search?: string
  }) {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        profiles:hirer_id (
          id,
          company_name,
          location,
          is_verified
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    if (filters?.salary_min) {
      query = query.gte('salary_min', filters.salary_min)
    }

    if (filters?.salary_max) {
      query = query.lte('salary_max', filters.salary_max)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Job[]
  },

  async getJobById(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        profiles:hirer_id (
          id,
          company_name,
          location,
          is_verified,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createJob(jobData: Partial<Job>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateJob(id: string, updates: Partial<Job>) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getJobsByHirer(hirerId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('hirer_id', hirerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Job[]
  }
}

// Professional queries
export const professionalQueries = {
  async getProfessionals(filters?: {
    category?: string
    location?: string
    hourly_rate_min?: number
    hourly_rate_max?: number
    skills?: string[]
    availability?: string
    search?: string
  }) {
    let query = supabase
      .from('professional_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          location,
          avatar_url,
          is_verified
        )
      `)
      .order('rating', { ascending: false })

    if (filters?.availability) {
      query = query.eq('availability_status', filters.availability)
    }

    if (filters?.hourly_rate_min) {
      query = query.gte('hourly_rate', filters.hourly_rate_min)
    }

    if (filters?.hourly_rate_max) {
      query = query.lte('hourly_rate', filters.hourly_rate_max)
    }

    if (filters?.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getProfessionalProfile(userId: string) {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email,
          location,
          avatar_url,
          bio,
          website,
          linkedin_url,
          is_verified
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfessionalProfile(userId: string, updates: Partial<ProfessionalProfile>) {
    const { data, error } = await supabase
      .from('professional_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createProfessionalProfile(profileData: Partial<ProfessionalProfile>) {
    const { data, error } = await supabase
      .from('professional_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Application queries
export const applicationQueries = {
  async createApplication(applicationData: Partial<Application>) {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getApplicationsByProfessional(professionalId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title,
          company_name:profiles!jobs_hirer_id_fkey(company_name),
          status,
          salary_min,
          salary_max,
          salary_type
        )
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getApplicationsByJob(jobId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:professional_id (
          id,
          first_name,
          last_name,
          avatar_url,
          is_verified
        ),
        professional_profiles:professional_id (
          title,
          hourly_rate,
          rating,
          total_reviews,
          skills
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateApplicationStatus(id: string, status: string, hirer_notes?: string) {
    const updates: any = { status }
    if (hirer_notes) updates.hirer_notes = hirer_notes

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Message queries
export const messageQueries = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        hirer:profiles!conversations_hirer_id_fkey (
          id,
          first_name,
          last_name,
          company_name,
          avatar_url
        ),
        professional:profiles!conversations_professional_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        job:jobs (
          id,
          title
        )
      `)
      .or(`hirer_id.eq.${userId},professional_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async sendMessage(messageData: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createConversation(conversationData: Partial<Conversation>) {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)

    if (error) throw error
  }
}

// Utility functions
export const dbUtils = {
  async incrementJobView(jobId: string, viewerId?: string, ipAddress?: string, userAgent?: string) {
    const { error } = await supabase
      .from('job_views')
      .insert({
        job_id: jobId,
        viewer_id: viewerId,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (error) throw error
  },

  async saveJob(userId: string, jobId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({ user_id: userId, job_id: jobId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async unsaveJob(userId: string, jobId: string) {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId)

    if (error) throw error
  },

  async getSavedJobs(userId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        jobs (
          *,
          profiles:hirer_id (
            company_name,
            is_verified
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}