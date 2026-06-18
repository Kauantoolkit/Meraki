import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false,
})

export async function uploadAvatar(file: File): Promise<string> {
  const asset = await sanityClient.assets.upload('image', file, {
    filename: file.name,
    contentType: file.type,
  })
  return asset.url
}
