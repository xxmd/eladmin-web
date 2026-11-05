export type TimeInput = Date | string | number | null | undefined
export function parseTime(time?: TimeInput, cFormat = '{y}-{m}-{d} {h}:{i}:{s}'): string {
  if (time == null || time === 'null') return ''
  if (typeof time === 'string' && /^\d+$/.test(time)) time = Number(time)
  if (typeof time === 'number' && String(time).length === 10) time *= 1000
  const date = time instanceof Date ? time : new Date(time)
  if (Number.isNaN(date.getTime())) return ''
  const parts: Record<string, number> = { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), i: date.getMinutes(), s: date.getSeconds(), a: date.getDay() }
  return cFormat.replace(/{(y|m|d|h|i|s|a)+}/g, (_match, key: string) => key === 'a' ? ['日','一','二','三','四','五','六'][parts[key]] : String(parts[key]).padStart(2, '0'))
}
export function formatTime(time: string | number, option?: string): string {
  const stamp = String(time).length === 10 ? Number(time) * 1000 : Number(time)
  const d = new Date(stamp)
  const diff = (Date.now() - stamp) / 1000
  if (diff < 30) return '刚刚'
  if (diff < 3600) return Math.ceil(diff / 60) + '分钟前'
  if (diff < 86400) return Math.ceil(diff / 3600) + '小时前'
  if (diff < 172800) return '1天前'
  return option ? parseTime(stamp, option) : `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`
}
export function getQueryObject(url = window.location.href): Record<string, string> {
  const query = url.substring(url.lastIndexOf('?') + 1)
  return Object.fromEntries(new URLSearchParams(query))
}
export function byteLength(str: string): number { return new TextEncoder().encode(str).length }
export function cleanArray<T>(actual: T[]): NonNullable<T>[] { return actual.filter(Boolean) as NonNullable<T>[] }
export function param(json?: Record<string, string | number | boolean | undefined>): string {
  return json ? Object.entries(json).filter(([, value]) => value !== undefined).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&') : ''
}
export function param2Obj(url: string): Record<string, string> { return Object.fromEntries(new URLSearchParams(url.split('?')[1] || '')) }
export function html2Text(value: string): string { const element = document.createElement('div'); element.innerHTML = value; return element.textContent || element.innerText }
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export function objectMerge(target: JsonValue | undefined, source: JsonValue): JsonValue {
  if (Array.isArray(source)) return source.slice()
  if (source === null || typeof source !== 'object') return source
  const result: Record<string, JsonValue> = target && typeof target === 'object' && !Array.isArray(target) ? target : {}
  for (const [key, value] of Object.entries(source)) result[key] = objectMerge(result[key], value)
  return result
}
export function toggleClass(element: HTMLElement | null, className: string): void { element?.classList.toggle(className) }
export function getTime(type: string): number | Date { return type === 'start' ? Date.now() - 86400000 * 90 : new Date(new Date().toDateString()) }
export function debounce<Args extends unknown[], Result>(func: (...args: Args) => Result, wait: number, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let result: Result | undefined
  return function(this: unknown, ...args: Args): Result | undefined {
    const callNow = immediate && timer === undefined
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => { timer = undefined; if (!immediate) result = func.apply(this, args) }, wait)
    if (callNow) result = func.apply(this, args)
    return result
  }
}
export function deepClone<T>(source: T): T {
  if (Array.isArray(source)) return source.map(value => deepClone(value)) as T
  if (source instanceof Date) return new Date(source.getTime()) as T
  if (source !== null && typeof source === 'object') return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, deepClone(value)])) as T
  return source
}
export function uniqueArr<T>(arr: T[]): T[] { return Array.from(new Set(arr)) }
export function createUniqueString(): string { return (+(Math.floor((1 + Math.random()) * 65536).toString() + Date.now())).toString(32) }
export function hasClass(element: HTMLElement, cls: string): boolean { return element.classList.contains(cls) }
export function addClass(element: HTMLElement, cls: string): void { element.classList.add(cls) }
export function removeClass(element: HTMLElement, cls: string): void { element.classList.remove(cls) }
export function regEmail(email: string): string | undefined {
  const [name, host] = email.split('@'); return host ? `${name.slice(0, 3)}${'*'.repeat(Math.max(0, name.length - 3))}@${host}` : undefined
}
export function regMobile(mobile: string): string | undefined { return mobile.length > 7 ? mobile.slice(0, 3) + '****' + mobile.slice(7) : undefined }
export function downloadFile(content: BlobPart, name: string, suffix: string): void {
  const url = URL.createObjectURL(new Blob([content])); const link = document.createElement('a')
  link.href = url; link.download = `${parseTime(new Date())}-${name}.${suffix}`; link.style.display = 'none'
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
}
