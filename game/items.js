const fs = require('fs');
const yaml = require('js-yaml');
const chalk = require('chalk');

const itemColors = {
    "common": "green",
    "uncommon": "yellow",
    "rare": "cyan",
    "very rare": "magenta",
    "unique": "white",
    "static": "grey"
};

class Items {
    constructor() {
        this.data = yaml.safeLoad(fs.readFileSync(`data/items.yml`, 'utf8'));
    }
    get(itemName) {
        for(let item of this.data) {
            if(item.name == itemName) {
                return item;
            }
        }
        return null;
    }
    render(itemName) {
        let item = this.get(itemName);
        let damage = item.damage ? "🗡️".repeat(item.damage) : "";
        let health = item.health ? chalk.red("❤︎".repeat(item.health)) : "";
        let armor = item.armor ? chalk.yellow("🛡️".repeat(item.armor)) : "";
        return item ? chalk[itemColors[item.prevalence]](item.name) + " " + damage + health + armor: "unknown item";
    }
}

module.exports = Items;