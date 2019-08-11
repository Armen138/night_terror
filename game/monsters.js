/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import yaml from 'js-yaml';
// import chalk from 'chalk';

class Monsters {
  constructor() {
    this.data = yaml.safeLoad(fs.readFileSync('data/monsters.yml', 'utf8'));
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
