/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';
import WebRenderer from './game/webrenderer.js';
import WebLoader from './game/webloader.js';

const loader = new WebLoader();
const game = new Game(new WebRenderer(), loader);

function main(menu, death) {
  menu.on('play', game.play.bind(game));
  death.on('play', game.play.bind(game));
  game.on('menu', menu.render.bind(menu));
  game.on('death', death.render.bind(death));
  menu.render();
}

loader.get('data/world.yml').then(data => {
  const menu = new Menu(data, new WebRenderer());
  loader.get('data/death.yml').then(deathMenu => {
    const death = new Menu(deathMenu, new WebRenderer());
    main(menu, death);
  });
});
