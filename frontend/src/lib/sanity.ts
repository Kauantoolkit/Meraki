import { createClient, type SanityClient } from '@sanity/client'

let sanityClient: SanityClient | null = null

function getClient(): SanityClient {
  if (!sanityClient) {
    const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
    if (!projectId) {
      throw new Error(
        'Sanity não configurado. Defina VITE_SANITY_PROJECT_ID no arquivo .env'
      )
    }
    sanityClient = createClient({
      projectId,
      dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
      apiVersion: '2024-01-01',
      token: import.meta.env.VITE_SANITY_TOKEN,
      useCdn: false,
    })
  }
  return sanityClient
}

export async function uploadAvatar(file: File): Promise<string> {
  const client = getClient()
  const asset = await client.assets.upload('image', file, {
    filename: file.name,
    contentType: file.type,
  })
  return asset.url
}
