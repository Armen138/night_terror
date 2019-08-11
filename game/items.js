/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import yaml from 'js-yaml';
import chalk from 'chalk';

const itemColors = {
  common: 'green',
  uncommon: 'yellow',
  rare: 'cyan',
  'very rare': 'magenta',
  unique: 'white',
  static: 'grey',
};

class Items {
  constructor() {
    this.data = yaml.safeLoad(fs.readFileSync('data/items.yml', 'utf8'));
  }

  get(itemName) {
    for (const item of this.data) {
      if (item.name === itemName) {
        return item;
      }
    }
    return null;
  }

  render(itemName) {
    const item = this.get(itemName);
    const damage = item.damage ? '🗡️'.repeat(item.damage) : '';
    const health = item.health ? chalk.red('❤︎'.repeat(item.health)) : '';
    const armor = item.armor ? chalk.yellow('🛡️'.repeat(item.armor)) : '';
    return item ? `${chalk[itemColors[item.prevalence]](item.name)} ${damage}${health}${armor}` : 'unknown item';
  }
}

export default Items;
