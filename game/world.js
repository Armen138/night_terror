/* eslint-disable no-param-reassign */
/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
import Events from './events.js';
import Monsters from './monsters.js';
import Monster from './monster.js';

// const this.messages = new Messages('data/this.messages.yml');

class World extends Events {
  constructor(location, loader) {
    super();
    this.loader = loader;
    this.monsters = new Monsters(loader);
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
    const idx = this.location.items.indexOf(item.name);
    if (idx === -1) {
      return { error: this.messages.not_found };
    }
    if (item.static) {
      return { error: this.messages.static_item };
    }
    return { item: this.location.items.splice(idx, 1)[0] };
  }

  loadLocation(location) {
    const promise = new Promise((resolve, reject) => {
      try {
        this.loader.get(`data/locations/${location.replace(/ /g, '_')}.yml`).then(data => {
          if (data.monsters && !data.visited) {
            data.spawned = data.monsters
              .map((monster) => new Monster(this.monsters.get(monster), this.items));
          }
          if (data.ending) {
            this.emit('ending', data.ending);
          }
          this.location = data;
          this.location.visited = true;
          resolve(data);
        }).catch(e => {
          reject(e);
        });
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
}

export default World;
