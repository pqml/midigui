import css from '../utils/css'
import colors from '../config/colors'

function container () {
  const el = document.createElement('div')
  css(el, {
    'position': 'fixed',
    'top': '10px',
    'left': '10px',
    'z-index': '9999',
    'background': colors.background,
    'color': colors.primary,
    'font-family': 'sans-serif',
    'width': '300px',
    // 'border': '1px solid black',
    'font-size': '11px'
  })
  return { dom: el }
}

export default container
