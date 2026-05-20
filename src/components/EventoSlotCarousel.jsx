import { Children, useCallback, useState } from 'react'

/**
 * Carrusel horizontal para varios eventos en el mismo horario.
 * Un solo slide no muestra flechas ni puntos.
 *
 * `initialIndex` solo aplica al montar; el padre puede forzar remount con `key` para saltar a un slide (p. ej. error de inscripción en paralelo).
 */
export default function EventoSlotCarousel({ children, initialIndex = 0 }) {
  const slides = Children.toArray(children).filter(Boolean)
  const count = slides.length
  const [index, setIndex] = useState(initialIndex)
  const maxIdx = Math.max(0, count - 1)
  const activeIndex = count === 0 ? 0 : Math.min(index, maxIdx)

  const go = useCallback(
    (dir) => {
      if (count <= 1) return
      setIndex((i) => {
        const cur = Math.min(i, count - 1)
        return (cur + dir + count) % count
      })
    },
    [count],
  )

  if (count === 0) return null

  if (count === 1) {
    return <div className="w-full max-w-xl mx-auto min-w-0">{slides[0]}</div>
  }

  return (
    <div className="relative w-full min-w-0">
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-x-hidden overflow-y-visible">
        <div
          className="flex items-start transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="w-full shrink-0 basis-full min-w-0 self-start px-2 sm:px-4 py-3 box-border"
              aria-hidden={i !== activeIndex}
            >
              <div className="max-w-xl mx-auto w-full min-w-0">{slide}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => go(-1)}
          className="p-2 rounded-lg border border-gray-200 bg-white text-ucr-blue-dark hover:bg-gray-50 shadow-sm transition-colors"
          aria-label="Evento anterior"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Seleccionar evento en este horario">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Evento ${i + 1} de ${count}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-6 bg-ucr-blue' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="p-2 rounded-lg border border-gray-200 bg-white text-ucr-blue-dark hover:bg-gray-50 shadow-sm transition-colors"
          aria-label="Siguiente evento"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-gray-500 mt-1">
        {activeIndex + 1} / {count} en este horario
      </p>
    </div>
  )
}
