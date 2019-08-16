const template = /* html */`
<v-card
    class="mx-auto ma-2"
    dark
    max-width="640"
    v-if="items.length > 0"
  >
    <v-card-title>
      <v-icon
        large
        left
      >
        mdi-bag-personal
      </v-icon>
      <span class="title font-weight-light">Items here</span>
    </v-card-title>
    <v-card-text>
    <v-list two-line>

    <template v-for="(item, index) in items">
      <v-list-item :key="item.title">
        <template v-slot:default="{ active, toggle }">
          <v-list-item-content>
            <v-list-item-title v-html="game.items.render(item.name)"></v-list-item-title>
            <v-list-item-subtitle v-text="item.prevalence"></v-list-item-subtitle>
            <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
          <v-btn icon @click="dialog = true; selected=item">
          <v-icon color="grey lighten-1">
            mdi-eye
          </v-icon>
          </v-btn>

          <v-btn icon @click="take(item)" v-show="item.prevalence !== 'static'">
            <v-icon color="grey lighten-1">
              mdi-hand
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
  </v-card>
`;
const items = {
  name: 'items',
  props: ['game'],
  created() {
    this.game.on('location', (data) => {
      this.items = data.items.map((item) => this.game.items.get(item));
    });
    this.game.on('location-items', (data) => {
      this.items = data.map((item) => this.game.items.get(item));
    });
    this.game.on('ready', () => {
      this.items = this.game.world.location.items.map((item) => this.game.items.get(item));
    });
  },
  methods: {
    take(item) {
      this.game.take(item.name);
    },
  },
  data: () => ({
    snackbar: false,
    dialog: false,
    selected: {},
    items: [],
  }),
  template,
};

export default items;
