/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Events from './events.js';

class Menu extends Events {
  constructor(data, renderer) {
    super();
    this.renderer = renderer;
    this.data = data;
    this.commands = {
      play: this.play.bind(this),
      load: this.load.bind(this),
      save: this.save.bind(this),
      help: this.help.bind(this),
    };
    if (this.data.exclude) {
      for (const exclude of this.data.exclude) {
        delete this.commands[exclude];
      }
    }
    this.renderer.register(this.commands);
  }

  get subtitle() {
    const index = Math.floor(Math.random() * this.data.subtitle.text.length);
    return this.data.subtitle.text[index];
  }

  get prompt() {
    return this.data.prompt;
  }

  render() {
    this.renderer.clear();
    this.renderer.text(this.data.header.text, this.data.header.style);
    this.renderer.text(this.data.title.text, this.data.title.style);
    this.renderer.text(this.subtitle, this.data.subtitle.style);
    this.renderer.text(this.help());
    this.renderer.prompt(this.prompt);
    this.renderer.show();

    // for fancy front-ends
    this.emit('menu', { data: this.data, commands: this.commands });
  }

  help(cmd) {
    let help = '';
    switch (cmd) {
      case 'play':
        help = 'Play game';
        break;
      default: {
        const commands = Object.keys(this.commands).map(item => this.renderer.style(` ${item} `, { color: 'black', background: 'yellow' }));
        help = this.renderer.style(commands.join(' '), { 'text-align': 'center' });
        break;
      }
    }
    return help;
  }

  play(args, callback) {
    this.emit('play');
    callback();
  }

  load(args, callback) {
    this.emit('load');
    this.renderer.text('load');
    callback();
  }

  save(args, callback) {
    this.emit('save');
    this.renderer.text('save');
    callback();
  }
}

export default Menu;
