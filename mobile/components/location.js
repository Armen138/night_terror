const template = `
<v-card
    class="mx-auto"
    dark
    max-width="640"
  >
  <v-img
  src="mobile/images/strange_room.jpg"
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
  data: () => ({
    location: {},
  }),
  template,
};

export default location;
