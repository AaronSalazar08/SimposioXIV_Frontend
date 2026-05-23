import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Estado con auto-limpieza tras `duration` ms.
 * @template T
 */
export function useTimedFeedback(initialValue = null, duration = 5000) {
  const [feedback, setFeedback] = useState(initialValue)
  const timeoutRef = useRef(null)

  const clearFeedback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setFeedback(null)
  }, [])

  const showFeedback = useCallback(
    (value) => {
      clearFeedback()
      setFeedback(value)
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        timeoutRef.current = null
      }, duration)
    },
    [clearFeedback, duration],
  )

  useEffect(() => () => clearFeedback(), [clearFeedback])

  return { feedback, showFeedback, clearFeedback, setFeedback }
}
