import { Children, useCallback, useRef, useState } from 'react'

const DESKTOP_VISIBLE = 3
const SWIPE_RATIO_THRESHOLD = 0.18
const DRAG_START_PX = 12

/** Móvil: un evento por slide, con arrastre horizontal. */
function MobileCarousel({ slides, initialIndex }) {
  const count = slides.length
  const [index, setIndex] = useState(initialIndex)
  const maxIdx = count - 1
  const activeIndex = Math.min(index, maxIdx)

  const viewportRef = useRef(null)
  const dragRef = useRef({
    tracking: false,
    active: false,
    startX: 0,
    startY: 0,
    offsetPx: 0,
    width: 1,
    pointerId: null,
  })
  const [dragOffsetPx, setDragOffsetPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const go = useCallback(
    (dir) => {
      setIndex((i) => {
        const cur = Math.min(i, count - 1)
        return (cur + dir + count) % count
      })
    },
    [count],
  )

  const finishDrag = useCallback(() => {
    const { offsetPx, width } = dragRef.current
    const threshold = width * SWIPE_RATIO_THRESHOLD

    if (offsetPx < -threshold) go(1)
    else if (offsetPx > threshold) go(-1)

    dragRef.current = {
      tracking: false,
      active: false,
      startX: 0,
      startY: 0,
      offsetPx: 0,
      width: 1,
      pointerId: null,
    }
    setIsDragging(false)
    setDragOffsetPx(0)
  }, [go])

  const onPointerDown = (e) => {
    if (count <= 1 || e.button !== 0) return
    const viewport = viewportRef.current
    if (!viewport) return

    dragRef.current = {
      tracking: true,
      active: false,
      startX: e.clientX,
      startY: e.clientY,
      offsetPx: 0,
      width: viewport.offsetWidth || 1,
      pointerId: e.pointerId,
    }
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag.tracking) return

    const viewport = viewportRef.current
    if (!viewport) return

    const deltaX = e.clientX - drag.startX
    const deltaY = e.clientY - drag.startY

    if (!drag.active) {
      if (Math.abs(deltaX) < DRAG_START_PX) return
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        dragRef.current.tracking = false
        return
      }
      viewport.setPointerCapture(e.pointerId)
      dragRef.current = { ...drag, active: true }
      setIsDragging(true)
    }

    dragRef.current.offsetPx = deltaX
    setDragOffsetPx(deltaX)
  }

  const onPointerEnd = () => {
    const drag = dragRef.current
    if (!drag.tracking) return
    if (drag.active) finishDrag()
    else {
      dragRef.current = {
        tracking: false,
        active: false,
        startX: 0,
        startY: 0,
        offsetPx: 0,
        width: 1,
        pointerId: null,
      }
    }
  }

  const translate = `calc(-${activeIndex * 100}% + ${dragOffsetPx}px)`

  return (
    <div className="relative w-full min-w-0">
      <div
        ref={viewportRef}
        className="rounded-2xl overflow-x-hidden overflow-y-visible touch-pan-y select-none"
        style={{ background: 'rgba(0,93,164,0.03)', border: '1px solid rgba(0,93,164,0.08)' }}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Deslizá horizontalmente para ver otros eventos en este horario"
      >
        <div
          className={`flex items-start ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
          style={{ transform: `translateX(${translate})` }}
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
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 2px 8px 0 rgba(0,93,164,0.25)', color: '#fff' }}
          aria-label="Evento anterior"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
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
              className="h-2 rounded-full transition-all duration-300"
              style={
                i === activeIndex
                  ? { width: '1.5rem', background: 'linear-gradient(90deg, #21BBEF, #005DA4)' }
                  : { width: '0.5rem', background: 'rgba(0,93,164,0.2)' }
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 2px 8px 0 rgba(0,93,164,0.25)', color: '#fff' }}
          aria-label="Siguiente evento"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-center text-sm mt-1 font-mono-accent" style={{ color: 'rgba(0,93,164,0.5)' }}>
        {activeIndex + 1} / {count} en este horario · deslizá para cambiar
      </p>
    </div>
  )
}

/** Escritorio: ventana de 3 tarjetas, desplazamiento de 1 en 1. */
function DesktopWindowCarousel({ slides, initialIndex }) {
  const count = slides.length
  const visible = DESKTOP_VISIBLE
  const maxIndex = Math.max(0, count - visible)
  const [index, setIndex] = useState(() => Math.min(initialIndex, maxIndex))
  const activeIndex = Math.min(index, maxIndex)

  const go = (dir) => {
    setIndex((i) => Math.max(0, Math.min(maxIndex, i + dir)))
  }

  const innerWidthPercent = (count / visible) * 100
  const slideWidthPercentOfInner = 100 / count
  const translatePercent = activeIndex * slideWidthPercentOfInner

  const rangeStart = activeIndex + 1
  const rangeEnd = Math.min(activeIndex + visible, count)

  return (
    <div className="relative w-full min-w-0">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,93,164,0.03)', border: '1px solid rgba(0,93,164,0.08)' }}>
        <div
          className="flex items-stretch transition-transform duration-300 ease-out"
          style={{
            width: `${innerWidthPercent}%`,
            transform: `translateX(-${translatePercent}%)`,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="shrink-0 box-border px-2 py-3 min-w-0 self-start"
              style={{ width: `${slideWidthPercentOfInner}%` }}
            >
              <div className="w-full min-w-0">{slide}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={activeIndex === 0}
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 2px 8px 0 rgba(0,93,164,0.25)', color: '#fff' }}
          aria-label="Ver eventos anteriores"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm tabular-nums min-w-[7rem] text-center font-mono-accent" style={{ color: 'rgba(0,93,164,0.5)' }}>
          Mostrando {rangeStart}–{rangeEnd} de {count}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={activeIndex >= maxIndex}
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 2px 8px 0 rgba(0,93,164,0.25)', color: '#fff' }}
          aria-label="Ver más eventos"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/** Escritorio: 2 o 3 eventos visibles a la vez, sin carrusel. */
function DesktopGrid({ slides }) {
  const count = slides.length
  const cols = count === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`grid ${cols} gap-5 w-full min-w-0 items-start`}>
      {slides.map((slide, i) => (
        <div key={i} className="min-w-0">
          {slide}
        </div>
      ))}
    </div>
  )
}

/**
 * Eventos en el mismo horario.
 * - Móvil: carrusel de 1 en 1 (si hay más de uno).
 * - Escritorio ≤3: grilla con todas las tarjetas visibles.
 * - Escritorio >3: ventana de 3, avanza de a una.
 */
export default function EventoSlotCarousel({ children, initialIndex = 0 }) {
  const slides = Children.toArray(children).filter(Boolean)
  const count = slides.length
  const safeInitial = count === 0 ? 0 : Math.min(initialIndex, count - 1)

  if (count === 0) return null

  if (count === 1) {
    return <div className="w-full max-w-xl mx-auto min-w-0">{slides[0]}</div>
  }

  const useDesktopGrid = count <= DESKTOP_VISIBLE

  return (
    <>
      <div className="md:hidden">
        <MobileCarousel slides={slides} initialIndex={safeInitial} />
      </div>

      <div className="hidden md:block">
        {useDesktopGrid ? (
          <DesktopGrid slides={slides} />
        ) : (
          <DesktopWindowCarousel slides={slides} initialIndex={safeInitial} />
        )}
      </div>
    </>
  )
}
