/* eslint-disable no-control-regex */
const titles = {
  titles: [
    'I think I heard something. Did you hear something?',
    'Welcome, unfortunate soul. Make yourself comfortable.',
    'There are things that go GHAWRAWARAAAAGGHHH in the night.',
  ],
  header: (title, containerSize) => {
    // strip ansi escape codes (colors) that artificially inflate the text length
    const cleanTitle = title.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    if (cleanTitle.length < containerSize) {
      const spacer = ' '.repeat((containerSize - cleanTitle.length) / 2);
      const spacedTitle = spacer + title + spacer;
      return spacedTitle;
    }
    return title;
  },
  random: (containerSize) => {
    const idx = Math.floor(Math.random() * titles.titles.length);
    const title = titles.titles[idx];
    return titles.header(title, containerSize);
  },
};

export default titles;
