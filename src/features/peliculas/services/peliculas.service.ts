import { tmdb } from '@/core/api/tmdb'
import type { Pagina } from '@/shared/models/pagina'
import type { DetallePelicula, Genero, Orden, Pelicula } from '../models/pelicula'

// El servicio: funciones que hablan con la API. Los componentes nunca arman URLs.
// Axios ya convierte la respuesta a JSON y lanza error si el estado no es 2xx.

export interface FiltrosListado {
  pagina: number
  genero?: number
  orden?: Orden
}

// /discover filtra por género y ordena, pero NO busca por texto
export async function descubrir({ pagina, genero, orden = 'popularity.desc' }: FiltrosListado, signal?: AbortSignal) {
  const { data } = await tmdb.get<Pagina<Pelicula>>('/discover/movie', {
    params: {
      page: pagina,
      with_genres: genero, // si es undefined, Axios no lo manda
      sort_by: orden,
      // Sin esto, "mejor calificadas" se llena de películas con un solo voto
      'vote_count.gte': orden === 'vote_average.desc' ? 300 : undefined,
      // Evita estrenos futuros en "más recientes"
      'primary_release_date.lte': orden === 'primary_release_date.desc' ? hoy() : undefined,
      include_adult: false,
    },
    signal,
  })
  return data
}

// /search busca por texto, pero NO acepta género ni orden (limitación de TMDB)
export async function buscar(texto: string, pagina: number, signal?: AbortSignal) {
  const { data } = await tmdb.get<Pagina<Pelicula>>('/search/movie', {
    params: { query: texto, page: pagina, include_adult: false },
    signal,
  })
  return data
}

// append_to_response: reparto, videos y similares en UNA sola petición
export async function obtenerDetalle(id: number, signal?: AbortSignal) {
  const { data } = await tmdb.get<DetallePelicula>(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,similar', include_video_language: 'es,en' },
    signal,
  })
  return data
}

export async function obtenerGeneros(signal?: AbortSignal) {
  const { data } = await tmdb.get<{ genres: Genero[] }>('/genre/movie/list', { signal })
  return data.genres
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}
