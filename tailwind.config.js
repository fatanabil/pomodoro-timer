/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'dark-cerulean': {
                    100: '#EAF6FF',
                    400: '#3D6F95',
                    DEFAULT: '#184E77',
                },
                'ocean-green': {
                    DEFAULT: '#52B69A',
                },
                'key-lime': {
                    DEFAULT: '#D9ED92',
                },
            },
        },
    },
    plugins: [],
};
