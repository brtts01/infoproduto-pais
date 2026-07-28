import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== 'pai2026seguro') {
    return NextResponse.json({ erro: 'token invalido' }, { status: 401 })
  }

  const body = await req.json()

  console.log('BODY COMPLETO:', JSON.stringify(body))

  const order = body.order ?? body
  const status = order?.order_status
  const slug = order?.TrackingParameters?.s1

  console.log('status:', status, 'slug:', slug)

  if (status !== 'paid') {
    return NextResponse.json({ ok: true, ignorado: true, status_recebido: status })
  }

  if (!slug) {
    return NextResponse.json({ erro: 'slug nao encontrado' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('presentes')
    .update({ status: 'pago' })
    .eq('slug', slug)
    .select()

  console.log('resultado do update:', data, 'erro:', error)

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, linhas_atualizadas: data?.length ?? 0 })
}