import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'hi',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}