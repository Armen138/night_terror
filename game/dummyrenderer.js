/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */

class DummyRenderer {
  show() {}

  prompt() {}

  clear() {}

  register() {}

  style(text, style) {
    if (!text) return '';
    let elementType = 'span';
    if (style && style['text-align']) {
      elementType = 'div';
    }
    const span = document.createElement(elementType);
    let styleAttribute = '';
    for (const item in style) {
      if (Object.prototype.hasOwnProperty.call(style, item)) {
        styleAttribute += `${item}:${style[item]};`;
      }
    }
    span.setAttribute('style', styleAttribute);
    span.innerHTML = text.replace(/\n/g, '<br>');
    return span.outerHTML;
  }

  text() {}
}

export default DummyRenderer;
