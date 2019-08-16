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
      mdi-bag-personal
    </v-icon>
    <span class="title font-weight-light">Inventory</span>
    <v-spacer></v-spacer>{{ used }}/{{ max }}
  </v-card-title>
</v-card>
<v-card
class="mx-auto mb-2"
max-width="640"
v-for="(item, index) in items"
dark
outlined
>
<v-list-item three-line>
  <v-list-item-content>
    <div class="overline mb-4">{{ item.prevalence }}</div>
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
  <v-btn small text @click='use(item)' v-show="item.consumable || isUsable(item)">use</v-btn>
  <v-btn small text @click='eat(item)' v-show="item.health">eat</v-btn>
  <v-btn small text @click='equip(item)' v-show="item.equip">equip</v-btn>
  <v-btn small text @click='drop(item)'>drop</v-btn>
</v-card-actions>
</v-card>

    <v-snackbar
    v-model="snackbar"
  ><span>
  You've added <span style="color: yellow">{{ selected.name }}</span> to your inventory.
  </span>
  <v-btn
      color="pink"
      text
      multi-line
      @click="snackbar = false"
    >
      Close
    </v-btn>
  </v-snackbar> 
  <v-dialog
      v-model="dialog"
      max-width="290"
      dark
    >
      <v-card>
        <v-card-title class="headline">{{ selected.name }}</v-card-title>

        <v-card-text>
          {{ selected.description }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            I see.
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
`;
const inventory = {
  name: 'inventory',
  props: ['game'],
  created() {
    this.game.on('location', () => {
      this.$forceUpdate();
    });
    this.game.on('inventory', (data) => {
      this.items = data.map((item) => this.game.items.get(item));
      this.max = this.game.character.inventorySlots;
      this.used = data.length;
    });
    this.game.on('ready', () => {
      this.items = this.game.character.inventory.map((item) => this.game.items.get(item));
    });
  },
  methods: {
    use(item) {
      this.game.use(item.name, () => {});
    },
    eat(item) {
      this.game.eat(item.name, () => {});
    },
    equip(item) {
      this.game.equip(item.name, () => {});
    },
    drop(item) {
      this.game.drop(item.name, () => {});
    },
    examine(item) {
      this.game.examine(item.name, () => {});
    },
    itemImage(item) {
      return `mobile/images/items/${item.name.replace(/ /g, '_')}.png`;
    },
    isUsable(item) {
      if (this.game.world) {
        for (const worldItem of this.game.world.location.items) {
          if (this.game.items.get(worldItem)['reacts with'] === item.name) {
            return true;
          }
        }
      }
      return false;
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

export default inventory;
