const requireIcons = require.context('./', false, /\.(webp)$/);

const icons = {};
requireIcons.keys().forEach((filename) => {
  const key = filename.replace('./', '');
  icons[key] = requireIcons(filename);
});

export default icons;
