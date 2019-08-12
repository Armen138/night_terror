/* eslint-disable no-mixed-operators */
/* eslint-disable arrow-parens */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/extensions */
import fs from 'fs';
import yaml from 'js-yaml';
import Vorpal from 'vorpal';
import chalk from 'chalk';
import Messages from './messages.js';
import World from './world.js';
import Character from './character.js';
import Items from './items.js';

const worldConfig = yaml.safeLoad(fs.readFileSync('data/world.yml', 'utf8'));

const world = new World(worldConfig);
const character = new Character();
const messages = new Messages('data/messages.yml');
const items = new Items();


const healthScale = [
  'red',
  'orange',
  'yellow',
  'green',
];

const Game = (renderer) => {
  const game = renderer.vorpal;
  game.history('game-command-history');
  const countdown = yaml.safeLoad(fs.readFileSync('data/countdown.yml', 'utf8'));

  game.time = 0;
  game.play = () => {
    renderer.clear();
    game.look();
    game.show();
  };

  game.advance = () => {
    game.time += 1;
    if (world.location.monsters && world.location.monsters.length > 0) {
      for (const monster of world.location.monsters) {
        const damage = monster.attack();
        game.log(damage.message);
        const status = character.defend(damage);
        game.log(status.message);
        if (status.status === 'death') {
          game.over();
        }
      }
    }
    if (countdown.length > 0) {
      const message = countdown.shift();
      game.log(chalk.grey(message));
    } else {
      game.over();
    }
    game.delimiter(`[${chalk.red('❤'.repeat(character.health))}][${world.location.name}]$`);
  };
  game.over = () => {
    game.log('Game over. You ded.');
  };
  game.applyEffects = (worldItem, itemName) => {
    if (worldItem.effect.connects) {
      world.location.connects.push(worldItem.effect.connects);
    }
    if (worldItem.effect.removes) {
      if (worldItem.effect.removes === itemName) {
        // remove item from inventory
        const removeItem = character.inventory.indexOf(worldItem.effect.removes);
        if (removeItem !== -1) {
          character.inventory.splice(removeItem, 1);
        }
      } else {
        // remove item from world
        const removeItem = world.location.items.indexOf(worldItem.effect.removes);
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
  };

  game.look = () => {
    if (world.location.title) {
      game.log(chalk.white.bold(world.location.title));
    }
    game.log(world.location.description);
    if (world.location.items && world.location.items.length > 0) {
      const worldItems = world.location.items.map(itemName => items.render(itemName));
      game.log(`Items here:\n${worldItems.join('\n')}`);
    }
    if (world.location.monsters && world.location.monsters.length > 0) {
      const { monsters } = world.location;
      game.log(`Monsters here:\n${monsters.map(monster => monster.name).join('\n')}`);
    }
    if (world.location.connects) {
      game.log(`This place connects to:\n${world.location.connects.join('\n')}`);
    }
  };

  game.command('menu', 'Return to main menu')
    .action((args, callback) => {
      process.stdout.write('\u001B[2J\u001B[0;0f');
      game.log(game.menu.intro);
      game.hide();
      game.menu.show();
      callback();
    });

  game.command('look', 'Look around')
    .action(function look(args, callback) {
      game.look.call(this);
      callback();
    });

  game.command('inventory', 'See what you have stored in your inventory')
    .action((args, callback) => {
      function usable(itemName, itemRender) {
        let prefix = '';
        for (const worldItem of world.location.items) {
          const item = items.get(worldItem);
          if (item['reacts with'] && item['reacts with'] === itemName) {
            prefix = chalk.magenta('*');
          }
        }
        return prefix + itemRender;
      }
      game.log(`${character.inventorySlots} slots, ${character.inventorySlots - character.inventory.length} free.`);
      if (character.inventory.length > 0) {
        game.log(character.inventory.map(item => usable(item, items.render(item))).join('\n'));
      }
      callback();
    });

  game.command('go <place...>', 'Go to connecting location')
    .autocomplete(() => world.location.connects)
    .action(function go(args, callback) {
      const place = args.place.join(' ');
      world.go(place).then(() => {
        process.stdout.write('\u001B[2J\u001B[0;0f');
        // this.delimiter(`[${chalk.yellow(data.name)}]$`);
        game.delimiter(`[${chalk.red('❤︎'.repeat(character.health))}][${world.location.name}]$`);
        game.look.call(this);
        // not sure if moving locations should advance the game,
        // since the location itself has a lot of text attached already.
        // game.advance();
        callback();
      });
    });

  game.command('take <item...>', 'Take an item')
    .autocomplete(() => world.location.items)
    .action((args, callback) => {
      const item = args.item.join(' ');
      character.take(world, item).then(message => {
        game.log(message);
        game.advance();
        callback();
      }).catch(error => {
        game.log(chalk.red(error));
        callback();
      });
    });

  game.command('drop <item...>', 'Drop an item')
    .autocomplete(() => character.inventory)
    .action((args, callback) => {
      const itemName = args.item.join(' ');
      const inventorySlot = character.inventory.indexOf(itemName);
      if (inventorySlot === -1) {
        game.log(chalk.red(messages.not_in_inventory));
      } else {
        world.location.items.push(itemName);
        character.inventory.splice(inventorySlot, 1);
        game.log(`You drop the ${itemName}.`);
        game.advance();
      }
      callback();
    });

  game.command('unequip <item...>', 'Equip an item from your inventory')
    .autocomplete(() => character.equipped)
    .action((args, callback) => {
      let used = false;
      const itemName = args.item.join(' ');
      for (const slot in character.equipment) {
        if (character.equipment[slot] && character.equipment[slot].name === itemName) {
          character.equipment[slot] = null;
          if (character.inventory.length < character.inventorySlots) {
            character.inventory.push(itemName);
            game.log(`You've unequipped ${itemName}.`);
          } else {
            world.location.items.push(itemName);
            game.log(`You've unequipped ${itemName}, and dropped it on the floor in front of you.`);
          }
          used = true;
          break;
        }
      }
      if (!used) {
        game.log(chalk.red(messages.cant_use));
      } else {
        game.advance();
      }
      callback();
    });


  game.command('equip <item...>', 'Equip an item from your inventory')
    .autocomplete(() => character.inventory)
    .action((args, callback) => {
      let used = false;
      const itemName = args.item.join(' ');
      const inventorySlot = character.inventory.indexOf(itemName);
      if (inventorySlot === -1) {
        game.log(chalk.red(messages.not_in_inventory));
        used = true;
      } else {
        const inventoryItem = items.get(itemName);
        const equipmentSlot = inventoryItem.equip;
        if (character.equipment[equipmentSlot] === null) {
          character.equipment[equipmentSlot] = inventoryItem;
          character.inventory.splice(inventorySlot, 1);
          game.log(`You've equipped ${itemName} in the ${equipmentSlot} slot`);
          used = true;
        } else {
          game.log(chalk.red(messages.slot_used));
          used = true;
        }
      }
      if (!used) {
        game.log(chalk.red(messages.cant_use));
      } else {
        game.advance();
      }
      callback();
    });

  game.command('use <item...>', 'Use an item from your inventory')
    .autocomplete(() => character.inventory)
    .action((args, callback) => {
      let used = false;
      const itemName = args.item.join(' ');
      const inventorySlot = character.inventory.indexOf(itemName);
      if (inventorySlot === -1) {
        game.log(chalk.red(messages.not_in_inventory));
        used = true;
      } else {
        const inventoryItem = items.get(itemName);
        if (inventoryItem.consumable) {
          game.applyEffects(inventoryItem, itemName);
          used = true;
        } else {
          for (const worldItemName of world.location.items) {
            const worldItem = items.get(worldItemName);
            if (worldItem['reacts with'] && worldItem['reacts with'].indexOf(itemName) !== -1) {
              game.applyEffects(worldItem, itemName);
              used = true;
              break;
            }
          }
        }
      }
      if (!used) {
        game.log(chalk.red(messages.cant_use));
      } else {
        game.advance();
      }
      callback();
    });


  game.command('eat <item...>', 'Eat something from your inventory')
    .autocomplete(() => character.inventory)
    .action((args, callback) => {
      const itemName = args.item.join(' ');
      const inventorySlot = character.inventory.indexOf(itemName);
      if (inventorySlot === -1) {
        game.log(chalk.red(messages.not_in_inventory));
      } else {
        const item = items.get(itemName);
        if (!item.health) {
          game.log(chalk.red(messages.not_edible));
        } else {
          character.health += item.health;
          if (character.health > character.maxHealth) {
            character.health = character.maxHealth;
          }
          character.inventory.splice(inventorySlot, 1);
          const color = Math.floor(healthScale.length / character.maxHealth * character.health) - 1;
          const health = chalk[healthScale[color]](`${character.health}/${character.maxHealth}`);
          game.log(`You ate the ${items.render(itemName)}. Your health is now ${health}`);
          game.advance();
        }
      }
      callback();
    });
  game.command('info', 'Get character information')
    .autocomplete(() => character.inventory.concat(world.location.items))
    .action((args, callback) => {
      game.log(`Health: ${character.health}`);
      game.log(`Armor: ${character.armor}`);
      game.log(`Damage: ${character.damage}`);
      game.log(`Inventory: ${character.inventory.join(',')}`);
      game.log(`Equipment: ${character.equipped}`);
      callback();
    });
  game.command('examine <item...>', 'Examine an item')
    .autocomplete(() => character.inventory.concat(world.location.items))
    .action((args, callback) => {
      const item = args.item.join(' ');
      const allItems = character.inventory.concat(world.location.items);
      if (allItems.indexOf(item) !== -1) {
        game.log(items.get(item).description);
        game.advance();
      } else {
        game.log(chalk.red(messages.not_found));
      }
      callback();
    });
  game.command('attack <monster...>', 'Attack a nearby monster')
    .autocomplete(() => world.location.monsters.map(monster => monster.name))
    .action((args, callback) => {
      const monster = args.monster.join(' ');
      const monsterIdx = world.location.monsters.map(creature => creature.name).indexOf(monster);
      if (monsterIdx !== -1) {
        const damage = character.attack();
        game.log(damage.message);
        const status = world.location.monsters[monsterIdx].defend(damage);
        game.log(status.message);
        if (status.status === 'death') {
          world.location.monsters.splice(monsterIdx, 1);
          if (status.drops && status.drops.length > 0) {
            world.location.items = world.location.items.concat(status.drops);
            for (const drop of status.drops) {
              game.log(`It dropped ${items.render(drop)}`);
            }
          }
        }
        game.advance();
      } else {
        game.log(chalk.red(messages.not_found));
      }
      callback();
    });
  // game.help(cmd => {
  //     return "HALP";
  // });
  game.delimiter(`[${chalk.red('❤'.repeat(character.health))}][${world.location.name}]$`);

  return game;
};

export default Game;
