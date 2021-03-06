const template = `
<v-card
    class="mx-auto"
    dark
    max-width="640"
  >
  <v-img
  :src="locationImage(location.name)"
  class="white--text"
  height="200px"
  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
>
  <v-card-title
    class="fill-height align-end"
  >
  <v-icon
  large
  left
>
  mdi-eye
</v-icon>
<span class="title font-weight-light" style="text-transform: capitalize">{{ location.name }}</span>

  </v-card-title>
</v-img>  
    <v-card-text class="headline">
      {{ location.title }}
    </v-card-text>
    <v-card-text>
      {{ location.description }}
    </v-card-text>
    <v-card-actions v-show="location.search && !location.searched">
    <v-btn small text @click="search">
      search
    </v-btn>
    </v-card-actions>
  </v-card>
`;
const location = {
  name: 'location',
  props: ['game'],
  created() {
    this.game.on('location', (data) => {
      this.location = data;
    });
    this.game.on('ready', () => {
      this.location = this.game.world.location;
    });
  },
  methods: {
    search() {
      this.game.search();
    },
    locationImage(locationName) {
      return `mobile/images/locations/${locationName.replace(/ /g, '_')}.png`;
    },
  },
  data: () => ({
    location: {},
  }),
  template,
};

export default location;
