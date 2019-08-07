const errors = require('./errors');

class Character {
    constructor() {
        this.inventory = [];
        this.inventorySlots = 2;
        this.health = 10;
        this.maxHealth = 10;
        this.armor = 0;
        this.equipment = {
            leftHand: null,         // secondary weapon
            rightHand: null,        // weapon
            finger: null,           // rings
            head: null,             // head covering armor
            torso: null,            // shirts
            legs: null,             // pants
            feet: null,             // boots or shoes
            neck: null,             // amulets and charms
        }
    }
    take(world, item) {
        let promise = new Promise((resolve, reject) => {
            if(this.inventory.length < this.inventorySlots) {
                let worldItem = world.take(item);
                if(worldItem.error) {
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
}

module.exports = Character;