/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';

const game = Game();
const menu = Menu(game);
game.menu = menu;
menu.log(menu.intro);
menu.show();
