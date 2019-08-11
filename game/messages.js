/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import yaml from 'js-yaml';

class Messages {
  constructor(fileName) {
    this.data = yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
    const keys = Object.keys(this.data);
    for (const key of keys) {
      Object.defineProperty(this, key, {
        get() {
          return this.random(key);
        },
      });
    }
  }

  random(list) {
    const idx = Math.floor(Math.random() * this.data[list].length);
    return this.data[list][idx];
  }
}

export default Messages;
