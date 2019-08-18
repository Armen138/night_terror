/* eslint-disable import/extensions */
/* eslint-disable arrow-parens */

class WebLoader {
  constructor() {
    this.files = {};
    // console.log(yaml);
  }

  save(data) {
    localStorage.files = JSON.stringify(this.files);
    localStorage.data = JSON.stringify(data);
  }

  load() {
    if (localStorage.files) {
      this.files = JSON.parse(localStorage.files);
    } else {
      throw (new Error('Failed to load game'));
    }
    if (localStorage.data) {
      return JSON.parse(localStorage.data);
    }
    return {};
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
