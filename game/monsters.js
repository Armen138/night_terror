const fs = require('fs');
const yaml = require('js-yaml');
const chalk = require('chalk');

class Monsters {
    constructor() {
        this.data = yaml.safeLoad(fs.readFileSync(`data/monsters.yml`, 'utf8'));
    }
    get(name) {
        for(let monster of this.data) {
            if(monster.name == name) {
                return monster;
            }
        }
        return null;
    }
}

module.exports = Monsters;