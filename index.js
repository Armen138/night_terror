const Menu = require('./game/menu');
const Game = require('./game/game');

let game = Game();
let menu = Menu(game);

game.menu = menu;
console.log(menu.intro);
menu.show();
