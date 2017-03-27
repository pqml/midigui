# midigui
:mag_right::musical_keyboard:  A controller and gui for the Web MIDI API

<br><br>

![Demo](https://github.com/pqml/midigui/raw/master/demo.gif)

#### :globe_with_meridians: Example available on [http://pqml.github.io/midigui/](http://pqml.github.io/midigui/) :globe_with_meridians:

<br><br>

### Installation & Usage

##### Installation from npm
```sh
# using npm
$ npm install --save midigui

# or using yarn
$ yarn add midigui
```

##### Usage with a module bundler
```js
// using ES6 module
import midigui from 'midigui'

// using CommonJS module
var midigui = require('midigui')
```

##### Usage from a browser

```html
<script src="https://unpkg.com/midigui"></script>
<script>
</script>
```

<br><br>

### Example
```js
const midigui = require('midigui')
const controller = midigui()
  .add('pitch')
  .add('attack')
  .add('release')

controller.on('pitch', value => console.log(value))
```

<br><br>

### License
MIT.