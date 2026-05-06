const TIPO_LABELS = {
  apertura: 'Apertura',
  clausura: 'Clausura',
  taller: 'Taller',
  charla: 'Charla',
}

const TIPO_COLORS = {
  apertura: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  clausura: 'bg-rose-100 text-rose-700 border-rose-200',
  taller: 'bg-amber-100 text-amber-800 border-amber-200',
  charla: 'bg-sky-100 text-sky-800 border-sky-200',
}

const formatHora = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatFecha = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
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
  const tipoLabel = TIPO_LABELS[tipo] ?? tipo
  const tipoColor = TIPO_COLORS[tipo] ?? 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Header con tipo + día */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2">
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tipoColor}`}>
          {tipoLabel}
        </span>
        {evento.horario?.numero_dia && (
          <span className="text-[11px] text-gray-500 font-medium">
            Día {evento.horario.numero_dia}
          </span>
        )}
      </div>

      {/* Título y descripción */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-bold text-ucr-blue-dark leading-snug">{evento.titulo}</h3>
        {evento.descripcion && (
          <p className="text-sm text-gray-600 mt-1.5 line-clamp-3">{evento.descripcion}</p>
        )}
      </div>

      {/* Áreas */}
      {evento.areas?.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {evento.areas.map((a) => (
            <span
              key={a.id}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: a.color || '#64748B' }}
            >
              {a.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Datos del horario, aula y ponente */}
      <div className="px-5 py-3 mt-auto bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
        {evento.horario && (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="capitalize">
              {formatFecha(evento.horario.hora_inicio)} · {formatHora(evento.horario.hora_inicio)}-{formatHora(evento.horario.hora_fin)}
            </span>
          </div>
        )}
        {evento.horario?.aula && (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}
            </span>
          </div>
        )}
        {evento.ponente && (
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>
              {evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`}
            </span>
          </div>
        )}
      </div>

      {/* Footer con cupos y CTA */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="text-xs">
          <span className={`font-bold ${sinCupos ? 'text-rose-600' : 'text-emerald-600'}`}>
            {evento.cupos_disponibles}
          </span>
          <span className="text-gray-500"> / {evento.capacidad} cupos</span>
        </div>

        {inscrito ? (
          <button
            onClick={() => onCancelar?.(inscripcionId, evento)}
            disabled={cancelando}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {cancelando ? (
              <>
                <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
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
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-ucr-blue text-white hover:bg-ucr-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
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
  )
}
