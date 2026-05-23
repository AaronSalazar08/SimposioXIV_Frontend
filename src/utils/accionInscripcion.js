export function isAccionEnCurso(accion, eventoId, tipo) {
  return accion?.eventoId === eventoId && accion?.tipo === tipo
}
