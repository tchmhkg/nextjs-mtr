import { fetchMtrNextTrain } from '@lib/mtr-next-train'
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
        data: null,
        isdelay: false,
        curr_time: null,
        alert: null,
      },
      { status: 400 }
    )
  }

  try {
    const parsed = await fetchMtrNextTrain({
      line,
      sta,
      lang,
    })
    return NextResponse.json({
      success: true,
      data: parsed.data,
      isdelay: parsed.isdelay,
      curr_time: parsed.curr_time,
      alert: parsed.alert,
    })
  } catch (error) {
    console.error('MTR API Error:', error)

    const status =
      error && typeof error === 'object' && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined

    if (status === 404 || (status && status >= 400 && status < 500)) {
      return NextResponse.json(
        {
          success: false,
          error: 'MTR API returned an error',
          data: null,
          isdelay: false,
          curr_time: null,
          alert: null,
        },
        { status }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch train data',
        data: null,
        isdelay: false,
        curr_time: null,
        alert: null,
      },
      { status: 503 }
    )
  }
}
