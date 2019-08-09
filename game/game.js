const Vorpal = require('vorpal');
const chalk = require('chalk');
const errors = require('./errors');
const yaml = require('js-yaml');
const fs = require('fs');
const World = require('./world');
const Character = require('./character');
const Monster = require('./monster');
const Items = require('./items');

const worldConfig = yaml.safeLoad(fs.readFileSync(`data/world.yml`, 'utf8'));

let world = new World(worldConfig);
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
    let countdown = yaml.safeLoad(fs.readFileSync(`data/countdown.yml`, 'utf8'));

    game.time = 0;
    game.advance = function () {
        game.time++;
        if (world.location.monsters && world.location.monsters.length > 0) {
            for (let monster of world.location.monsters) {
                let damage = monster.attack();
                console.log(damage.message);
                let status = character.defend(damage);
                console.log(status.message);
                if (status.status === "death") {
                    game.over();
                }
            }
        }
        if (countdown.length > 0) {
            let message = countdown.shift();
            console.log(chalk.grey(message));
        } else {
            game.over();
        }
        game.delimiter(`[${chalk.red("❤︎".repeat(character.health))}][${world.location.name}]$`)
    }
    game.over = function () {
        console.log("Game over. You ded.");
    }
    game.applyEffects = function (worldItem, itemName) {
        if (worldItem.effect.connects) {
            world.location.connects.push(worldItem.effect.connects);
        }
        if (worldItem.effect.removes) {
            if (worldItem.effect.removes === itemName) {
                // remove item from inventory
                let removeItem = character.inventory.indexOf(worldItem.effect.removes);
                if (removeItem !== -1) {
                    character.inventory.splice(removeItem, 1);
                }
            } else {
                // remove item from world
                let removeItem = world.location.items.indexOf(worldItem.effect.removes);
                if (removeItem !== -1) {
                    world.location.items.splice(removeItem, 1);
                }
            }
        }
        if (worldItem.effect.adds) {
            world.location.items.push(worldItem.effect.adds);
        }
        if (worldItem.effect.grow_inventory) {
            character.inventorySlots += worldItem.effect.grow_inventory;
        }
        if (worldItem.effect.prints) {
            game.log(worldItem.effect.prints);
        }
    }
    game.look = function () {
        if (world.location.title) {
            this.log(chalk.white.bold(world.location.title));
        }
        this.log(world.location.description);
        if (world.location.items && world.location.items.length > 0) {
            let worldItems = world.location.items.map(itemName => items.render(itemName));
            this.log(`Items here:\n${worldItems.join('\n')}`);
        }
        if (world.location.monsters && world.location.monsters.length > 0) {
            let monsters = world.location.monsters; //.map(monsterConfig => new Monster(monsterConfig));
            this.log(`Monsters here:\n${monsters.map(monster => monster.name).join('\n')}`);
        }
        if (world.location.connects) {
            this.log(`This place connects to:\n${world.location.connects.join('\n')}`);
        }
    }
    game.command('menu', 'Return to main menu')
        .action(function (args, callback) {
            process.stdout.write("\u001B[2J\u001B[0;0f");
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
            let usable = function (itemName, itemRender) {
                let prefix = "";
                for (let worldItem of world.location.items) {
                    let item = items.get(worldItem);
                    if (item["reacts with"] && item["reacts with"] === itemName) {
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
                process.stdout.write("\u001B[2J\u001B[0;0f");
                // this.delimiter(`[${chalk.yellow(data.name)}]$`);
                game.delimiter(`[${chalk.red("❤︎".repeat(character.health))}][${world.location.name}]$`)
                game.look.call(this);
                // not sure if moving locations should advance the game,
                // since the location itself has a lot of text attached already.
                // game.advance();
                callback();
            });
        });

    game.command('take <item...>', 'Take an item')
        .autocomplete(() => world.location.items)
        .action(function (args, callback) {
            let item = args.item.join(" ");
            character.take(world, item).then(message => {
                this.log(message);
                game.advance();
                callback();
            }).catch(error => {
                this.log(chalk.red(error));
                callback();
            });
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
                game.advance();
            }
            callback();
        });

        game.command('unequip <item...>', 'Equip an item from your inventory')
        .autocomplete(() => character.equipped)
        .action(function (args, callback) {
            let used = false;
            let itemName = args.item.join(" ");
            for(let slot in character.equipment) {
                if(character.equipment[slot] && character.equipment[slot].name == itemName) {
                    character.equipment[slot] = null;
                    if(character.inventory.length < character.inventorySlots) {
                        character.inventory.push(itemName);
                        this.log(`You've unequipped ${itemName}.`);
                    } else {
                        world.location.items.push(itemName);
                        this.log(`You've unequipped ${itemName}, and dropped it on the floor in front of you.`);
                    }
                    used = true;
                    break;
                }
            }
            if (!used) {
                this.log(chalk.red(errors.cantuse()));
            } else {
                game.advance();
            }
            callback();
        });


    game.command('equip <item...>', 'Equip an item from your inventory')
        .autocomplete(() => character.inventory)
        .action(function (args, callback) {
            let used = false;
            let itemName = args.item.join(" ");
            let inventorySlot = character.inventory.indexOf(itemName);
            if (inventorySlot === -1) {
                this.log(chalk.red(errors.notininventory()));
                used = true;
            } else {
                let inventoryItem = items.get(itemName);
                let equipmentSlot = inventoryItem.equip;
                if (character.equipment[equipmentSlot] === null) {
                    character.equipment[equipmentSlot] = inventoryItem;
                    character.inventory.splice(inventorySlot, 1);
                    this.log(`You've equipped ${itemName} in the ${equipmentSlot} slot`);
                    used = true;
                } else {
                    this.log(chalk.red(errors.slotused()));
                    used = true;
                }
            }
            if (!used) {
                this.log(chalk.red(errors.cantuse()));
            } else {
                game.advance();
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
                let inventoryItem = items.get(itemName);
                if (inventoryItem.consumable) {
                    game.applyEffects(inventoryItem, itemName);
                    used = true;
                } else {
                    for (let worldItemName of world.location.items) {
                        let worldItem = items.get(worldItemName);
                        if (worldItem["reacts with"] && worldItem["reacts with"].indexOf(itemName) !== -1) {
                            game.applyEffects(worldItem, itemName);
                            used = true;
                            break;
                        }
                    }
                }
            }
            if (!used) {
                this.log(chalk.red(errors.cantuse()));
            } else {
                game.advance();
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
                    game.advance();
                }
            }
            callback();
        });
        game.command('info', 'Get character information')
        .autocomplete(() => character.inventory.concat(world.location.items))
        .action(function (args, callback) {
            this.log(`Health: ${character.health}`);
            this.log(`Armor: ${character.armor}`);
            this.log(`Damage: ${character.damage}`);
            this.log(`Inventory: ${character.inventory.join(',')}`);
            this.log(`Equipment: ${character.equipped}`);
            callback();
        });
    game.command('examine <item...>', 'Examine an item')
        .autocomplete(() => character.inventory.concat(world.location.items))
        .action(function (args, callback) {
            let item = args.item.join(" ");
            let allItems = character.inventory.concat(world.location.items);
            if (allItems.indexOf(item) !== -1) {
                this.log(items.get(item).description);
                game.advance();
            } else {
                this.log(chalk.red(errors.notfound()));
            }
            callback();
        });
    game.command('attack <monster...>', 'Attack a nearby monster')
        .autocomplete(() => world.location.monsters.map(monster => monster.name))
        .action(function (args, callback) {
            let monster = args.monster.join(" ");
            let monsterIdx = world.location.monsters.map(monster => monster.name).indexOf(monster);
            if (monsterIdx !== -1) {
                let damage = character.attack();
                this.log(damage.message);
                let status = world.location.monsters[monsterIdx].defend(damage);
                this.log(status.message);
                if (status.status === "death") {
                    world.location.monsters.splice(monsterIdx, 1);
                    if (status.drops && status.drops.length > 0) {
                        world.location.items = world.location.items.concat(status.drops);
                        for (let drop of status.drops) {
                            this.log(`It dropped ${items.render(drop)}`);
                        }
                    }
                }
                game.advance();
            } else {
                this.log(chalk.red(errors.notfound()));
            }
            callback();
        });
    // game.help(cmd => {
    //     return "HALP";
    // });
    game.delimiter(`[${chalk.red("❤︎".repeat(character.health))}][${world.location.name}]$`)

    return game;
}

module.exports = Game;