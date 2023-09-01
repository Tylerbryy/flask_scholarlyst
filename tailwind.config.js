module.exports = {
  content: ['Scholarlyst_flask/templates/index.html', 'Scholarlyst_flask/static/scripts.js'],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
  
}