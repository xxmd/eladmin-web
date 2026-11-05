const files = import.meta.glob('/src/assets/icons/svg/*.svg')
export default Object.keys(files).map(path => path.split('/').pop().replace(/\.svg$/, ''))
