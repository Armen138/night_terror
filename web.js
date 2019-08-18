/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';
import WebRenderer from './game/webrenderer.js';
import WebLoader from './game/webloader.js';

const loader = new WebLoader();
const game = new Game(new WebRenderer(), loader);

// it's all input baby
window.addEventListener('click', () => {
  document.querySelector('#prompt').focus();
});

function main(menu) {
  menu.on('play', game.play.bind(game));
  game.on('menu', menu.render.bind(menu));
  game.on('death', () => game.end('death'));
  menu.render();
}

loader.get('data/world.yml').then(data => {
  const menu = new Menu(data, new WebRenderer());
  main(menu);
});
