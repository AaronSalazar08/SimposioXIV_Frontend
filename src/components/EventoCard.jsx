const TIPO_STRIP = {
  apertura: 'bg-emerald-500',
  clausura: 'bg-rose-500',
  taller:   'bg-amber-500',
  charla:   'bg-sky-500',
}

const TIPO_BADGE = {
  apertura: 'text-emerald-700 bg-emerald-50',
  clausura: 'text-rose-700 bg-rose-50',
  taller:   'text-amber-700 bg-amber-50',
  charla:   'text-sky-700 bg-sky-50',
}

const TIPO_LABELS = {
  apertura: 'Apertura',
  clausura: 'Clausura',
  taller:   'Taller',
  charla:   'Charla',
}

const formatHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function EventoCard({
  evento,
  onInscribirse,
  onCancelar,
  inscribiendo = false,
  cancelando = false,
  inscripcionId = null,
}) {
  const inscrito = !!inscripcionId || !!evento.usuario_inscrito
  const sinCupos = !evento.tiene_capacidad_disponible
  const tipo = evento.tipo

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow">

      {/* Franja de color superior — indica tipo visualmente */}
      <div className={`h-1.5 flex-shrink-0 ${TIPO_STRIP[tipo] ?? 'bg-gray-300'}`} />

      <div className="flex flex-col flex-1 p-4">

        {/* Fila 1: badge tipo + número de día — altura fija */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${TIPO_BADGE[tipo] ?? 'text-gray-600 bg-gray-100'}`}>
            {TIPO_LABELS[tipo] ?? tipo}
          </span>
          {evento.horario?.numero_dia && (
            <span className="text-[11px] text-gray-400 font-medium">Día {evento.horario.numero_dia}</span>
          )}
        </div>

        {/* Fila 2: título — siempre 2 líneas */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.625rem] mb-1">
          {evento.titulo}
        </h3>

        {/* Fila 3: descripción — siempre 2 líneas */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-2">
          {evento.descripcion ?? ''}
        </p>

        {/* Fila 3: áreas — altura fija, sin wrapping */}
        <div className="h-5 flex items-center gap-1.5 overflow-hidden mb-4">
          {evento.areas?.map((a) => (
            <span
              key={a.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white flex-shrink-0"
              style={{ backgroundColor: a.color || '#64748B' }}
            >
              {a.nombre}
            </span>
          ))}
        </div>

        {/* Separador flexible — absorbe diferencias y empuja el resto al fondo */}
        <div className="flex-1" />

        {/* Bloque de meta — horario, aula, ponente */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 mb-3">
          {evento.horario && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="capitalize truncate">
                {formatFecha(evento.horario.hora_inicio)} · {formatHora(evento.horario.hora_inicio)}–{formatHora(evento.horario.hora_fin)}
              </span>
            </div>
          )}
          {evento.horario?.aula && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}</span>
            </div>
          )}
          {evento.ponente && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">
                {evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`}
              </span>
            </div>
          )}
        </div>

        {/* Footer: cupos + acción */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
          <span className="text-xs flex-shrink-0">
            <span className={`font-bold ${sinCupos ? 'text-rose-500' : 'text-emerald-600'}`}>
              {evento.cupos_disponibles}
            </span>
            <span className="text-gray-400"> / {evento.capacidad} cupos</span>
          </span>

          {inscrito ? (
            <button
              onClick={() => onCancelar?.(inscripcionId, evento)}
              disabled={cancelando || inscripcionId === -1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              {cancelando ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar inscripción'
              )}
            </button>
          ) : (
            <button
              onClick={() => onInscribirse?.(evento)}
              disabled={inscribiendo || sinCupos}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              {inscribiendo ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Inscribiendo...
                </>
              ) : sinCupos ? (
                'Sin cupos'
              ) : (
                'Inscribirse'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
