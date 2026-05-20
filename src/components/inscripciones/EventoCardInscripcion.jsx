import EventoCard from '../EventoCard'
import { isAccionEnCurso } from '../../utils/accionInscripcion'

export default function EventoCardInscripcion({
  evento,
  inscripcionesPorEvento,
  accion,
  feedback,
  onInscribirse,
  onCancelar,
}) {
  const inscripcion = inscripcionesPorEvento.get(evento.id)
  const inscribiendo = isAccionEnCurso(accion, evento.id, 'inscribir')
  const cancelando = isAccionEnCurso(accion, evento.id, 'cancelar')
  const mensajeAccion =
    feedback?.eventoId === evento.id
      ? { type: feedback.type, message: feedback.message }
      : null

  return (
    <EventoCard
      evento={evento}
      inscripcionId={inscripcion?.id ?? null}
      inscribiendo={inscribiendo}
      cancelando={cancelando}
      mensajeAccion={mensajeAccion}
      onInscribirse={onInscribirse}
      onCancelar={onCancelar}
    />
  )
}
