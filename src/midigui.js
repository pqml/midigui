import mitt from 'mitt'
import createContainer from './elements/container'
import createHeader from './elements/header'
import createController from './elements/controller'
import * as midi from 'midibus'

const defaultOpts = {
  append: true,
  key: 'm',
  visible: true
}

function midigui (opts) {
  if (!midi.supported) throw new Error('Web MIDI API not supported on this browser')
  opts = Object.assign({}, defaultOpts, opts)

  const emitter = mitt()
  emitter.add = add
  emitter.show = show
  emitter.hide = hide

  let ready = false
  let dom = {}

  let container, selectedController
  let controllers = {}
  let visible = !!opts.visible

  midi.access(() => {
    setupDom()
    setupInputs()
    ready = true
  })

  document.addEventListener('keyup', e => {
    if (e.key === opts.key) {
      if (visible) hide()
      else show()
    }
  })

  return emitter

  function setupDom () {
    container = createContainer()
    visible ? show() : hide()
    container.dom.appendChild(createHeader().dom)
    for (let k in controllers) {
      const controller = controllers[k]
      container.dom.appendChild(controller.dom)
    }
    if (opts.append) document.body.appendChild(container.dom)
  }

  function setupInputs () {
    midi.inputs.forEach(input => {
      const bus = midi.bus(input)
      bus.on('noteOn', msg => onInput(bus, input.name, 'noteOn', msg))
      bus.on('controllerChange', msg => onInput(bus, input.name, 'controllerChange', msg))
    })
  }

  function add (name, opts) {
    if (controllers[name]) {
      throw new Error('There is already a controller named ' + name)
    }
    opts = Object.assign(
      {},
      opts,
      { name, onclick: onControllerSelected, emit: emitter.emit }
    )
    const controller = createController(opts)
    controllers[name] = controller
    if (ready) dom.main.appendChild(controller)
    return emitter
  }

  function onControllerSelected (controller) {
    if (selectedController) selectedController.deselect()
    if (selectedController !== controller) {
      controller.select()
      selectedController = controller
    } else {
      selectedController = undefined
    }
  }

  function onInput (bus, inputName, event, msg) {
    if (selectedController) {
      selectedController.affect(bus, inputName, event, msg)
      selectedController.deselect()
      selectedController = undefined
    }
  }

  function hide () {
    container.dom.style.display = 'none'
    visible = false
  }

  function show () {
    container.dom.style.display = 'block'
    visible = true
  }
}

export default midigui
