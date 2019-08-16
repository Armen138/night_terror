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
      mdi-sword
    </v-icon>
    <span class="title font-weight-light">Equipment</span>
  </v-card-title>
</v-card>
<v-card
class="mx-auto mb-2"
max-width="640"
v-for="(item, index) in items"
:key="index"
dark
outlined
>
<v-list-item three-line>
  <v-list-item-content>
    <div class="overline mb-4">{{ item.prevalence }}</div>
    <v-list-item-subtitle>{{ item.slot }}</v-list-item-subtitle>
    <v-list-item-title class="headline mb-1" v-html="game.items.render(item.name)"></v-list-item-title>
    <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
  </v-list-item-content>

  <v-list-item-avatar
    tile
    size="80"
    color="grey"
  >
  <v-img :src="itemImage(item)"></v-img>
  </v-list-item-avatar>
</v-list-item>

<v-card-actions>
  <v-btn small text @click='unequip(item)'>unequip</v-btn>
</v-card-actions>
</v-card>

  </div>
`;
const equipment = {
  name: 'equipment',
  props: ['game'],
  created() {
    this.game.on('stats', (data) => {
      this.items = [];
      for (const item in data.equipment) {
        if (data.equipment[item]) {
          const itemCopy = {};
          console.log(data.equipment[item]);
          itemCopy.description = data.equipment[item].description;
          itemCopy.prevalence = data.equipment[item].prevalence;
          itemCopy.name = data.equipment[item].name;
          itemCopy.damage = data.equipment[item].damage;
          itemCopy.armor = data.equipment[item].armor;
          itemCopy.slot = item;
          this.items.push(itemCopy);
        }
      }
    });
    // this.game.on('ready', () => {
    //   this.items = this.game.character.inventory.map((item) => this.game.items.get(item));
    // });
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
    snackbar: false,
    dialog: false,
    max: 2,
    used: 0,
    selected: {},
    items: [],
  }),
  template,
};

export default equipment;
