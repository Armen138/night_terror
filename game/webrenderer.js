/* eslint-disable arrow-parens */
/* eslint-disable no-control-regex */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
// import Vorpal from 'vorpal';
// import chalk from 'chalk';

class WebRenderer {
  constructor() {
    // this.vorpal = Vorpal();
    this.container = document.querySelector('#game');
    this.messages = [];
    this.title = '';
    this.commands = {};
  }

  show() {
    const noop = () => {
      this.input.focus();
      window.scrollTo(0, document.body.scrollHeight);
    };
    this.input = document.querySelector('#prompt');
    const cleanInput = this.input.cloneNode(true);
    this.input.parentNode.replaceChild(cleanInput, this.input);
    this.input = cleanInput;
    this.input.addEventListener('keydown', (e) => {
      if (e.keyCode === 9) { // tab
        e.preventDefault();
        const input = this.input.value.split(' ');
        const command = input.shift();
        const args = input.join(' ');
        if (input.length === 0) {
          const search = Object.keys(this.commands).filter(item => item.startsWith(command));
          this.input.value = search.length > 0 ? search[0] : this.input.value;
        } else {
          const haystack = this.autocomplete(command)();
          if (haystack) {
            const search = haystack.filter(item => item.startsWith(args));
            this.input.value = search.length > 0 ? `${command} ${search[0]}` : this.input.value;
          }
        }
      }
      if (e.keyCode === 13) {
        const input = this.input.value.split(' ');
        const command = input.shift();
        const args = input.join(' ');
        this.text(`${this.title}${this.input.value}`);
        this.input.value = '';
        if (!this.commands[command]) {
          if (this.commands.help) {
            this.text(this.commands.help());
          }
        } else {
          this.commands[command](args, noop);
        }
      }
    });

    // const prompt = document.createElement('div');
    // prompt.innerHTML = this.title;
    // this.container.appendChild(prompt);
    noop();
  }

  prompt(promptString) {
    this.title = `[${promptString}]$ `;
    document.querySelector('#delimiter').innerHTML = this.title;
  }

  clear() {
    this.messages = [];
    this.container.innerHTML = '';
  }

  register(commands, autocomplete) {
    this.autocomplete = autocomplete;
    this.commands = commands;
  }

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

  text(text, style, source) {
    const prefix = source ? this.style(`${source} `, { color: 'magenta' }) : '';
    this.messages.push(prefix + this.style(text, style));
    const message = document.createElement('div');
    message.innerHTML = prefix + this.style(text, style);
    this.container.appendChild(message);
  }
}

export default WebRenderer;
