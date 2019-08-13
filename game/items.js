/* eslint-disable import/extensions */
/* eslint-disable arrow-parens */
/* eslint-disable no-restricted-syntax */
import Events from './events.js';

const itemColors = {
  common: 'green',
  uncommon: 'yellow',
  rare: 'cyan',
  'very rare': 'magenta',
  unique: 'white',
  static: 'grey',
};

class Items extends Events {
  constructor(renderer, loader) {
    super();
    this.renderer = renderer;
    loader.get('data/items.yml').then(data => {
      this.data = data;
      this.emit('ready');
    });
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
