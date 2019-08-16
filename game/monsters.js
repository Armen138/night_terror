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
    return {
      name: `Unknown monster: ${name}`,
      health: 1,
      damage: 1,
      description: 'This monster was referenced, but not defined.',
    };
  }
}

export default Monsters;
