import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  ARTWORKS: 'artworks',
  AVATARS: 'avatars',
  COLLECTIONS: 'collections',
} as const

// Helper to upload artwork images
export async function uploadArtworkImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ARTWORKS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.ARTWORKS)
    .getPublicUrl(path)

  return publicUrl
}

// Helper to delete artwork image
export async function deleteArtworkImage(path: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.ARTWORKS)
    .remove([path])

  if (error) throw error
}
