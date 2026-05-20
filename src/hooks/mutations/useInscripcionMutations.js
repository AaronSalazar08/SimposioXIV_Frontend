import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inscribirseEvento, cancelarInscripcion } from '../../api/inscripciones'
import { queryKeys } from '../../constants/queryKeys'
import { ESTADO_CANCELADO } from '../../constants/inscripciones'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { patchEventoTrasInscripcion } from '../../utils/eventoCupos'

export function useInscripcionMutations({ appliedFilters, showFeedback }) {
  const queryClient = useQueryClient()

  const inscribirMutation = useMutation({
    mutationFn: (evento) => inscribirseEvento(evento.id),
    onSuccess: (inscripcion, evento) => {
      queryClient.setQueryData(queryKeys.misInscripciones(), (prev = []) => {
        const sin = prev.filter((i) => i.evento_id !== evento.id)
        return [...sin, inscripcion]
      })
      queryClient.setQueryData(queryKeys.eventos(appliedFilters), (prev = []) =>
        prev.map((e) => (e.id === evento.id ? patchEventoTrasInscripcion(e, -1) : e)),
      )
      showFeedback({
        type: 'success',
        message: `Te inscribiste a "${evento.titulo}".`,
        eventoId: evento.id,
      })
    },
    onError: (err, evento) => {
      showFeedback({
        type: 'error',
        message: getApiErrorMessage(err, 'No se pudo inscribir.'),
        eventoId: evento.id,
      })
    },
  })

  const cancelarMutation = useMutation({
    mutationFn: ({ inscripcionId }) => cancelarInscripcion(inscripcionId),
    onSuccess: (_, { inscripcionId, evento }) => {
      queryClient.setQueryData(queryKeys.misInscripciones(), (prev = []) =>
        prev.map((i) =>
          i.id === inscripcionId ? { ...i, estado: ESTADO_CANCELADO } : i,
        ),
      )
      queryClient.setQueryData(queryKeys.eventos(appliedFilters), (prev = []) =>
        prev.map((e) => (e.id === evento.id ? patchEventoTrasInscripcion(e, 1) : e)),
      )
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      showFeedback({
        type: 'success',
        message: `Cancelaste tu inscripción a "${evento.titulo}".`,
        eventoId: evento.id,
      })
    },
    onError: (err, { evento }) => {
      showFeedback({
        type: 'error',
        message: getApiErrorMessage(err, 'No se pudo cancelar la inscripción.'),
        eventoId: evento.id,
      })
    },
  })

  return { inscribirMutation, cancelarMutation }
}
