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
<v-alert class="mx-auto" max-width="640" v-for="(item, index) in items" :key="index" :color="item.color" v-html="item.text"></v-alert>
</div>
`;
const history = {
  name: 'history',
  props: ['game'],
  created() {
    this.game.on('message', (data) => {
      this.items.unshift({ text: data, color: 'primary' });
    });
    this.game.on('message-add', (data) => {
      this.items.unshift({ text: data, color: 'primary' });
    });
    this.game.on('error', (data) => {
      this.items.unshift({ text: data, color: 'error' });
    });
  },
  data: () => ({
    items: [],
  }),
  template,
};

export default history;
