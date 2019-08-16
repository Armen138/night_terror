const template = `<v-app-bar app dark class="mb-2" color="#BF360C" fixed>
<v-app-bar-nav-icon></v-app-bar-nav-icon>
<v-toolbar-title>Night Terror</v-toolbar-title>
</v-app-bar>`;
const profile = {
  name: 'profile',
  data: () => ({
    snackbar: false,
    health: 10,
    armor: 4,
    damage: 1,
  }),
  template,
};

export default profile;
