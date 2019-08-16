const template = /* html */`
<v-card
    class="mx-auto ma-2"
    dark
    max-width="640"
    v-show="items.length > 0"
  >
    <v-card-title>
      <v-icon
        large
        left
      >
        mdi-emoticon-devil
      </v-icon>
      <span class="title font-weight-light">Monsters here</span>
    </v-card-title>
    <v-card-text>
    <v-list two-line>

      <template v-for="(item, index) in items">
        <v-list-item :key="item.name">
          <template v-slot:default="{ active, toggle }">
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
              <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
              <v-progress-linear rounded color="red" :value="item.maxHealth / item.health * 100" height="10"></v-progress-linear>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="attack(item)">
              <v-icon color="grey lighten-1">
                mdi-sword
              </v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider
          v-if="index + 1 < items.length"
          :key="index"
        ></v-divider>
      </template>

  </v-list>
    </v-card-text>
    <v-snackbar
    v-model="snackbar"
  ><span>
  You've added <span style="color: yellow">item with super long name</span> to your inventory.
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
  </v-card>
`;
const monsters = {
  name: 'monsters',
  props: ['game'],
  created() {
    this.game.on('location', (location) => {
      this.items = location.spawned || [];
    });
    this.game.on('ready', () => {
      this.items = this.game.world.location.spawned || [];
    });
    this.game.on('monsters', (spawned) => {
      this.items = spawned || [];
    });
  },
  methods: {
    attack(item) {
      this.game.attack(item.name, () => {});
    },
  },
  data: () => ({
    snackbar: false,
    items: [],
  }),
  template,
};

export default monsters;
