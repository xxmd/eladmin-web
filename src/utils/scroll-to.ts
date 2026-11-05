export function scrollTo(top: number, _duration?: number) {
  window.scrollTo({ top, behavior: 'smooth' })
}
