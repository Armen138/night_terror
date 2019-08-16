/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const template = /* html */`
<div>
<v-card
    class="mx-auto ma-2 pb-2"
    dark
    max-width="640"
    >
  <v-card-title>
    <v-icon
      large
      left
    >
      mdi-history
    </v-icon>
    <span class="title font-weight-light">History</span>
  </v-card-title>
</v-card>
<v-alert v-for="item in items" :type="item.type" v-html="item.text"></v-alert>
</div>
`;
const history = {
  name: 'history',
  props: ['game'],
  created() {
    this.game.on('message', (data) => {
      this.items.unshift({ text: data, type: 'primary' });
    });
    this.game.on('message-add', (data) => {
      this.items.unshift({ text: data, type: 'primary' });
    });
    this.game.on('error', (data) => {
      this.items.unshift({ text: data, type: 'error' });
    });
  },
  methods: {
    unequip(item) {
      this.game.unequip(item.name, () => { });
    },
    itemImage(item) {
      return `mobile/images/items/${item.name.replace(/ /g, '_')}.png`;
    },
  },
  data: () => ({
    items: [],
  }),
  template,
};

export default history;
