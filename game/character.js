/* eslint-disable arrow-parens */
/* eslint-disable import/extensions */
/* eslint-disable no-restricted-syntax */
import errors from './errors.js';

class Character {
  constructor() {
    this.inventory = [];
    this.inventorySlots = 2;
    this.health = 10;
    this.maxHealth = 10;
    this.equipment = {
      leftHand: null, // secondary weapon
      rightHand: null, // weapon
      finger: null, // rings
      head: null, // head covering armor
      torso: null, // shirts
      legs: null, // pants
      feet: null, // boots or shoes
      neck: null, // amulets and charms
    };
  }

  get equipped() {
    return Object.values(this.equipment).filter(item => item !== null).map(item => item.name);
  }

  get armor() {
    let armor = 0;
    for (const equipSlot in this.equipment) {
      if (this.equipment[equipSlot] && this.equipment[equipSlot].armor) {
        armor += this.equipment[equipSlot].armor;
      }
    }
    return armor;
  }

  get damage() {
    let damage = 1; // bare knuckle punches, 1 damage
    for (const equipSlot in this.equipment) {
      if (this.equipment[equipSlot] && this.equipment[equipSlot].damage) {
        damage += this.equipment[equipSlot].damage;
      }
    }
    return damage;
  }

  take(world, item) {
    const promise = new Promise((resolve, reject) => {
      if (this.inventory.length < this.inventorySlots) {
        const worldItem = world.take(item);
        if (worldItem.error) {
          reject(worldItem.error);
        } else {
          this.inventory.push(worldItem.item);
          resolve(`You have added ${item} to your inventory.`);
        }
      } else {
        reject(errors.inventoryfull());
      }
    });
    return promise;
  }

  doDamage(roll) {
    const damage = { damage: this.damage, message: 'You attack, and causes significant damage.' };
    if (roll === 1) {
      damage.damage = 0;
      damage.message = 'You attack, but miss!';
    }
    if (roll === 20) {
      damage.damage *= 2;
      damage.message = 'You score a critical hit!';
    }
    return damage;
  }

  defend(damage) {
    const penalty = Math.max(damage.damage - this.armor, 0);
    this.health -= penalty;
    if (this.health <= 0) {
      return {
        message: 'Ah, so this is it... this is where the adventure ends. We had a good run though, didn\'t we?',
        status: 'death',
      };
    }
    return { message: "'Tis but a scratch!" };
  }

  attack() {
    const roll = Math.floor(Math.random() * 20); // standard d20 roll
    return this.doDamage(roll);
  }
}

export default Character;
