import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PresenteCard from './PresenteCard'

export default async function Presente({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: presente } = await supabase.from('presentes').select('*, fotos(*)').eq('slug', slug).single()

  if (!presente) return notFound()

  if (presente.status !== 'pago') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)', color: '#f3e4d4' }}>
        <p>Este presente ainda não foi liberado.</p>
      </main>
    )
  }

  const fotos = presente.fotos?.sort((a: any, b: any) => a.ordem - b.ordem) ?? []

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)' }}>
      <PresenteCard presente={presente} fotos={fotos} />
    </main>
  )
}