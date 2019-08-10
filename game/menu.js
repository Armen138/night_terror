const Vorpal = require('vorpal');
const chalk = require('chalk');
const banner = require('./banner');
const titles = require('./titles');

let Menu = (game) => {
    let menu = Vorpal();
    menu.history("menu-command-history");

    menu.delimiter("[menu]$");
    menu.command('play', 'Play ' + chalk.red('Night Terror'))
        .action(function (args, callback) {
            this.log("Starting game. Beware the dark.")
            setTimeout(function() {
                process.stdout.write ("\u001B[2J\u001B[0;0f");
                game.look();
                game.show();
                callback();    
            }, 2000);
        });
    menu.command('save', 'Save game')
        .action(function (args, callback) {
            game.show();
            callback();
        });
    menu.command('load', 'Load game')
        .action(function (args, callback) {
            menu.hide();
            game.show();
            callback();
        });
    
    let header = chalk.white.bgHex("##540a00");
    menu.intro = [
        header.bold(titles.header("A text horror adventure by Armen138", banner.width)),
        banner.colored(),
        header(titles.random(banner.width))
    ].join("\n");
    menu.intro += "\n";
    let help = [
        "play", "save", "load", "exit"
    ];
    menu.intro += titles.header(help.map(item => chalk.black.bgYellow(` ${item} `)).join(" "), banner.width);
    return menu;    
}

module.exports = Menu;