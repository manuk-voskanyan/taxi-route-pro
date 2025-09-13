import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Validate environment variables
if (!projectId || !dataset) {
  console.warn('Missing Sanity environment variables. Some functionality may not work.')
}

export const client = createClient({
  projectId: projectId || 'dummy-project-id',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: false, // Set to false for write operations
  token: process.env.SANITY_API_WRITE_TOKEN, // Only add token for server-side operations
})
