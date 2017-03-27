function css (element, style) {
  for (var k in style) {
    element.style[k] = style[k]
  }
}

export default css
