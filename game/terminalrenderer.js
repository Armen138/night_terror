/* eslint-disable arrow-parens */
/* eslint-disable no-control-regex */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
import Vorpal from 'vorpal';
import chalk from 'chalk';

class TerminalRenderer {
  constructor() {
    this.vorpal = Vorpal();
  }

  show() {
    this.vorpal.show();
  }

  prompt(promptString) {
    this.vorpal.delimiter(`[${promptString}]$`);
  }

  clear() {
    this.vorpal.log('\u001B[2J\u001B[0;0f');
  }

  register(commands, autocomplete) {
    for (const command in commands) {
      if (command === 'help') {
        this.vorpal.help(cmd => commands[command](cmd));
      } else {
        const cmd = this.vorpal.command(`${command} [arg...]`, command)
          .action((args, callback) => {
            const arg = args.arg ? args.arg.join(' ') : null;
            commands[command](arg, callback);
          });
        if (autocomplete) {
          cmd.autocomplete(autocomplete(command));
        }
      }
    }
  }

  style(text, style) {
    let value = text;
    if (style && style['text-align'] && (style['text-align'] === 'center' || style['text-align'] === 'right')) {
      const terminalWidth = process.stdout.columns;
      const divider = style['text-align'] === 'center' ? 2 : 1;
      const lines = value.split('\n');
      const aligned = [];
      for (let line of lines) {
        const lineLength = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').length;
        if (lineLength < terminalWidth) {
          const spacer = ' '.repeat((terminalWidth - lineLength) / divider);
          line = spacer + line;
          if (style['text-align'] === 'center') {
            line += spacer;
          }
        }
        aligned.push(line);
      }
      value = aligned.join('\n');
    }
    if (style && (style.color || style.background)) {
      let colored = chalk;
      if (style.color) {
        if (style.color.startsWith('#')) {
          colored = colored.hex(style.color);
        } else {
          colored = colored[style.color];
        }
      }
      if (style.background) {
        if (style.background.startsWith('#')) {
          colored = colored.bgHex(style.background);
        } else {
          colored = colored[`bg${style.background[0].toUpperCase() + style.background.substr(1)}`];
        }
      }
      return colored(value);
    }
    return value;
  }

  text(text, style) {
    this.vorpal.log(this.style(text, style));
  }
}

export default TerminalRenderer;
