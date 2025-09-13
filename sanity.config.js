'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/admin/[[...tool]]/page.jsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

// Validate environment variables for Sanity Studio
if (!projectId || !dataset) {
  console.error('Missing required Sanity environment variables for Studio:')
  if (!projectId) console.error('- NEXT_PUBLIC_SANITY_PROJECT_ID is required')
  if (!dataset) console.error('- NEXT_PUBLIC_SANITY_DATASET is required')
  console.error('Please set these environment variables in your Vercel deployment or .env.local file')
  throw new Error('Sanity Studio configuration is incomplete. Missing required environment variables.')
}

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
