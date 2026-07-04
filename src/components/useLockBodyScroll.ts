import { useEffect } from 'react'

/** Prevents the page behind a modal sheet from scrolling while mounted. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const scrollY = window.scrollY
    const { style } = document.body
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    }

    style.position = 'fixed'
    style.top = `-${String(scrollY)}px`
    style.width = '100%'
    style.overflow = 'hidden'

    return () => {
      style.position = previous.position
      style.top = previous.top
      style.width = previous.width
      style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
    }
  }, [])
}
