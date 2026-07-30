import { Children, useCallback, useRef, useState } from 'react'
import { cx } from '../utils/cx'

const DESKTOP_VISIBLE = 3
const DESKTOP_PEEK_FRACTION = 0.16
const MOBILE_SLIDE_PERCENT = 82
const MOBILE_PEEK_PERCENT = (100 - MOBILE_SLIDE_PERCENT) / 2
const SWIPE_RATIO_THRESHOLD = 0.18
const DRAG_START_PX = 12
const EASE_CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)'

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

  const translate = `calc(-${activeIndex * MOBILE_SLIDE_PERCENT}% + ${MOBILE_PEEK_PERCENT}% + ${dragOffsetPx}px)`

  return (
    <div className="relative w-full min-w-0">
      <div
        ref={viewportRef}
        className="rounded-2xl overflow-x-hidden overflow-y-visible select-none border border-ucr-blue/10 bg-ucr-blue/[0.03]"
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
          className="flex items-start"
          style={{
            transform: `translateX(${translate})`,
            transition: isDragging ? 'none' : `transform 380ms ${EASE_CURVE}`,
          }}
        >
          {slides.map((slide, i) => {
            const isActive = i === activeIndex
            return (
              <div
                key={i}
                className="shrink-0 min-w-0 self-start px-1.5 sm:px-2.5 py-3 box-border"
                style={{
                  flex: `0 0 ${MOBILE_SLIDE_PERCENT}%`,
                  maxWidth: `${MOBILE_SLIDE_PERCENT}%`,
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1)' : 'scale(0.93)',
                  transition: isDragging ? 'none' : `opacity 380ms ${EASE_CURVE}, transform 380ms ${EASE_CURVE}`,
                }}
                aria-hidden={!isActive}
              >
                <div className="max-w-xl mx-auto w-full min-w-0">{slide}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => go(-1)}
          className="p-2 rounded-xl text-white bg-gradient-to-br from-ucr-blue to-ucr-blue-darker shadow-card transition-transform duration-200 ease-out hover:scale-105 hover:shadow-ticket-hover active:scale-95"
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
              className={cx(
                'h-2 w-6 origin-left rounded-full transition-transform duration-300 ease-out',
                i === activeIndex ? 'scale-x-100 bg-gradient-to-r from-brand-cyan to-ucr-blue' : 'scale-x-[0.33] bg-ucr-blue/20',
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="p-2 rounded-xl text-white bg-gradient-to-br from-ucr-blue to-ucr-blue-darker shadow-card transition-transform duration-200 ease-out hover:scale-105 hover:shadow-ticket-hover active:scale-95"
          aria-label="Siguiente evento"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-center text-sm mt-1 font-mono-accent text-ucr-blue/50">
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

  // La ventana muestra `visible` tarjetas completas más un asomo (peek) de la
  // siguiente, para que al mover con las flechas se note que hay más contenido.
  const innerWidthPercent = (count / (visible + DESKTOP_PEEK_FRACTION)) * 100
  const slideWidthPercentOfInner = 100 / count
  const translatePercent = activeIndex * slideWidthPercentOfInner

  const rangeStart = activeIndex + 1
  const rangeEnd = Math.min(activeIndex + visible, count)

  return (
    <div className="relative w-full min-w-0">
      <div
        className="rounded-2xl overflow-hidden border border-ucr-blue/10 bg-ucr-blue/[0.03]"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 92%, transparent 100%)',
          maskImage: 'linear-gradient(to right, #000 0%, #000 92%, transparent 100%)',
        }}
      >
        <div
          className="flex items-stretch"
          style={{
            width: `${innerWidthPercent}%`,
            transform: `translateX(-${translatePercent}%)`,
            transition: `transform 380ms ${EASE_CURVE}`,
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
          className="p-2 rounded-xl text-white bg-gradient-to-br from-ucr-blue to-ucr-blue-darker shadow-card transition-transform duration-200 ease-out hover:scale-105 hover:shadow-ticket-hover active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          aria-label="Ver eventos anteriores"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm tabular-nums min-w-[7rem] text-center font-mono-accent text-ucr-blue/50">
          Mostrando {rangeStart}–{rangeEnd} de {count}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={activeIndex >= maxIndex}
          className="p-2 rounded-xl text-white bg-gradient-to-br from-ucr-blue to-ucr-blue-darker shadow-card transition-transform duration-200 ease-out hover:scale-105 hover:shadow-ticket-hover active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
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
    return <div className="w-full max-w-xl min-w-0">{slides[0]}</div>
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
