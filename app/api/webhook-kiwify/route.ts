import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== 'pai2026seguro') {
    return NextResponse.json({ erro: 'token invalido' }, { status: 401 })
  }

  const body = await req.json()
  const order = body.order

  if (order?.order_status !== 'paid') {
    return NextResponse.json({ ok: true, ignorado: true })
  }

  const slug = order?.TrackingParameters?.s1
  if (!slug) {
    return NextResponse.json({ erro: 'slug nao encontrado' }, { status: 400 })
  }

  const { error } = await supabase
    .from('presentes')
    .update({ status: 'pago' })
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}