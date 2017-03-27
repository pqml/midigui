import css from '../utils/css'
import colors from '../config/colors'

function header () {
  const el = document.createElement('div')
  css(el, {
    'width': '100%',
    'border': 'none',
    'color': colors.background,
    'padding': '10px',
    'box-sizing': 'border-box',
    'background': colors.highlight
  })

  el.textContent = 'midigui'

  return { dom: el }
}

export default header
