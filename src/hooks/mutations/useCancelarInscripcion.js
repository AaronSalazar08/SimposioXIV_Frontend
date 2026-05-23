import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarInscripcion } from '../../api/inscripciones'
import { queryKeys } from '../../constants/queryKeys'
import { ESTADO_CANCELADO } from '../../constants/inscripciones'
export function useCancelarInscripcion({ onSuccess, onError }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inscripcion) => cancelarInscripcion(inscripcion.id),
    onSuccess: (_, inscripcion) => {
      queryClient.setQueryData(queryKeys.misInscripciones(), (prev = []) =>
        prev.map((i) =>
          i.id === inscripcion.id ? { ...i, estado: ESTADO_CANCELADO } : i,
        ),
      )
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      onSuccess?.(inscripcion)
    },
    onError: (err, inscripcion) => {
      onError?.(err, inscripcion)
    },
  })
}
