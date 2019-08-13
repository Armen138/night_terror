/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Messages from './messages.js';
import World from './world.js';
import Character from './character.js';
import Items from './items.js';
import Events from './events.js';

const healthScale = [
  'red',
  'orange',
  'yellow',
  'green',
];

class Game extends Events {
  constructor(renderer, loader) {
    super();
    this.time = 0;
    this.renderer = renderer;
    loader.get('data/world.yml').then(worldConfig => {
      loader.get(`data/locations/${worldConfig.spawn.replace(/ /g, '_')}.yml`).then(location => {
        this.world = new World(location, loader);
        this.character = new Character();
        loader.get('data/messages.yml').then(messageData => {
          this.messages = new Messages(messageData);
          loader.get('data/countdown.yml').then(countdown => {
            this.countdown = countdown;
            this.emit('ready');
          });
        });
      });
    });
    this.items = new Items(renderer);

    // const worldConfig = yaml.safeLoad(fs.readFileSync('data/world.yml', 'utf8'));

    this.commands = {
      menu: this.menu.bind(this),
      look: this.look.bind(this),
      inventory: this.inventory.bind(this),
      take: this.take.bind(this),
      info: this.info.bind(this),
      examine: this.examine.bind(this),
      drop: this.drop.bind(this),
      eat: this.eat.bind(this),
      use: this.use.bind(this),
      go: this.go.bind(this),
      equip: this.equip.bind(this),
      unequip: this.unequip.bind(this),
      attack: this.attack.bind(this),
    };
    this.renderer.register(this.commands, this.autocomplete.bind(this));
  }

  autocomplete(command) {
    switch (command) {
      case 'take':
        return () => this.world.location.items;
      case 'use':
      case 'eat':
      case 'drop':
      case 'equip':
        return () => this.character.inventory;
      case 'unequip':
        return () => this.character.equipped;
      case 'examine':
        return () => this.character.inventory.concat(this.world.location.items);
      case 'attack':
        return () => this.world.location.monsters.map(monster => monster.name);
      case 'go':
        return () => this.world.location.connects;
      default:
        return () => [];
    }
  }

  applyEffects(worldItem, itemName) {
    if (worldItem.effect.connects) {
      this.world.location.connects.push(worldItem.effect.connects);
    }
    if (worldItem.effect.removes) {
      if (worldItem.effect.removes === itemName) {
        // remove item from inventory
        const removeItem = this.character.inventory.indexOf(worldItem.effect.removes);
        if (removeItem !== -1) {
          this.character.inventory.splice(removeItem, 1);
        }
      } else {
        // remove item from world
        const removeItem = this.world.location.items.indexOf(worldItem.effect.removes);
        if (removeItem !== -1) {
          this.world.location.items.splice(removeItem, 1);
        }
      }
    }
    if (worldItem.effect.adds) {
      this.world.location.items.push(worldItem.effect.adds);
    }
    if (worldItem.effect.grow_inventory) {
      this.character.inventorySlots += worldItem.effect.grow_inventory;
    }
    if (worldItem.effect.prints) {
      this.renderer.text(worldItem.effect.prints);
    }
  }

  attack(monster, callback) {
    const monsterIdx = this.world.location.monsters.map(creature => creature.name).indexOf(monster);
    if (monsterIdx !== -1) {
      const damage = this.character.attack();
      this.renderer.text(damage.message);
      const status = this.world.location.monsters[monsterIdx].defend(damage);
      this.renderer.text(status.message);
      if (status.status === 'death') {
        this.world.location.monsters.splice(monsterIdx, 1);
        if (status.drops && status.drops.length > 0) {
          this.world.location.items = this.world.location.items.concat(status.drops);
          for (const drop of status.drops) {
            this.renderer.text(`It dropped ${this.items.render(drop)}`);
          }
        }
      }
      this.advance();
    } else {
      this.renderer.text(this.messages.not_found, { color: 'red' });
    }
    callback();
  }

