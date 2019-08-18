/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';
import TerminalRenderer from './game/terminalrenderer.js';
import TerminalLoader from './game/terminalloader.js';

const loader = new TerminalLoader();
const game = new Game(new TerminalRenderer(), loader);

function main(menu) {
  menu.on('play', game.play.bind(game));
  game.on('menu', menu.render.bind(menu));
  game.on('death', () => game.end('death'));
  menu.render();
}

loader.get('data/world.yml').then(data => {
  const menu = new Menu(data, new TerminalRenderer());
  main(menu);
});
