/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Game from './game/game.js';
import Menu from './game/menu.js';
import TerminalRenderer from './game/terminalrenderer.js';

const game = Game(new TerminalRenderer());
const menu = new Menu('data/world.yml', new TerminalRenderer());
menu.on('play', game.play.bind(game));
menu.on('ready', menu.render.bind(menu));
