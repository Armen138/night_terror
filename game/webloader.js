/* eslint-disable import/extensions */
/* eslint-disable arrow-parens */
// import yaml from 'js-yaml';
// import * as yaml from '../node_modules/js-yaml/dist/js-yaml.js';

class WebLoader {
  constructor() {
    this.files = {};
    // console.log(yaml);
  }

  get(filename) {
    const promise = new Promise((resolve, reject) => {
      if (this.files[filename]) {
        resolve(this.files[filename]);
      } else {
        fetch(filename).then(data => data.text()).then(data => {
          // eslint-disable-next-line no-undef
          const parsed = jsyaml.safeLoad(data);
          this.files[filename] = parsed;
          resolve(parsed);
        }).catch(reject);
      }
    });
    return promise;
  }
}

export default WebLoader;
