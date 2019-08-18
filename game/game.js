/* eslint-disable no-restricted-syntax */
/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Messages from './messages.js';
import World from './world.js';
import Menu from './menu.js';
import Character from './character.js';
import Items from './items.js';
import Events from './events.js';
import Monster from './monster.js';
// import Monsters from './monsters.js';

const healthScale = [
  '#EF5350',
  'orange',
  'yellow',
  '#CDDC39',
];

class Game extends Events {
  constructor(renderer, loader) {
    super();
    this.time = 0;
    this.renderer = renderer;
    this.loader = loader;
    this.items = new Items(this.renderer, this.loader);
    this.restart();

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
      search: this.search.bind(this),
      unequip: this.unequip.bind(this),
      attack: this.attack.bind(this),
    };
    this.renderer.register(this.commands, this.autocomplete.bind(this));
  }

  get itemsHere() {
    if (this.world && this.world.location && this.world.location.items) {
      return this.world.location.items.length > 0;
    }
    return false;
  }

  restart(callback) {
    this.loader.get('data/world.yml').then(worldConfig => {
      this.loader.get(`data/locations/${worldConfig.spawn.replace(/ /g, '_')}.yml`).then(location => {
        this.world = new World(location, this.loader);
        this.world.items = this.items;
        this.world.on('ending', (ending) => {
          this.end(ending);
        });
        this.character = new Character();
        this.loader.get('data/messages.yml').then(messageData => {
          this.messages = new Messages(messageData);
          this.character.messages = this.messages;
          this.world.messages = this.messages;
          this.loader.get('data/countdown.yml').then(countdown => {
            this.countdown = countdown;
            this.emit('ready');
            this.emit('location', this.world.location);
            this.prompt();
            if (callback) {
              callback();
            }
          });
        });
      });
    });
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
        return () => this.world.location.spawned.map(monster => monster.name);
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
    if (worldItem.effect.ending) {
      this.end(worldItem.effect.ending);
    }
    if (worldItem.effect.adds) {
      this.world.location.items.push(worldItem.effect.adds);
    }
    if (worldItem.effect.grow_inventory) {
      this.character.inventorySlots += worldItem.effect.grow_inventory;
    }
    if (worldItem.effect.prints) {
      this.renderer.text(worldItem.effect.prints);
      this.emit('message', worldItem.effect.prints);
    }
    this.emit('location-items', this.world.location.items);
    this.emit('inventory', this.character.inventory);
  }

  attack(monster, callback) {
    const monsterIdx = this.world.location.spawned.map(item => item.name).indexOf(monster);
    if (monsterIdx !== -1) {
      const damage = this.character.attack();
      this.renderer.text(damage.message);
      this.emit('message', damage.message);
      const status = this.world.location.spawned[monsterIdx].defend(damage);
      this.renderer.text(status.message, null, monster);
      this.emit('message-add', status.message);
      if (status.status === 'death') {
        this.world.location.spawned.splice(monsterIdx, 1);
        if (status.drops && status.drops.length > 0) {
          this.world.location.items = this.world.location.items.concat(status.drops);
          for (const drop of status.drops) {
            this.renderer.text(`It dropped ${this.items.render(drop)}`, null, monster);
            this.emit('message-add', `It dropped ${this.items.render(drop)}`);
            this.emit('location-items', this.world.location.items);
          }
        }
      }
      this.advance();
    } else {
      this.renderer.text(this.messages.not_found, { color: 'red' });
      this.emit('error', this.messages.not_found);
    }
    this.emit('monsters', this.world.location.spawned);
    this.emit('stats', this.character);
    if (callback) { callback(); }
  }

  equip(itemName, callback) {
    let used = false;
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
      this.emit('error', this.messages.not_in_inventory);
      used = true;
    } else {
      const inventoryItem = this.items.get(itemName);
      const equipmentSlot = inventoryItem.equip;
      if (this.character.equipment[equipmentSlot] === null) {
        this.character.equipment[equipmentSlot] = inventoryItem;
        this.character.inventory.splice(inventorySlot, 1);
        this.emit('message', `You've equipped ${itemName} in the ${equipmentSlot} slot`);
        this.emit('inventory', this.character.inventory);
        this.renderer.text(`You've equipped ${itemName} in the ${equipmentSlot} slot`);
        used = true;
      } else {
        this.renderer.text(this.messages.slot_used, { color: 'red' });
        this.emit('error', this.messages.slot_used);
        used = true;
      }
    }
    if (!used) {
      this.renderer.text(this.messages.cant_use, { color: 'red' });
      this.emit('error', this.messages.cant_use);
    } else {
      this.advance();
    }
    this.emit('stats', this.character);
    if (callback) { callback(); }
  }

  unequip(itemName, callback) {
    let used = false;
    for (const slot in this.character.equipment) {
      if (this.character.equipment[slot] && this.character.equipment[slot].name === itemName) {
        this.character.equipment[slot] = null;
        if (this.character.inventory.length < this.character.inventorySlots) {
          this.character.inventory.push(itemName);
          this.renderer.text(`You've unequipped ${itemName}.`);
          this.emit('message', `You've unequipped ${itemName}.`);
          this.emit('inventory', this.character.inventory);
        } else {
          this.world.location.items.push(itemName);
          this.renderer.text(`You've unequipped ${itemName}, and dropped it on the floor in front of you.`);
          this.emit('message', `You've unequipped ${itemName}, and dropped it on the floor in front of you.`);
          this.emit('location-items', this.world.location.items);
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
    this.emit('stats', this.character);
    if (callback) { callback(); }
  }

  use(itemName, callback) {
    let used = false;
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
      this.emit('error', this.messages.not_in_inventory);
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
      this.emit('error', this.messages.cant_use);
    } else {
      this.advance();
    }
    if (callback) { callback(); }
  }

  search(itemName, callback) {
    const allItems = this.character.inventory.concat(this.world.location.items);
    if (allItems.indexOf(itemName) !== -1 || (!itemName && this.world.location.search)) {
      const item = itemName ? this.items.get(itemName) : this.world.location;
      if (item.search && !item.searched) {
        item.searched = true;
        item.description += ` ${item.search.description}`;
        this.renderer.text(item.search.prints, null, itemName);
        this.emit('message', item.search.prints);
        if (item.search.items) {
          this.world.location.items = this.world.location.items.concat(item.search.items);
        }
        if (item.search.monsters) {
          this.world.location.spawned = this.world.location.spawned
            .concat(item.search.monsters
              .map(monster => new Monster(this.world.monsters.get(monster), this.items)));
        }
        this.emit('location', this.world.location);
        this.advance();
      } else {
        this.emit('message', 'You don\'t find anything new.');
      }
    } else {
      this.renderer.text(this.messages.not_found, { color: 'red' });
      this.emit('error', this.messages.not_found);
    }
    if (callback) { callback(); }
  }

  end(ending, callback) {
    this.loader.get(`data/end/${ending.replace(/ /g, '_')}.yml`).then(data => {
      this.emit('ending', data);
      const endingScene = new Menu(data, this.renderer);
      endingScene.on('play', () => { this.restart(this.play.bind(this)); });
      if (callback) {
        callback();
      }
      endingScene.render();
    });
  }

  go(place, callback) {
    this.world.go(place).then(() => {
      this.renderer.clear();
      this.prompt();
      this.look(null, callback);
      this.emit('location', this.world.location);
    }).catch(e => {
      this.emit('error', e);
    });
  }

  eat(itemName, callback) {
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
      this.emit('error', this.messages.not_in_inventory);
    } else {
      const item = this.items.get(itemName);
      if (!item.health) {
        this.renderer.text(this.messages.not_edible, { color: 'red' });
        this.emit('error', this.messages.not_edible);
      } else {
        this.character.health += item.health;
        if (this.character.health > this.character.maxHealth) {
          this.character.health = this.character.maxHealth;
        }
        this.character.inventory.splice(inventorySlot, 1);
        const color = Math.floor((healthScale.length / this.character.maxHealth)
                                  * this.character.health) - 1;
        const health = this.renderer.style(`${this.character.health}/${this.character.maxHealth}`, { color: healthScale[color] });
        this.emit('message', `You ate the ${this.items.render(itemName)}. Your health is now ${health}`);
        this.renderer.text(`You ate the ${this.items.render(itemName)}. Your health is now ${health}`);
        this.emit('inventory', this.character.inventory);
        this.advance();
      }
    }
    if (callback) { callback(); }
  }

  take(itemName, callback) {
    const item = this.items.get(itemName);
    this.character.take(this.world, item).then(message => {
      this.renderer.text(message);
      this.emit('location-items', this.world.location.items);
      this.emit('inventory', this.character.inventory);
      this.emit('message', message);
      this.advance();
      if (callback) { callback(); }
    }).catch(error => {
      this.emit('error', error);
      this.renderer.text(error, { color: 'red' });
      if (callback) { callback(); }
    });
  }

  info(arg, callback) {
    this.renderer.text(`Health: ${this.character.health}`);
    this.renderer.text(`Armor: ${this.character.armor}`);
    this.renderer.text(`Damage: ${this.character.damage}`);
    this.renderer.text(`Inventory: ${this.character.inventory.join(',')}`);
    this.renderer.text(`Equipment: ${this.character.equipped}`);
    if (callback) { callback(); }
  }

  drop(itemName, callback) {
    const inventorySlot = this.character.inventory.indexOf(itemName);
    if (inventorySlot === -1) {
      this.emit('error', this.messages.not_in_inventory);
      this.renderer.text(this.messages.not_in_inventory, { color: 'red' });
    } else {
      this.world.location.items.push(itemName);
      this.character.inventory.splice(inventorySlot, 1);
      this.emit('message', `You drop the ${itemName}.`);
      this.renderer.text(`You drop the ${itemName}.`);
      this.advance();
    }
    this.emit('location-items', this.world.location.items);
    this.emit('inventory', this.character.inventory);
    if (callback) { callback(); }
  }

  inventory(args, callback) {
    this.renderer.text(`${this.character.inventorySlots} slots, ${this.character.inventorySlots - this.character.inventory.length} free.`);
    if (this.character.inventory.length > 0) {
      this.renderer.text(this.character.inventory.map(item => this.items.render(item)).join('\n'));
    }
    if (callback) { callback(); }
  }

  examine(item, callback) {
    const allItems = this.character.inventory.concat(this.world.location.items);
    if (allItems.indexOf(item) !== -1) {
      this.renderer.text(this.items.get(item).description, null, item);
      this.advance();
    } else {
      this.renderer.text(this.messages.not_found, { color: 'red' });
    }
    if (callback) { callback(); }
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
    if (this.world.location.spawned && this.world.location.spawned.length > 0) {
      const { spawned } = this.world.location;
      this.renderer.text(`Monsters here:\n${spawned.map(item => item.name).join('\n')}`);
    }
    if (this.world.location.connects) {
      this.renderer.text(`This place connects to:\n${this.world.location.connects.join('\n')}`);
    }
    if (callback) {
      if (callback) { callback(); }
    }
  }

  advance() {
    this.time += 1;
    if (this.world.location.monsters && this.world.location.monsters.length > 0) {
      const monstersHere = this.world.location.spawned;

      for (const monster of monstersHere) {
        const damage = monster.attack();
        this.renderer.text(damage.message, null, monster.name);
        this.emit('message-add', damage.message);
        const status = this.character.defend(damage);
        this.renderer.text(status.message, null, 'you');
        this.emit('message-add', status.message);
        if (status.status === 'death') {
          this.emit('death');
        }
      }
    }
    if (this.countdown.length > 0) {
      const time = `[${this.countdown.length} minutes to midnight] `;
      const message = this.countdown.shift();
      this.renderer.text(time + message, { color: 'grey' });
      this.emit('message-add', time + message);
    } else {
      // this.emit('death'); // maybe this should be another event
      this.end('midnight');
    }
    this.prompt();
  }

  menu() {
    this.emit('menu');
  }

  prompt() {
    const healthbar = this.renderer.style('❤'.repeat(this.character.health), { color: 'red' });
    this.renderer.prompt(`${healthbar} | ${this.world.location.name}`);
    this.emit('stats', this.character);
  }

  play() {
    this.renderer.clear();
    this.look();
    this.prompt();
    this.renderer.show();
  }
}

export default Game;
