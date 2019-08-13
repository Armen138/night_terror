/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import yaml from 'js-yaml';

const itemColors = {
  common: 'green',
  uncommon: 'yellow',
  rare: 'cyan',
  'very rare': 'magenta',
  unique: 'white',
  static: 'grey',
};

class Items {
  constructor(renderer) {
    this.renderer = renderer;
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
    const health = item.health ? this.renderer.style('❤︎'.repeat(item.health), { color: 'red' }) : '';
    const armor = item.armor ? this.renderer.style('🛡️'.repeat(item.armor), { color: 'yellow' }) : '';
    return item ? this.renderer.style(`${item.name} ${damage}${health}${armor}`, { color: itemColors[item.prevalence] }) : 'unknown item';
  }
}

export default Items;
