'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const SUGESTOES = [
  'Pai, tem tanta coisa que eu queria ter te dito e nunca disse. Obrigado por tudo que você fez por mim, mesmo quando eu não percebia.',
  'Você sempre foi meu exemplo. Cada conselho seu, cada sacrifício que fez por nós, eu carrego comigo. Te amo, pai.',
  'Olhando pra trás, vejo o quanto você se dedicou pra gente. Hoje eu só quero dizer: obrigado por ser esse pai incrível.',
]

function useCountdown(alvo: string) {
  const [tempo, setTempo] = useState({ dias: 0, horas: 0, minutos: 0 })
  useEffect(() => {
    function atualizar() {
      const diff = new Date(alvo).getTime() - Date.now()
      if (diff <= 0) { setTempo({ dias: 0, horas: 0, minutos: 0 }); return }
      setTempo({ dias: Math.floor(diff / 86400000), horas: Math.floor((diff % 86400000) / 3600000), minutos: Math.floor((diff % 3600000) / 60000) })
    }
    atualizar()
    const id = setInterval(atualizar, 60000)
    return () => clearInterval(id)
  }, [alvo])
  return tempo
}

function PreviaAnimada() {
  const [passo, setPasso] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setPasso(p => (p + 1) % 3), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-full max-w-xs mx-auto rounded-2xl px-5 py-6 flex flex-col items-center text-center mb-10" style={{ background: 'linear-gradient(180deg, #2b1d16 0%, #1a120d 100%)', border: '1px solid #6b4a35' }}>
      <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: '#d99a6c' }}>uma homenagem</p>
      <p className="font-serif text-lg mb-3" style={{ color: '#f3e4d4' }}>Para Seu Pai</p>
      <div className="w-full aspect-[4/3] rounded-xl mb-3 flex items-center justify-center transition-opacity duration-700" style={{ background: '#3a2a20', opacity: passo === 0 ? 1 : 0.4 }}><span style={{ color: '#8a6a52' }}>❤</span></div>
      <p className="text-xs leading-relaxed mb-3 transition-opacity duration-700" style={{ color: '#dcc4ae', opacity: passo === 1 ? 1 : 0.4 }}>"Você sempre foi meu exemplo..."</p>
      <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-[10px] transition-opacity duration-700" style={{ background: 'rgba(217,154,108,0.15)', border: '1px solid #d99a6c', color: '#e8b384', opacity: passo === 2 ? 1 : 0.4 }}>♪ tocando a música</div>
    </div>
  )
}

