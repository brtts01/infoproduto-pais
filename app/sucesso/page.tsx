'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Sucesso() {
  const [status, setStatus] = useState<'aguardando' | 'pago' | 'erro'>('aguardando')
  const [slug, setSlug] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('ultimo_slug')
    if (!s) { setStatus('erro'); return }
    setSlug(s)

    const id = setInterval(async () => {
      const { data } = await supabase.from('presentes').select('status').eq('slug', s).single()
      if (data?.status === 'pago') { setStatus('pago'); clearInterval(id) }
    }, 2000)

    return () => clearInterval(id)
  }, [])

  function copiarLink() {
    if (!slug) return
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (status === 'erro') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)', color: '#f3e4d4' }}>
        <div>
          <p className="mb-4">Não encontramos seu presente. Se você já pagou, o link chegou no seu e-mail da Kiwify.</p>
          <a href="/" className="text-sm underline" style={{ color: '#d99a6c' }}>Voltar ao início</a>
        </div>
      </main>
    )
  }

  if (status === 'aguardando') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)' }}>
        <div>
          <p className="text-2xl mb-3" style={{ color: '#e8b384' }}>❤</p>
          <p style={{ color: '#f3e4d4' }}>Confirmando seu pagamento...</p>
          <p className="text-xs mt-2" style={{ color: '#a3866e' }}>Isso leva só alguns segundos</p>
        </div>
      </main>
    )
  }

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}&color=f3e4d4&bgcolor=1a120d`

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)' }}>
      <div className="w-full max-w-md rounded-3xl px-6 py-10 flex flex-col items-center text-center" style={{ background: 'linear-gradient(180deg, #2b1d16 0%, #1a120d 100%)', border: '1px solid #6b4a35', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <span className="text-2xl mb-3" style={{ color: '#e8b384' }}>❤</span>
        <p className="text-[10px] tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: '#d99a6c' }}>presente pronto</p>
        <h1 className="text-2xl font-serif mb-6" style={{ color: '#f3e4d4' }}>Já pode enviar pro seu pai</h1>
        <div className="p-3 rounded-2xl mb-6" style={{ background: '#140d0a', border: '1px solid #4a3324' }}>
          <img src={qrSrc} alt="QR code do presente" className="rounded-lg" width={200} height={200} />
        </div>
        <p className="text-xs mb-2" style={{ color: '#a3866e' }}>Ou envie o link direto</p>
        <div className="w-full flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: '#140d0a', border: '1px solid #4a3324' }}>
          <span className="flex-1 text-xs truncate text-left" style={{ color: '#dcc4ae' }}>{link}</span>
          <button onClick={copiarLink} className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0" style={{ background: '#d99a6c', color: '#1a120d' }}>{copiado ? 'Copiado!' : 'Copiar'}</button>
        </div>
        <a href={link} target="_blank" className="text-xs underline underline-offset-2" style={{ color: '#d99a6c' }}>Ver como vai ficar →</a>
      </div>
    </main>
  )
}