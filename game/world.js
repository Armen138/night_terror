const yaml = require('js-yaml');
const fs = require('fs');
const banner = require('./banner');
const errors = require('./errors');
const Items = require('./items');

const items = new Items();

class World {
    constructor() {
        this.location = yaml.safeLoad(fs.readFileSync(`data/strange_room.yml`, 'utf8'));
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
                let data = yaml.safeLoad(fs.readFileSync(`data/${location.replace(/ /g, '_')}.yml`, 'utf8'));
                resolve(data);
            } catch (e) {
                reject(e);
            }    
        });
        return promise;
    }
}

module.exports = World;