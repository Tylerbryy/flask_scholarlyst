module.exports = {
  content: ['templates/index.html', 'static/scripts.js'],
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