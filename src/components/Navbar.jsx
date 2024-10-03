import NotificationIcon from '../assets/icons/NotificationIcon';
import ToggleThemeButton from './ToggleThemeButton';

const Navbar = () => {
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support notificaiton.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            window.location.reload();
        } else {
            console.log('Notification permission denied.');
        }
    };

    const confirmToActivateNotification = async () => {
        const option = window.confirm('Do you want to enable notification when time is up?');

        if (option) {
            await requestNotificationPermission();
        } else {
            return;
        }
    };

    return (
        <nav className='fixed top-0 z-50 w-full bg-white dark:bg-slate-700 text-dark-cerulean dark:text-white py-4 flex justify-between px-4 md:px-10 lg:px-32 transition-colors duration-150 shadow-md items-center'>
            <h1 className='text-lg font-semibold'>Pomodoro Timer</h1>
            <div className='flex gap-4'>
                <button onClick={confirmToActivateNotification}>
                    <NotificationIcon className='size-6' variant={Notification.permission} />
                </button>
                <ToggleThemeButton />
            </div>
        </nav>
    );
};

export default Navbar;
