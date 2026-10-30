import { CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EsqueletoGrilla } from '@/shared/components/EsqueletoGrilla'
import { MensajeError } from '@/shared/components/MensajeError'
import { Paginador } from '@/shared/components/Paginador'
import { MAX_PAGINAS } from '@/shared/models/pagina'
import { GrillaPeliculas } from '../components/GrillaPeliculas'
import { useEstrenos } from '../hooks/usePeliculas'
import { proximoEstreno } from '../models/pelicula'

// Códigos de país que TMDB recibe en `region`
const PAISES = [
  { valor: 'VE', texto: 'Venezuela' },
  { valor: 'MX', texto: 'México' },
  { valor: 'ES', texto: 'España' },
  { valor: 'US', texto: 'Estados Unidos' },
]

// Página CONTENEDORA, como el catálogo: guarda país y página, el hook trae los datos.
export function Estrenos() {
  const [pais, setPais] = useState('VE')
  const [pagina, setPagina] = useState(1)

  const { datos: respuesta, error, cargando, reintentar } = useEstrenos(pagina, pais)

  // Al cambiar de país volvemos a la página 1, en el manejador del evento
  function cambiarPais(p: string) {
    setPais(p)
    setPagina(1)
  }
  function irAPagina(nueva: number) {
    setPagina(nueva)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Datos derivados: se calculan en cada render, no van en otro useState
  const totalPaginas = Math.min(respuesta?.total_pages ?? 0, MAX_PAGINAS)
  const proximo = respuesta && proximoEstreno(respuesta.results)

  return (
    <section>
      <title>Próximos estrenos · Cartelera</title>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Próximos estrenos</h1>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">País</span>
          <Select value={pais} onValueChange={cambiarPais}>
            <SelectTrigger className="w-44" aria-label="País">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAISES.map((p) => (
                <SelectItem key={p.valor} value={p.valor}>
                  {p.texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <MensajeError mensaje={error} onReintentar={reintentar} />
      ) : cargando || !respuesta ? (
        <EsqueletoGrilla />
      ) : (
        <>
          {proximo && (
            <p className="mb-6 flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
              <CalendarClock className="size-4 shrink-0 text-primary" />
              {proximo.dias === 0 ? (
                <span>
                  <strong>{proximo.pelicula.title}</strong> se estrena hoy
                </span>
              ) : (
                <span>
                  El próximo estreno es <strong>{proximo.pelicula.title}</strong> en {proximo.dias}{' '}
                  {proximo.dias === 1 ? 'día' : 'días'}
                </span>
              )}
            </p>
          )}
          <GrillaPeliculas peliculas={respuesta.results} />
          <Paginador pagina={pagina} totalPaginas={totalPaginas} onCambiar={irAPagina} />
        </>
      )}
    </section>
  )
}
