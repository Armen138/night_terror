const Vorpal = require('vorpal');
const chalk = require('chalk');
const errors = require('./errors');

const World = require('./world');
const Character = require('./character');
const Items = require('./items');

let world = new World();
let character = new Character();
let items = new Items();


let healthScale = [
    "red",
    "orange",
    "yellow",
    "green"
];

let Game = () => {

    let game = Vorpal();
    game.look = function() {
        if(world.location.title) {
            this.log(chalk.white.bold(world.location.title));
        }
        this.log(world.location.description);
        if(world.location.items && world.location.items.length > 0) {
            let worldItems = world.location.items.map(itemName => items.render(itemName));
            this.log(`Items here:\n${worldItems.join('\n')}`);
        }
        if(world.location.connects) {
            this.log(`This place connects to:\n${world.location.connects.join('\n')}`);
        }
    }
    game.command('menu', 'Return to main menu')
        .action(function (args, callback) {
            process.stdout.write ("\u001B[2J\u001B[0;0f");
            this.log(game.menu.intro);
            game.menu.show();
            callback();
        });

    game.command('look', 'Look around')
        .action(function (args, callback) {
            game.look.call(this);
            callback();
        });

    game.command('inventory', 'See what you have stored in your inventory')
        .action(function (args, callback) {
            let usable = function(itemName, itemRender) {
                let prefix = "";
                for(let worldItem of world.location.items) {
                    let item = items.get(worldItem);
                    if(item["reacts with"] && item["reacts with"] === itemName) {
                        prefix = chalk.magenta("*");
                    }
                }
                return prefix + itemRender;
            }
            this.log(`${character.inventorySlots} slots, ${character.inventorySlots - character.inventory.length} free.`)
            if (character.inventory.length > 0) {
                this.log(character.inventory.map(item => usable(item, items.render(item))).join('\n'));
            }
            callback();
        });

    game.command('go <place...>', 'Go to connecting location')
        .autocomplete(() => world.location.connects)
        .action(function (args, callback) {
            let place = args.place.join(" ");
            world.go(place).then(data => {
                process.stdout.write ("\u001B[2J\u001B[0;0f");
                this.delimiter(`[${chalk.yellow(data.name)}]$`);
                game.look.call(this);
                callback();
            });
        });

    game.command('take <item...>', 'Take an item')
        .autocomplete(() => world.location.items)
        .action(function (args, callback) {
            let item = args.item.join(" ");
            character.take(world, item).then(message => {
                this.log(message);
            }).catch(error => {
                this.log(chalk.red(error));
            });
            callback();
        });

    game.command('drop <item...>', 'Drop an item')
        .autocomplete(() => character.inventory)
        .action(function (args, callback) {
            let itemName = args.item.join(" ");
            let inventorySlot = character.inventory.indexOf(itemName);
            if (inventorySlot === -1) {
                this.log(chalk.red(errors.notininventory()));
            } else {
                world.location.items.push(itemName);
                character.inventory.splice(inventorySlot, 1);
                this.log(`You drop the ${itemName}.`);
            }
            callback();
        });

    game.command('use <item...>', 'Use an item from your inventory')
    .autocomplete(() => character.inventory)
    .action(function (args, callback) {
        let used = false;
        let itemName = args.item.join(" ");
        let inventorySlot = character.inventory.indexOf(itemName);
        if (inventorySlot === -1) {
            this.log(chalk.red(errors.notininventory()));
            used = true; 
        } else {
            for(let worldItemName of world.location.items) {
                let worldItem = items.get(worldItemName);
                if(worldItem["reacts with"] && worldItem["reacts with"].indexOf(itemName) !== -1) {
                    if(worldItem.effect.connects) {
                        world.location.connects.push(worldItem.effect.connects);
                    }
                    if(worldItem.effect.removes) {
                        if(worldItem.effect.removes === itemName) {
                            // remove item from inventory
                            let removeItem = character.inventory.indexOf(worldItem.effect.removes);
                            if(removeItem !== -1) {
                                character.inventory.splice(removeItem, 1);
                            }    
                        } else {
                            // remove item from world
                            let removeItem = world.location.items.indexOf(worldItem.effect.removes);
                            if(removeItem !== -1) {
                                world.location.items.splice(removeItem, 1);
                            }    
                        }
                    }
                    if(worldItem.effect.adds) {
                        world.location.items.push(worldItem.effect.adds);
                    }
                    if(worldItem.effect.prints) {
                        this.log(worldItem.effect.prints);
                    }
                    used = true;
                    break;
                }
            }
        }
        if(!used) {
            this.log(chalk.red(errors.cantuse()));
        }
        callback();
    });


    game.command('eat <item...>', 'Eat something from your inventory')
        .autocomplete(() => character.inventory)
        .action(function (args, callback) {
            let itemName = args.item.join(" ");
            let inventorySlot = character.inventory.indexOf(itemName);
            if (inventorySlot === -1) {
                this.log(chalk.red(errors.notininventory()));
            } else {
                let item = items.get(itemName);
                if (!item.health) {
                    this.log(chalk.red(errors.notedible()));
                } else {
                    character.health += item.health;
                    if (character.health > character.maxHealth) {
                        character.health = character.maxHealth;
                    }
                    character.inventory.splice(inventorySlot, 1);
                    let color = (healthScale.length / character.maxHealth * character.health | 0) - 1;
                    let health = chalk[healthScale[color]](`${character.health}/${character.maxHealth}`);
                    this.log(`You ate the ${items.render(itemName)}. Your health is now ${health}`);
                }
            }
            callback();
        });

    game.command('examine <item...>', 'Examine an item')
        .autocomplete(() => character.inventory.concat(world.location.items))
        .action(function (args, callback) {
            let item = args.item.join(" ");
            let allItems = character.inventory.concat(world.location.items);
            if (allItems.indexOf(item) !== -1) {
                this.log(items.get(item).description);
            } else {
                this.log(chalk.red(errors.notfound()));
            }
            callback();
        });
    
    // game.help(cmd => {
    //     return "HALP";
    // });
    game.delimiter(`[${world.location.name}]$`)

    return game;
}

module.exports = Game;