import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Validate environment variables
if (!projectId || !dataset) {
  console.error('Missing required Sanity environment variables:')
  if (!projectId) console.error('- NEXT_PUBLIC_SANITY_PROJECT_ID is required')
  if (!dataset) console.error('- NEXT_PUBLIC_SANITY_DATASET is required')
  console.error('Please set these environment variables in your Vercel deployment or .env.local file')
  throw new Error('Sanity configuration is incomplete. Missing required environment variables.')
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for write operations
  token: process.env.SANITY_API_WRITE_TOKEN, // Only add token for server-side operations
})