export default function Home() {
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [musica, setMusica] = useState('')
  const [fotos, setFotos] = useState<FileList | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [contador, setContador] = useState<number | null>(null)
  const tempo = useCountdown('2026-08-09T00:00:00-03:00')

  useEffect(() => {
    async function carregar() {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const { count } = await supabase.from('presentes').select('*', { count: 'exact', head: true }).gte('criado_em', hoje.toISOString())
      setContador(count ?? 0)
    }
    carregar()
  }, [])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)

    const slug = nome.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)

    const { data: presente, error } = await supabase.from('presentes').insert({ nome_pai: nome, mensagem, musica_url: musica, slug }).select().single()

    if (error || !presente) {
      alert('Deu erro ao criar: ' + error?.message)
      setEnviando(false)
      return
    }

    if (fotos) {
      for (let i = 0; i < fotos.length; i++) {
        const arquivo = fotos[i]
        const caminho = `${presente.id}/${i}-${arquivo.name}`
        await supabase.storage.from('fotos-presentes').upload(caminho, arquivo)
        const { data: urlData } = supabase.storage.from('fotos-presentes').getPublicUrl(caminho)
        await supabase.from('fotos').insert({ presente_id: presente.id, url: urlData.publicUrl, ordem: i })
      }
    }

    await supabase.from('presentes').update({ status: 'pago' }).eq('slug', slug)
    window.location.href = `/sucesso?demo=${slug}`
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16" style={{ background: 'linear-gradient(180deg, #1a120d 0%, #0d0906 100%)' }}>

      <div className="w-full max-w-md text-center mb-4">
        <p className="text-[10px] tracking-[0.2em] uppercase mb-3 font-medium" style={{ color: '#d99a6c' }}>dia dos pais</p>
        <h1 className="text-4xl font-serif mb-3 leading-tight" style={{ color: '#f3e4d4' }}>Crie uma homenagem pro seu pai</h1>
        <p className="text-sm font-light mb-4" style={{ color: '#a3866e' }}>Fotos, uma mensagem e a música que ele ama, tudo em uma página só pra ele.</p>

        <div className="flex items-center justify-center gap-3 mb-2">
          {[{ v: tempo.dias, l: 'dias' }, { v: tempo.horas, l: 'horas' }, { v: tempo.minutos, l: 'min' }].map(item => (
            <div key={item.l} className="rounded-xl px-4 py-2" style={{ background: '#140d0a', border: '1px solid #4a3324' }}>
              <p className="text-lg font-serif" style={{ color: '#f3e4d4' }}>{item.v}</p>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: '#a3866e' }}>{item.l}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: '#8a6a52' }}>até o Dia dos Pais</p>

        {contador !== null && contador > 0 && (
          <p className="text-[11px] mt-4" style={{ color: '#d99a6c' }}>✦ {contador} homenagem(ns) criada(s) hoje</p>
        )}
      </div>

      <PreviaAnimada />

      <form onSubmit={enviar} className="w-full max-w-md rounded-3xl px-6 py-8 flex flex-col gap-5" style={{ background: 'linear-gradient(180deg, #2b1d16 0%, #1a120d 100%)', border: '1px solid #6b4a35', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

        <div className="flex flex-col gap-2 text-left">
          <label className="text-[11px] tracking-wide uppercase" style={{ color: '#d99a6c' }}>nome do pai</label>
          <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Danilo" className="rounded-xl px-4 py-3 text-sm outline-none" style={{ background: '#140d0a', border: '1px solid #4a3324', color: '#f3e4d4' }} />
        </div>

        <div className="flex flex-col gap-2 text-left">
          <label className="text-[11px] tracking-wide uppercase" style={{ color: '#d99a6c' }}>mensagem / memória</label>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} required rows={4} placeholder="Escreva algo que você nunca falou pra ele..." className="rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: '#140d0a', border: '1px solid #4a3324', color: '#f3e4d4' }} />
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px]" style={{ color: '#8a6a52' }}>Não sabe o que escrever? Use uma sugestão:</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGESTOES.map((s, i) => (
                <button key={i} type="button" onClick={() => setMensagem(s)} className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(217,154,108,0.1)', border: '1px solid #4a3324', color: '#d99a6c' }}>sugestão {i + 1}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-left">
          <label className="text-[11px] tracking-wide uppercase" style={{ color: '#d99a6c' }}>música (link do Spotify ou YouTube)</label>
          <input value={musica} onChange={e => setMusica(e.target.value)} placeholder="https://..." className="rounded-xl px-4 py-3 text-sm outline-none" style={{ background: '#140d0a', border: '1px solid #4a3324', color: '#f3e4d4' }} />
        </div>

        <div className="flex flex-col gap-2 text-left">
          <label className="text-[11px] tracking-wide uppercase" style={{ color: '#d99a6c' }}>fotos</label>
          <label className="rounded-xl px-4 py-8 text-sm flex flex-col items-center justify-center gap-2 cursor-pointer" style={{ background: '#140d0a', border: '1px dashed #6b4a35', color: '#a3866e' }}>
            <span>{fotos && fotos.length > 0 ? `${fotos.length} foto(s) selecionada(s)` : 'Toque para escolher as fotos'}</span>
            <input type="file" multiple accept="image/*" onChange={e => setFotos(e.target.files)} className="hidden" />
          </label>
        </div>

        <button type="submit" disabled={enviando} className="rounded-full py-3 text-sm font-medium mt-2" style={{ background: enviando ? '#6b4a35' : '#d99a6c', color: '#1a120d' }}>
          {enviando ? 'Criando...' : 'Criar presente — R$ 19,90'}
        </button>
      </form>

    </main>
  )
}
