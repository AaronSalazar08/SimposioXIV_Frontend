/**
 * Actualiza cupos e inscripción local tras inscribir o cancelar.
 * @param {object} evento
 * @param {number} deltaCupos positivo al cancelar (+1 cupo), negativo al inscribir (-1 cupo)
 */
export function patchEventoTrasInscripcion(evento, deltaCupos) {
  const cupos = Math.max(0, evento.cupos_disponibles + deltaCupos)
  return {
    ...evento,
    numero_inscritos: Math.max(0, evento.numero_inscritos - deltaCupos),
    cupos_disponibles: cupos,
    tiene_capacidad_disponible: cupos > 0,
    usuario_inscrito: deltaCupos < 0,
  }
}
