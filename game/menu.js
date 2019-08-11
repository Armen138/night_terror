/* eslint-disable import/extensions */
import * as vorpal from 'vorpal';
import chalk from 'chalk';
import banner from './banner.js';
import titles from './titles.js';

const Vorpal = vorpal.default;

const Menu = (game) => {
  const menu = Vorpal();
  menu.history('menu-command-history');

  menu.delimiter('[menu]$');
  menu.command('play', `Play ${chalk.red('Night Terror')}`)
    .action(function play(args, callback) {
      this.log('Starting game. Beware the dark.');
      setTimeout(() => {
        process.stdout.write('\u001B[2J\u001B[0;0f');
        game.look();
        game.show();
        callback();
      }, 2000);
    });
  menu.command('save', 'Save game')
    .action((args, callback) => {
      game.show();
      callback();
    });
  menu.command('load', 'Load game')
    .action((args, callback) => {
      menu.hide();
      game.show();
      callback();
    });

  const header = chalk.white.bgHex('##540a00');
  menu.intro = [
    header.bold(titles.header('A text horror adventure by Armen138', banner.width)),
    banner.colored(),
    header(titles.random(banner.width)),
  ].join('\n');
  menu.intro += '\n';
  const help = [
    'play', 'save', 'load', 'exit',
  ];
  menu.intro += titles.header(help.map((item) => chalk.black.bgYellow(` ${item} `)).join(' '), banner.width);
  return menu;
};

export default Menu;
