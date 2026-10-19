export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B4FE8',
        secondary: '#F5A623',
        success: '#22C55E',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
};
