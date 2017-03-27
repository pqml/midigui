import css from '../utils/css'

import { selectIcon } from '../utils/icons'

const defaultOpts = {
  inputs: []
}

function deviceSelector (opts) {
  opts = Object.assign({}, defaultOpts, opts)

  const el = document.createElement('select')
  css(el, {
    'position': 'relative',
    'overflow': 'hidden',
    'width': '100%',
    'border': 'none',
    'color': 'white',
    '-webkit-appearance': 'none',
    'border-radius': '1px',
    'font-size': '1em',
    'padding': '10px 30px 10px 10px',
    'background': 'black url("' + selectIcon + '") 98% 50% no-repeat'
  })

  opts.inputs.forEach(input => {
    console.log(input)
    const option = document.createElement('option')
    option.value = input.id
    option.textContent = input.name + ' (' + input.manufacturer + ')'
    el.appendChild(option)
  })

  if (opts.onChange) el.addEventListener('change', opts.onChange)

  return { dom: el }
}

export default deviceSelector
