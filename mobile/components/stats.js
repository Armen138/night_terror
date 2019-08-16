const template = `<v-card 
class="mx-auto mb-2" max-width="640" color="#5d4037" dark>
    <v-list-item>
      <v-icon color="red">mdi-heart</v-icon>&nbsp;
      <v-progress-linear rounded color="red" :value="health * 10" height="20"></v-progress-linear>
    </v-list-item>
    <v-list-item>
      <v-icon color="yellow">mdi-shield</v-icon>&nbsp;
      <v-progress-linear rounded color="yellow" :value="armor * 10" height="20"></v-progress-linear>
    </v-list-item>
    <v-list-item>
      <v-icon color="green">mdi-sword</v-icon>&nbsp;
      <v-progress-linear rounded color="green" :value="damage * 10" height="20"></v-progress-linear>
    </v-list-item>
</v-card>
`;
const stats = {
  name: 'stats',
  props: ['game'],
  created() {
    this.game.on('ready', () => {
      this.health = this.game.character.health;
      this.armor = this.game.character.armor;
      this.damage = this.game.character.damage;
    });
    this.game.on('stats', (character) => {
      this.health = character.health;
      this.armor = character.armor;
      this.damage = character.damage;
    });
  },
  data: () => ({
    health: 0,
    armor: 0,
    damage: 0,
  }),
  template,
};

export default stats;
