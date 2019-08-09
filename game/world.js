const yaml = require('js-yaml');
const fs = require('fs');
const banner = require('./banner');
const errors = require('./errors');
const Items = require('./items');
const Monsters = require('./monsters');
const Monster = require('./monster');

const items = new Items();
const monsters = new Monsters();

class World {
    constructor(config) {
        this.config = config;
        this.location = yaml.safeLoad(fs.readFileSync(`data/locations/${config.spawn.replace(/ /g, '_')}.yml`, 'utf8'));
    }
    go(location) {
        let promise = new Promise((resolve, reject) => {
            this.loadLocation(location).then(data => {
                this.location = data;
                resolve(data);
            }).catch(e => {
                reject(e);
            });
        });
        return promise;
    }
    take(item) {
        let idx = this.location.items.indexOf(item); 
        if(idx == -1) {
            return { error: errors.notfound() };
        }
        let worldItem = items.get(this.location.items[idx]);
        if(worldItem.static) {
            return { error: errors.staticitem() };
        }
        return { item: this.location.items.splice(idx, 1)[0] };
    }
    loadLocation(location) {
        let promise = new Promise((resolve, reject) => {
            try {
                let data = yaml.safeLoad(fs.readFileSync(`data/locations/${location.replace(/ /g, '_')}.yml`, 'utf8'));
                if(data.monsters) {
                    data.monsters = data.monsters.map(monster => new Monster(monsters.get(monster)))
                }
                resolve(data);
            } catch (e) {
                reject(e);
            }    
        });
        return promise;
    }
}

module.exports = World;