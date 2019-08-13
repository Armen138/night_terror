/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';
import TerminalRenderer from './game/terminalrenderer.js';

const game = new Game(new TerminalRenderer());
const menu = new Menu('data/world.yml', new TerminalRenderer());
const death = new Menu('data/death.yml', new TerminalRenderer());
menu.on('play', game.play.bind(game));
death.on('play', game.play.bind(game));
menu.on('ready', menu.render.bind(menu));
game.on('menu', menu.render.bind(menu));
game.on('death', death.render.bind(death));
