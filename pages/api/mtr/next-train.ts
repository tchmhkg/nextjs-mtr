import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { MTR_NEXT_TRAIN_API } from '@utils/api-urls'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { line, sta, lang = 'tc' } = req.query

  // Validate required parameters
  if (!line || !sta) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: line and sta',
      data: [],
    })
  }

  try {
    const apiRes = await axios.get(MTR_NEXT_TRAIN_API, {
      params: {
        line,
        sta,
        lang,
      },
    })
    res.json({
      success: true,
      data: apiRes?.data || [],
    })
  } catch (error) {
    console.error('MTR API Error:', error)

    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        return res.status(error.response.status).json({
          success: false,
          error: 'MTR API returned an error',
          data: [],
        })
      } else if (error.request) {
        // Network error
        return res.status(503).json({
          success: false,
          error: 'Network error - unable to reach MTR API',
          data: [],
        })
      }
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: 'Failed to fetch train data',
      data: [],
    })
  }
}
