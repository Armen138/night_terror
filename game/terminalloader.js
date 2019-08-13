import fs from 'fs';
import yaml from 'js-yaml';

class TerminalLoader {
  constructor() {
    this.files = {};
  }

  get(filename) {
    const promise = new Promise((resolve, reject) => {
      if (this.files[filename]) {
        resolve(this.files[filename]);
      } else {
        fs.readFile(filename, 'utf8', (err, data) => {
          if (err) {
            reject(new Error('failure reading file'));
          } else {
            const parsed = yaml.safeLoad(data);
            this.files[filename] = parsed;
            resolve(parsed);
          }
        });
      }
    });
    return promise;
  }
}

export default TerminalLoader;
