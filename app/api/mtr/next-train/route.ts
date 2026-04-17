import axios from 'axios'
import { MTR_NEXT_TRAIN_API } from '@utils/api-urls'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const line = searchParams.get('line')
  const sta = searchParams.get('sta')
  const lang = searchParams.get('lang') ?? 'tc'

  if (!line || !sta) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters: line and sta',
        data: [],
      },
      { status: 400 }
    )
  }

  try {
    const apiRes = await axios.get(MTR_NEXT_TRAIN_API, {
      params: {
        line,
        sta,
        lang,
      },
    })
    return NextResponse.json({
      success: true,
      data: apiRes?.data || [],
    })
  } catch (error) {
    console.error('MTR API Error:', error)

    if (axios.isAxiosError(error)) {
      if (error.response) {
        return NextResponse.json(
          {
            success: false,
            error: 'MTR API returned an error',
            data: [],
          },
          { status: error.response.status }
        )
      }
      if (error.request) {
        return NextResponse.json(
          {
            success: false,
            error: 'Network error - unable to reach MTR API',
            data: [],
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch train data',
        data: [],
      },
      { status: 500 }
    )
  }
}
