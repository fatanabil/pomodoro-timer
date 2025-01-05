import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/pomodoro-timer/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
