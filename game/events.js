/* eslint-disable no-restricted-syntax */
class Events {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, args) {
    if (!this.events[event]) return;
    for (const callback of this.events[event]) {
      callback(args);
    }
  }
}

export default Events;
