'use client'

import { useState, useEffect, useRef } from 'react'

function getEmbed(url: string) {
  if (!url) return null
  const spotify = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  if (spotify) return { tipo: 'spotify', src: `https://open.spotify.com/embed/track/${spotify[1]}?autoplay=1` }
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return { tipo: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&playsinline=1` }
  return null
}

export default function PresenteCard({ presente, fotos }: { presente: any; fotos: any[] }) {
  const [revelado, setRevelado] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const capa = fotos[0]
  const resto = fotos.slice(1)
  const embed = getEmbed(presente.musica_url)

  useEffect(() => {
    const chave = `ja_revelado_${presente.slug}`
    if (localStorage.getItem(chave)) {
      setRevelado(true)
    }
  }, [presente.slug])

  function revelar() {
    setRevelado(true)
    localStorage.setItem(`ja_revelado_${presente.slug}`, '1')
  }

  async function baixarImagem() {
    if (!cardRef.current) return
    setBaixando(true)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#1a120d', useCORS: true })
    const link = document.createElement('a')
    link.download = `presente-${presente.nome_pai}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setBaixando(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div ref={cardRef} className="w-full rounded-3xl px-6 py-10 flex flex-col items-center text-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #2b1d16 0%, #1a120d 100%)', border: '1px solid #6b4a35', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

        {!revelado && (
          <button onClick={revelar} className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-md" style={{ background: 'rgba(26,18,13,0.85)' }}>
            <span style={{ color: '#e8b384' }} className="text-2xl">❤</span>
            <span style={{ color: '#f3e4d4' }} className="text-sm tracking-wide">Toque para ver</span>
          </button>
        )}

        <p className="text-[10px] tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: '#d99a6c' }}>uma homenagem</p>

        <h1 className="text-4xl font-serif mb-1 leading-tight" style={{ color: '#f3e4d4' }}>Para {presente.nome_pai}</h1>

        <div className="w-10 h-px my-6" style={{ background: '#6b4a35' }} />

        {capa && (
          <img src={capa.url} alt="" className={`w-full aspect-[4/3] object-cover rounded-2xl mb-3 transition-all duration-700 ${revelado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ border: '1px solid rgba(217,154,108,0.3)' }} />
        )}

        {resto.length > 0 && (
          <div className="w-full grid grid-cols-3 gap-2 mb-8">
            {resto.map((foto: any, i: number) => (
              <img key={foto.id} src={foto.url} alt="" className={`w-full aspect-square object-cover rounded-xl transition-all duration-700 ${revelado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ border: '1px solid rgba(217,154,108,0.3)', transitionDelay: revelado ? `${(i + 1) * 150}ms` : '0ms' }} />
            ))}
          </div>
        )}

        <p className={`whitespace-pre-wrap leading-relaxed text-[17px] font-light mb-8 transition-opacity duration-700 ${revelado ? 'opacity-100' : 'opacity-0'}`} style={{ color: '#dcc4ae', transitionDelay: revelado ? '400ms' : '0ms' }}>{presente.mensagem}</p>

        {revelado && embed && (
          <div className="w-full rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(217,154,108,0.3)' }}>
            {embed.tipo === 'spotify' ? (
              <iframe src={embed.src} width="100%" height="152" allow="autoplay; encrypted-media" style={{ border: 0 }} />
            ) : (
              <iframe src={embed.src} width="100%" height="200" allow="autoplay; encrypted-media" style={{ border: 0 }} />
            )}
          </div>
        )}

        {revelado && !embed && presente.musica_url && (
          <a href={presente.musica_url} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(217,154,108,0.15)', border: '1px solid #d99a6c', color: '#e8b384' }}>♪ Ouvir a música</a>
        )}

        <p className="text-[11px] mt-6 tracking-wide" style={{ color: '#8a6a52' }}>Feito com carinho, Dia dos Pais 2026</p>

        <a href="/" className="text-[11px] mt-3 underline underline-offset-2" style={{ color: '#d99a6c' }}>Criar a sua também →</a>
      </div>

      {revelado && (
        <button onClick={baixarImagem} disabled={baixando} className="text-xs px-4 py-2 rounded-full" style={{ background: 'rgba(217,154,108,0.1)', border: '1px solid #4a3324', color: '#d99a6c' }}>
          {baixando ? 'Baixando...' : '↓ Baixar como imagem'}
        </button>
      )}
    </div>
  )
}