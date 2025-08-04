// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'


export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession() // attaches session to cookies
  return res
}

// Protect only the routes under /protected
export const config = {
  matcher: ['/(protected)/:path*'],
}
