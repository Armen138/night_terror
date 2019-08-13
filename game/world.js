/* eslint-disable no-param-reassign */
/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Messages from './messages.js';
import Monsters from './monsters.js';
import Monster from './monster.js';
import Items from './items.js';

const items = new Items();
const monsters = new Monsters();
const messages = new Messages('data/messages.yml');

class World {
  constructor(location, loader) {
    this.loader = loader;
    this.location = location;
  }

  go(location) {
    const promise = new Promise((resolve, reject) => {
      this.loadLocation(location).then((data) => {
        resolve(data);
      }).catch((e) => {
        reject(e);
      });
    });
    return promise;
  }

  take(item) {
    const idx = this.location.items.indexOf(item);
    if (idx === -1) {
      return { error: messages.not_found };
    }
    const worldItem = items.get(this.location.items[idx]);
    if (worldItem.static) {
      return { error: messages.static_item };
    }
    return { item: this.location.items.splice(idx, 1)[0] };
  }

  loadLocation(location) {
    const promise = new Promise((resolve, reject) => {
      try {
        this.loader.get(`data/locations/${location.replace(/ /g, '_')}.yml`).then(data => {
          if (data.monsters) {
            data.monsters = data.monsters.map((monster) => new Monster(monsters.get(monster)));
          }
          this.location = data;
          resolve(data);
        });
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
}

export default World;
