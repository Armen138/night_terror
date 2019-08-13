/* eslint-disable no-restricted-syntax */

class Messages {
  constructor(data) {
    this.data = data;
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
