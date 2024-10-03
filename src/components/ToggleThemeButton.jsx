import SunIcon from '../assets/icons/SunIcon';
import MoonIcon from '../assets/icons/MoonIcon';
import { useEffect, useState } from 'react';

const ToggleThemeButton = () => {
    const [darkMode, setDarkMode] = useState(
        () => JSON.parse(localStorage.getItem('dark-theme')) || false
    );

    const toggleThemeHandler = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode);
        localStorage.setItem('dark-theme', !darkMode);
    };

    useEffect(() => {
        if (localStorage.getItem('dark-theme') !== undefined) {
            document.documentElement.classList.toggle(
                'dark',
                JSON.parse(localStorage.getItem('dark-theme'))
            );
            setDarkMode(JSON.parse(localStorage.getItem('dark-theme')));
        }
    }, []);

    return (
        <button onClick={toggleThemeHandler}>
            <span className='flex w-16 h-8 bg-slate-200 dark:bg-slate-500 rounded-full items-center px-2 relative text-dark-cerulean dark:text-white'>
                <SunIcon
                    className={`rounded-full size-4 aspect-square absolute ${
                        !darkMode
                            ? 'translate-x-0 opacity-100 rotate-0'
                            : 'translate-x-8 opacity-0 rotate-90'
                    } transition-all duration-500`}
                />
                <MoonIcon
                    className={`rounded-full size-4 aspect-square absolute ${
                        darkMode
                            ? 'translate-x-8 opacity-100 rotate-0'
                            : 'translate-x-0 opacity-0 -rotate-90'
                    } transition-all duration-500`}
                />
            </span>
        </button>
    );
};

export default ToggleThemeButton;
