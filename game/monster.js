const errors = require('./errors');
const Items = require('./items');

let items = new Items();
// # Drop Chances:     60%,    40%,      20%,  10%,       1%
const dropChances = {
    "common": 0.6,
    "uncommon": 0.4,
    "rare": 0.2,
    "very rare": 0.1,
    "unique": 0.01
};

const healthStatus = [
    "strong",
    "weakened",
    "weak",
    "barely alive"
];

class Monster {
    constructor(config) {
        // - name: Ancient Zombie
        // description: More bones than flesh, this zombie had obviously spent some time under ground before coming back to ruin your day.
        // health: 5
        // damage: 4
        // drops:
        //   - thigh bone
        //   - leather boots        
        this.name = config.name || "Monster";
        this.health = config.health || 1;
        this.damage = config.damage || 1;
        this.drops = config.drops || [];
        this.maxHealth = this.health;
    }
    drop() {
        let drops = [];
        for(let itemName of this.drops) {
            let item = items.get(itemName);
            let chance = dropChances[item.prevalence];
            let roll = Math.random();
            if(roll <= chance) {
                drops.push(itemName);
            }
        }
        return drops;
    }
    doDamage(roll) {
        let damage = { damage: this.damage, message: `The ${this.name} attacks, and causes significant damage.` };
        if(roll === 1) {
            damage.damage = 0;
            damage.message = `The ${this.name} attacks, but misses!`;
        }
        if(roll === 20) {
            damage.damage *= 2;
            damage.message = `The ${this.name} scores a critical hit! Oh, the humanity!`;
        }
        return damage;
    }
    die() {
        return {
            message: `The ${this.name} dies with a rattle, staring you right in the eye as it expires`,
            drops: this.drop(),
            status: "death"
        }
    }
    defend(damage) {
        this.health -= damage.damage;
        if(this.health <= 0) {
            return this.die();
        } 
        let statusIndex = (healthStatus.length / this.maxHealth * this.health | 0) - 1;  
        return { message: "It just seems to make it angier!", status: healthStatus[statusIndex] };
    }
    attack() {
        let roll = Math.random() * 20 | 0; // standard d20 roll
        return this.doDamage(roll);
    }
}

module.exports = Monster;