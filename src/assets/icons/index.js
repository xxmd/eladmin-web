const icons = import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default', eager: true })
const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
sprite.setAttribute('aria-hidden', 'true')
sprite.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
for (const [path, source] of Object.entries(icons)) {
  const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement
  const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
  symbol.id = `icon-${path.split('/').pop().replace('.svg', '')}`
  symbol.setAttribute('viewBox', svg.getAttribute('viewBox') || `0 0 ${parseFloat(svg.getAttribute('width')) || 1024} ${parseFloat(svg.getAttribute('height')) || 1024}`)
  while (svg.firstChild) symbol.appendChild(svg.firstChild)
  sprite.appendChild(symbol)
}
document.body.appendChild(sprite)
