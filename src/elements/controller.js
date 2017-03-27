import css from '../utils/css'
import colors from '../config/colors'

const defaultOpts = {
  name: 'No name',
  value: 0
}

function controller (opts) {
  opts = Object.assign({}, defaultOpts, opts)

  const emit = opts.emit
  const container = document.createElement('div')

  const label = document.createElement('p')
  const input = document.createElement('p')
  const slider = document.createElement('div')
  const thumb = document.createElement('div')

  let attachement = null
  let value = 0
  let selected = false

  const api = {
    dom: container,
    select,
    deselect,
    affect
  }

  css(container, {
    'background': colors.background,
    // 'border-top': '1px solid black',
    'box-sizing': 'border-box',
    'padding': '10px 10px 20px 10px'
  })

  css(label, {
    'display': 'inline-block',
    'margin-right': '5px'
  })

  css(input, {
    'display': 'inline-block',
    'color': colors.primary2
  })

  css(slider, {
    'margin': '0',
    'width': '100%',
    'height': '1px',
    'background': 'rgba(255, 255, 255, 0.15)'
  })

  css(thumb, {
    'width': '10%',
    'height': '100%',
    'background': colors.highlight
  })

  container.addEventListener('mouseenter', () => {
    if (!selected) container.style.background = colors.background2
    container.style.cursor = 'pointer'
  })

  container.addEventListener('mouseleave', () => {
    if (!selected) container.style.background = colors.background
  })

  container.addEventListener('click', () => {
    if (opts.onclick) opts.onclick(api)
  })

  updateInputName()
  updateValue(opts.value)

  label.textContent = opts.name
  slider.appendChild(thumb)

  container.appendChild(label)
  container.appendChild(input)
  container.appendChild(slider)

  function select () {
    selected = true
    container.style.background = colors.recording
  }

  function deselect () {
    selected = false
    container.style.background = colors.background
  }

  function updateValue (val) {
    value = val
    thumb.style.width = (value * 100) + '%'
    emit(opts.name, Math.round(val * 127))
  }

  function updateInputName () {
    let content = ''
    if (attachement) {
      content += attachement.inputName + ' - ' +
        (attachement.event === 'noteOn' ? 'Note' : 'CC') + ' ' +
        attachement.pitch
    } else {
      content += 'no input'
    }
    input.textContent = content
  }

  function onInput (msg) {
    if (msg.channel !== attachement.channel || msg.pitch !== attachement.pitch) return
    updateValue(msg.velocity / 127)
  }

  function affect (bus, inputName, event, msg) {
    if (attachement && attachement.bus) attachement.bus.off(attachement.event, onInput)
    bus.on(event, onInput)
    attachement = {}
    attachement.bus = bus
    attachement.inputName = inputName
    attachement.event = event
    attachement.pitch = msg.pitch
    attachement.channel = msg.channel
    updateInputName()
    onInput(msg)
  }

  return api
}

export default controller
