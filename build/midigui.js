'use strict';

function n(n){return n=n||Object.create(null),{on:function(t,o){(n[t]||(n[t]=[])).push(o);},off:function(t,o){var u=n[t]||(n[t]=[]);u.splice(u.indexOf(o)>>>0,1);},emit:function(t,o){(n[t]||[]).map(function(n){n(o);}),(n["*"]||[]).map(function(n){n(t,o);});}}}var mitt=n;

function css(element, style) {
  for (var k in style) {
    element.style[k] = style[k];
  }
}

var colors = {
  primary: '#ffffff',
  primary2: 'rgba(255, 255, 255, 0.4)',
  highlight: '#00f3e4',
  recording: '#dc3737',
  background: '#000000',
  background2: '#191919'
};

function container() {
  var el = document.createElement('div');
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
  });
  return { dom: el };
}

function header() {
  var el = document.createElement('div');
  css(el, {
    'width': '100%',
    'border': 'none',
    'color': colors.background,
    'padding': '10px',
    'box-sizing': 'border-box',
    'background': colors.highlight
  });

  el.textContent = 'midigui';

  return { dom: el };
}

var defaultOpts$1 = {
  name: 'No name',
  value: 0
};

function controller(opts) {
  opts = Object.assign({}, defaultOpts$1, opts);

  var emit = opts.emit;
  var container = document.createElement('div');

  var label = document.createElement('p');
  var input = document.createElement('p');
  var slider = document.createElement('div');
  var thumb = document.createElement('div');

  var attachement = null;
  var value = 0;
  var selected = false;

  var api = {
    dom: container,
    select: select,
    deselect: deselect,
    affect: affect
  };

  css(container, {
    'background': colors.background,
    // 'border-top': '1px solid black',
    'box-sizing': 'border-box',
    'padding': '10px 10px 20px 10px'
  });

  css(label, {
    'display': 'inline-block',
    'margin-right': '5px'
  });

  css(input, {
    'display': 'inline-block',
    'color': colors.primary2
  });

  css(slider, {
    'margin': '0',
    'width': '100%',
    'height': '1px',
    'background': 'rgba(255, 255, 255, 0.15)'
  });

  css(thumb, {
    'width': '10%',
    'height': '100%',
    'background': colors.highlight
  });

  container.addEventListener('mouseenter', function () {
    if (!selected) container.style.background = colors.background2;
    container.style.cursor = 'pointer';
  });

  container.addEventListener('mouseleave', function () {
    if (!selected) container.style.background = colors.background;
  });

  container.addEventListener('click', function () {
    if (opts.onclick) opts.onclick(api);
  });

  updateInputName();
  updateValue(opts.value);

  label.textContent = opts.name;
  slider.appendChild(thumb);

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(slider);

  function select() {
    selected = true;
    container.style.background = colors.recording;
  }

  function deselect() {
    selected = false;
    container.style.background = colors.background;
  }

  function updateValue(val) {
    value = val;
    thumb.style.width = value * 100 + '%';
    emit(opts.name, Math.round(val * 127));
  }

  function updateInputName() {
    var content = '';
    if (attachement) {
      content += attachement.inputName + ' - ' + (attachement.event === 'noteOn' ? 'Note' : 'CC') + ' ' + attachement.pitch;
    } else {
      content += 'no input';
    }
    input.textContent = content;
  }

  function onInput(msg) {
    if (msg.channel !== attachement.channel || msg.pitch !== attachement.pitch) return;
    updateValue(msg.velocity / 127);
  }

  function affect(bus, inputName, event, msg) {
    if (attachement && attachement.bus) attachement.bus.off(attachement.event, onInput);
    bus.on(event, onInput);
    attachement = {};
    attachement.bus = bus;
    attachement.inputName = inputName;
    attachement.event = event;
    attachement.pitch = msg.pitch;
    attachement.channel = msg.channel;
    updateInputName();
    onInput(msg);
  }

  return api;
}

function message(channel, pitch, velocity) {
  return {
    channel: channel,
    pitch: pitch,
    velocity: velocity
  };
}

var supported = !!navigator.requestMIDIAccess;

var PACKETS = {
  noteOn: 0x80,
  noteOff: 0x90
};

