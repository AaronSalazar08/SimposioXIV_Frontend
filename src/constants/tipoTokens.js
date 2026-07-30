/**
 * Tokens por tipo de evento: `spine` es el acento vivo (franja del ticket),
 * `chip` es el fondo oscuro y sobrio de la etiqueta (sin brillo).
 */
export const TIPO_TOKEN = {
  apertura: { spine: 'bg-tipo-apertura', chip: 'bg-tipo-apertura-ink' },
  clausura: { spine: 'bg-tipo-clausura', chip: 'bg-tipo-clausura-ink' },
  taller: { spine: 'bg-tipo-taller', chip: 'bg-tipo-taller-ink' },
  charla: { spine: 'bg-tipo-charla', chip: 'bg-ucr-blue-darker' },
}

export const TIPO_TOKEN_DEFAULT = { spine: 'bg-slate-400', chip: 'bg-slate-700' }