  equip(itemName, callback) {
    let used = false;
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
      used = true;
    } else {
      const inventoryItem = this.items.get(itemName);
      const equipmentSlot = inventoryItem.equip;
      if (this.character.equipment[equipmentSlot] === null) {
        this.character.equipment[equipmentSlot] = inventoryItem;
        this.character.inventory.splice(inventorySlot, 1);
        this.renderer.text(`You've equipped ${itemName} in the ${equipmentSlot} slot`);
        used = true;
      } else {
        this.renderer.text(this.messages.slot_used, { color: 'red' });
        used = true;
      }
    }
    if (!used) {
      this.renderer.text(this.messages.cant_use, { color: 'red' });
    } else {
      this.advance();
    }
    callback();
  }

  unequip(itemName, callback) {
    let used = false;
    for (const slot in this.character.equipment) {
      if (this.character.equipment[slot] && this.character.equipment[slot].name === itemName) {
        this.character.equipment[slot] = null;
        if (this.character.inventory.length < this.character.inventorySlots) {
          this.character.inventory.push(itemName);
          this.renderer.text(`You've unequipped ${itemName}.`);
        } else {
          this.world.location.items.push(itemName);
          this.renderer.text(`You've unequipped ${itemName}, and dropped it on the floor in front of you.`);
        }
        used = true;
        break;
      }
    }
    if (!used) {
      this.renderer.text(this.messages.cant_use, { color: 'red' });
    } else {
      this.advance();
    }
    callback();
  }

  use(itemName, callback) {
    let used = false;
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
      used = true;
    } else {
      const inventoryItem = this.items.get(itemName);
      if (inventoryItem.consumable) {
        this.applyEffects(inventoryItem, itemName);
        used = true;
      } else {
        for (const worldItemName of this.world.location.items) {
          const worldItem = this.items.get(worldItemName);
          if (worldItem['reacts with'] && worldItem['reacts with'].indexOf(itemName) !== -1) {
            this.applyEffects(worldItem, itemName);
            used = true;
            break;
          }
        }
      }
    }
    if (!used) {
      this.renderer.text(this.messages.cant_use, { color: 'red' });
    } else {
      this.advance();
    }
    callback();
  }

  go(place, callback) {
    this.world.go(place).then(() => {
      this.renderer.clear();
      this.prompt();
      this.look(null, callback);
    });
  }

  eat(itemName, callback) {
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
    } else {
      const item = this.items.get(itemName);
      if (!item.health) {
        this.renderer.text(this.messages.not_edible, { color: 'red' });
      } else {
        this.character.health += item.health;
        if (this.character.health > this.character.maxHealth) {
          this.character.health = this.character.maxHealth;
        }
        this.character.inventory.splice(inventorySlot, 1);
        const color = Math.floor((healthScale.length / this.character.maxHealth)
                                  * this.character.health) - 1;
        const health = this.renderer.style(`${this.character.health}/${this.character.maxHealth}`, { color: healthScale[color] });
        this.renderer.text(`You ate the ${this.items.render(itemName)}. Your health is now ${health}`);
        this.advance();
      }
    }
    callback();
  }

  take(item, callback) {
    this.character.take(this.world, item).then(message => {
      this.renderer.text(message);
      this.advance();
      callback();
    }).catch(error => {
      this.renderer.text(error, { color: 'red' });
      callback();
    });
  }

  info(arg, callback) {
    this.renderer.text(`Health: ${this.character.health}`);
    this.renderer.text(`Armor: ${this.character.armor}`);
    this.renderer.text(`Damage: ${this.character.damage}`);
    this.renderer.text(`Inventory: ${this.character.inventory.join(',')}`);
    this.renderer.text(`Equipment: ${this.character.equipped}`);
    callback();
  }

  drop(itemName, callback) {
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
    } else {
      this.world.location.items.push(itemName);
      this.character.inventory.splice(inventorySlot, 1);
      this.renderer.text(`You drop the ${itemName}.`);
      this.advance();
    }
    callback();
  }

  inventory(args, callback) {
    // function usable(itemName, itemRender) {
    //   let prefix = '';
    //   for (const worldItem of world.location.items) {
    //     const item = items.get(worldItem);
    //     if (item['reacts with'] && item['reacts with'] === itemName) {
    //       prefix = chalk.magenta('*');
    //     }
    //   }
    //   return prefix + itemRender;
    // }
    this.renderer.text(`${this.character.inventorySlots} slots, ${this.character.inventorySlots - this.character.inventory.length} free.`);
    if (this.character.inventory.length > 0) {
      this.renderer.text(this.character.inventory.map(item => this.items.render(item)).join('\n'));
    }
    callback();
  }

  examine(item, callback) {
    const allItems = this.character.inventory.concat(this.world.location.items);
    if (allItems.indexOf(item) !== -1) {
      this.renderer.text(this.items.get(item).description);
      this.advance();
    } else {
      this.renderer.text(this.messages.not_found, { color: 'red' });
    }
    callback();
  }

  look(args, callback) {
    if (this.world.location.title) {
      this.renderer.text(this.world.location.title, { color: 'white', 'font-weight': 'bold' });
    }
    this.renderer.text(this.world.location.description);
    if (this.world.location.items && this.world.location.items.length > 0) {
      const worldItems = this.world.location.items.map(itemName => this.items.render(itemName));
      this.renderer.text(`Items here:\n${worldItems.join('\n')}`);
    }
    if (this.world.location.monsters && this.world.location.monsters.length > 0) {
      const { monsters } = this.world.location;
      this.renderer.text(`Monsters here:\n${monsters.map(monster => monster.name).join('\n')}`);
    }
    if (this.world.location.connects) {
      this.renderer.text(`This place connects to:\n${this.world.location.connects.join('\n')}`);
    }
    if (callback) {
      callback();
    }
  }

  advance() {
    this.time += 1;
    if (this.world.location.monsters && this.world.location.monsters.length > 0) {
      for (const monster of this.world.location.monsters) {
        const damage = monster.attack();
        this.renderer.text(damage.message);
        const status = this.character.defend(damage);
        this.renderer.text(status.message);
        if (status.status === 'death') {
          this.emit('death');
        }
      }
    }
    if (this.countdown.length > 0) {
      const time = `[${this.countdown.length} minutes to midnight] `;
      const message = this.countdown.shift();
      this.renderer.text(time + message, { color: 'grey' });
    } else {
      this.emit('death'); // maybe this should be another event
    }
    this.prompt();
  }

  menu() {
    this.emit('menu');
  }

  prompt() {
    const healthbar = this.renderer.style('❤'.repeat(this.character.health), { color: 'red' });
    this.renderer.prompt(`${healthbar} | ${this.world.location.name}`);
  }

  play() {
    this.renderer.clear();
    this.look();
    this.prompt();
    this.renderer.show();
  }
}

export default Game;
