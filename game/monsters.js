/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
/* eslint-disable no-restricted-syntax */
import Events from './events.js';

class Monsters extends Events {
  constructor(loader) {
    super();
    loader.get('data/monsters.yml').then(data => {
      this.data = data;
      this.emit('ready');
    });
  }

  get(name) {
    for (const monster of this.data) {
      if (monster.name === name) {
        return monster;
      }
    }
    return null;
  }
}

export default Monsters;
