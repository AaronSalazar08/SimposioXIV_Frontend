import { useQuery } from '@tanstack/react-query'
import { fetchMisInscripciones } from '../../api/inscripciones'
import { queryKeys } from '../../constants/queryKeys'

export function useMisInscripciones() {
  return useQuery({
    queryKey: queryKeys.misInscripciones(),
    queryFn: fetchMisInscripciones,
  })
}
