/* eslint-disable import/extensions */
import fs from 'fs';
import yaml from 'js-yaml';
import errors from './errors.js';
import Monsters from './monsters.js';
import Monster from './monster.js';
import Items from './items.js';

const items = new Items();
const monsters = new Monsters();

class World {
  constructor(config) {
    this.config = config;
    this.location = yaml.safeLoad(fs.readFileSync(`data/locations/${config.spawn.replace(/ /g, '_')}.yml`, 'utf8'));
  }

  go(location) {
    const promise = new Promise((resolve, reject) => {
      this.loadLocation(location).then((data) => {
        // this.location = data;
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
      return { error: errors.notfound() };
    }
    const worldItem = items.get(this.location.items[idx]);
    if (worldItem.static) {
      return { error: errors.staticitem() };
    }
    return { item: this.location.items.splice(idx, 1)[0] };
  }

  loadLocation(location) {
    const promise = new Promise((resolve, reject) => {
      try {
        const data = yaml.safeLoad(fs.readFileSync(`data/locations/${location.replace(/ /g, '_')}.yml`, 'utf8'));
        if (data.monsters) {
          data.monsters = data.monsters.map((monster) => new Monster(monsters.get(monster)));
        }
        this.location = data;
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
}

export default World;