function bus(input, output) {
  if (!supported) return null;
  if (!input && !output) {
    throw new Error('A bus needs a least an input or an output device');
  }

  var emitter = mitt();
  if (input) input.onmidimessage = onMessage;

  emitter.send = send;
  emitter.destroy = destroy;
  return emitter;

  function onMessage(e) {
    var cmd = e.data[0] >> 4;
    var msg = message(e.data[0] & 0xf, e.data[1], e.data[2]);

    if (cmd === 8 || cmd === 9 && msg.velocity === 0) {
      // noteOff
      emitter.emit('noteOff', msg);
    } else if (cmd === 9) {
      // noteOn
      emitter.emit('noteOn', msg);
    } else if (cmd === 11) {
      // controller message
      emitter.emit('controllerChange', msg);
    } else {
      // sysex or other
      emitter.emit('sysex', e);
    }
  }

  function send(cmd, msg) {
    if (!output) return;
    output.send([PACKETS[cmd] ? PACKETS[cmd] + msg.channel : msg.channel, msg.pitch, msg.velocity]);
  }

  function destroy() {
    if (input) input.onmidimessage = undefined;
    input = undefined;
    output = undefined;
    emitter.on = undefined;
    emitter.off = undefined;
    emitter.emit = undefined;
    emitter = undefined;
  }
}

var _isReady = false;
var inputs = [];
var outputs = [];

function access(cb) {
  if (!supported) return null;
  if (_isReady) return cb(null);
  navigator.requestMIDIAccess().then(function (res) {
    res.inputs.forEach(function (el) {
      return inputs.push(el);
    });
    res.outputs.forEach(function (el) {
      return outputs.push(el);
    });
    _isReady = true;
    cb(null);
  }, function () {
    cb(new Error('No access to your midi devices.'));
  });
}

var defaultOpts = {
  append: true,
  key: 'm',
  visible: true
};

function midigui(opts) {
  if (!supported) throw new Error('Web MIDI API not supported on this browser');
  opts = Object.assign({}, defaultOpts, opts);

  var emitter = mitt();
  emitter.add = add;
  emitter.show = show;
  emitter.hide = hide;

  var ready = false;
  var dom = {};

  var container$$1 = void 0,
      selectedController = void 0;
  var controllers = {};
  var visible = !!opts.visible;

  access(function () {
    setupDom();
    setupInputs();
    ready = true;
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === opts.key) {
      if (visible) hide();else show();
    }
  });

  return emitter;

  function setupDom() {
    container$$1 = container();
    visible ? show() : hide();
    container$$1.dom.appendChild(header().dom);
    for (var k in controllers) {
      var controller$$1 = controllers[k];
      container$$1.dom.appendChild(controller$$1.dom);
    }
    if (opts.append) document.body.appendChild(container$$1.dom);
  }

  function setupInputs() {
    inputs.forEach(function (input) {
      var bus$$1 = bus(input);
      bus$$1.on('noteOn', function (msg) {
        return onInput(bus$$1, input.name, 'noteOn', msg);
      });
      bus$$1.on('controllerChange', function (msg) {
        return onInput(bus$$1, input.name, 'controllerChange', msg);
      });
    });
  }

  function add(name, opts) {
    if (controllers[name]) {
      throw new Error('There is already a controller named ' + name);
    }
    opts = Object.assign({}, opts, { name: name, onclick: onControllerSelected, emit: emitter.emit });
    var controller$$1 = controller(opts);
    controllers[name] = controller$$1;
    if (ready) dom.main.appendChild(controller$$1);
    return emitter;
  }

  function onControllerSelected(controller$$1) {
    if (selectedController) selectedController.deselect();
    if (selectedController !== controller$$1) {
      controller$$1.select();
      selectedController = controller$$1;
    } else {
      selectedController = undefined;
    }
  }

  function onInput(bus$$1, inputName, event, msg) {
    if (selectedController) {
      selectedController.affect(bus$$1, inputName, event, msg);
      selectedController.deselect();
      selectedController = undefined;
    }
  }

  function hide() {
    container$$1.dom.style.display = 'none';
    visible = false;
  }

  function show() {
    container$$1.dom.style.display = 'block';
    visible = true;
  }
}

module.exports = midigui;
