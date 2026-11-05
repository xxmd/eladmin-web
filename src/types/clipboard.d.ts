declare module 'clipboard' {
  export default class Clipboard {
    constructor(trigger: Element, options: { text: () => string })
    on(event: 'success' | 'error', handler: () => void): this
    off(event: 'success' | 'error'): this
    destroy(): void
    onClick(event: Event): void
  }
}
