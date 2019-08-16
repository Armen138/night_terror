/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import location from './mobile/components/location.js';
import inventory from './mobile/components/inventory.js';
import items from './mobile/components/items.js';
import profile from './mobile/components/profile.js';
import monsters from './mobile/components/monsters.js';
import stats from './mobile/components/stats.js';
import go from './mobile/components/go.js';
import equipment from './mobile/components/equipment.js';
import history from './mobile/components/history.js';

import Game from './game/game.js';
import Menu from './game/menu.js';
// import WebRenderer from './game/webrenderer.js';
import DummyRenderer from './game/dummyrenderer.js';
import WebLoader from './game/webloader.js';

const loader = new WebLoader();
const game = new Game(new DummyRenderer(), loader);

Vue.component(location.name, location);
Vue.component(inventory.name, inventory);
Vue.component(items.name, items);
Vue.component(profile.name, profile);
Vue.component(monsters.name, monsters);
Vue.component(stats.name, stats);
Vue.component(go.name, go);
Vue.component(equipment.name, equipment);
Vue.component(history.name, history);

const vue = new Vue({
  el: '#app',
  created() {
    game.on('message', (message) => {
      this.notification = message;
      this.snackbar = true;
      this.notificationColor = 'primary';
    });
    game.on('message-add', (message) => {
      this.notification = [this.notification, message].join('<br>');
      this.snackbar = true;
      this.notificationColor = 'primary';
    });
    game.on('error', (message) => {
      this.notification = message;
      this.notificationColor = 'error';
      this.snackbar = true;
    });
  },
  data: () => ({
    game,
    notification: '',
    notificationColor: 'primary',
    snackbar: false,
    view: 'look',
    inventory: false,
  }),
  vuetify: new Vuetify(),
});
