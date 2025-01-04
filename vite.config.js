import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Pomodoro Timer',
                short_name: 'Pomodoro',
                description: 'A simple pomodoro timer app',
                theme_color: '#184E77',
                background_color: '#FFFFFF',
                display: 'standalone',
                start_url: '/pomodoro-timer/',
                icons: [
                    {
                        src: '/logo.png',
                        sizes: '256x256',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    base: '/pomodoro-timer/',
});
