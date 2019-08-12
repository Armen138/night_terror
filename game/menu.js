/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import fs from 'fs';
import yaml from 'js-yaml';
import Events from './events.js';

class Menu extends Events {
  constructor(fileName, renderer) {
    super();
    this.renderer = renderer;
    this.data = {};
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        this.emit('error');
      } else {
        this.data = yaml.safeLoad(data);
        this.emit('ready');
      }
    });
    this.commands = {
      play: this.play.bind(this),
      load: this.load.bind(this),
      save: this.save.bind(this),
      help: this.help.bind(this),
    };
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
    this.renderer.text(this.data.header.text, this.data.header.style, true);
    this.renderer.text(this.data.title.text, this.data.title.style, true);
    this.renderer.text(this.subtitle, this.data.subtitle.style, true);
    this.renderer.text(this.help());
    this.renderer.prompt(this.prompt);
    this.renderer.show();
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
