import { useEffect, useState } from 'react';
import ResetIcon from './assets/icons/ResetIcon';
import Navbar from './components/Navbar';
import usePomodoroTimer from './hooks/usePomodoroTimer';
import CustomDurationModal from './components/CustomDurationModal';
import useModal from './hooks/useModal';

function App() {
    const DURATION = { focus: 1500, rest: 300, cycle: 4 };
    const [focusDuration, setFocusDuration] = useState(DURATION.focus);
    const [restDuration, setRestDuration] = useState(DURATION.rest);
    const [initialTime, setInitialTime] = useState(focusDuration);
    const [status, setStatus] = useState('focus');
    const [totalCycles, setTotalCycles] = useState(DURATION.cycle);
    const [cycle, setCycle] = useState(1);

    const showNotification = () => {
        if (Notification.permission === 'granted') {
            const notification = new Notification(`${status.toLocaleUpperCase()} time is up!`, {
                body: `${
                    status === 'focus'
                        ? `You can rest for ${Math.floor((restDuration / 60) * 100) / 100} minutes`
                        : status === 'rest' && cycle === totalCycles
                        ? `All cycle completed!\ncycle : ${cycle} / ${totalCycles}`
                        : `Let's start focus again for ${Math.floor((focusDuration / 60) * 100) / 100} minutes, cycle : ${cycle}/${totalCycles}`
                }`,
            });

            notification.onclick = () => {
                window.focus();
            };
        } else {
            console.log('Notification permission denied.');
        }
    };

    const handleExpired = () => {
        showNotification();
    };

    const changeStatus = () => {
        setStatus((prev) => {
            if (prev === 'focus') {
                setInitialTime(restDuration);
                startTimer();
                return 'rest';
            } else {
                if (cycle === totalCycles) {
                    setInitialTime(focusDuration);
                    setCycle(1);
                    resetTimer();
                    return 'focus';
                } else {
                    setInitialTime(focusDuration);
                    startTimer();
                    setCycle(cycle + 1);
                    return 'focus';
                }
            }
        });
    };

    const { timeLeft, isActive, startTimer, resetTimer } = usePomodoroTimer(initialTime, handleExpired, changeStatus);
    const { isShow: isShowModal, showModal, closeModal } = useModal();

    const handleOnChangeFocusDuration = (ev) => {
        const newDuration = ev.target.value;
        setFocusDuration(newDuration === '' ? null : newDuration * 60);
    };

    const handleOnChangeRestDuration = (ev) => {
        const newDuration = ev.target.value;
        setRestDuration(newDuration === '' ? null : newDuration * 60);
    };

    const handleOnChangeTotalCycles = (ev) => {
        const newValue = ev.target.value;
        setTotalCycles(newValue === '' ? null : newValue * 1);
    };

    const resetDuration = () => {
        setFocusDuration(DURATION.focus);
        setRestDuration(DURATION.rest);
        setTotalCycles(DURATION.cycle);
    };

    const resetAll = () => {
        setStatus('focus');
        setInitialTime(DURATION.focus);
        setCycle(1);
        resetTimer();
    };

    useEffect(() => {
        setInitialTime(focusDuration);
    }, [focusDuration]);

    return (
        <>
            <Navbar />
            <div
                className={`w-full relative z-0 min-h-screen grid place-content-center transition-colors duration-500 ${
                    isActive ? (status === 'focus' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-100 dark:bg-slate-800'
                }`}
            >
                <div className={`flex gap-3 text-dark-cerulean dark:text-white text-6xl md:text-8xl justify-center ${isActive && 'text-white'}`}>
                    <p>
                        {Math.floor(timeLeft / 3600)
                            .toString()
                            .padStart(2, '0')}
                    </p>
                    <p>:</p>
                    <p>
                        {Math.floor((timeLeft / 60) % 60)
                            .toString()
                            .padStart(2, '0')}
                    </p>
                    <p>:</p>
                    <p>
                        {Math.floor(timeLeft % 60)
                            .toString()
                            .padStart(2, '0')}
                    </p>
                </div>
                <div className='flex relative justify-center'>
                    <button
                        className='bg-ocean-green disabled:bg-slate-500 text-white rounded-md w-fit px-10 disabled:ring-0 py-2 mt-8 hover:ring-1 ring-white transition-all duration-150 active:scale-90 relative z-10'
                        onClick={startTimer}
                        disabled={isActive}
                    >
                        Start
                    </button>
                    <button
                        className={`text-white bg-rose-500 disabled:bg-slate-500 disabled:active:scale-100 disabled:ring-0 rounded-md w-fit p-2 mt-8 hover:ring-1 ring-white transition-all duration-300 active:scale-90 group absolute z-0 ${
                            !isActive ? 'translate-x-0 scale-[80%]' : 'translate-x-[calc(100%_+_56px)] scale-100'
                        }`}
                        onClick={resetAll}
                        disabled={!isActive}
                    >
                        <ResetIcon className='size-6 group-hover:rotate-180 group-disabled:group-hover:rotate-0 transition-all duration-500' />
                    </button>
                </div>
                <p className={`text-slate-500 hover:underline hover:cursor-pointer mt-6 text-center ${isActive ? 'invisible' : 'visible'}`} onClick={() => showModal()}>
                    Custom duration?
                </p>
                <div className='flex flex-col gap-4 mt-2'>
                    <h1
                        className={`text-5xl font-semibold text-center text-dark-cerulean dark:text-white ${
                            isActive ? 'opacity-100 text-white' : 'opacity-0'
                        } transition-all duration-500`}
                    >
                        {status.toUpperCase()}
                    </h1>
                    <p className={`text-lg text-center text-dark-cerulean dark:text-white ${isActive ? 'visible text-white' : 'invisible'}`}>
                        Cycles : {cycle}/{totalCycles}
                    </p>
                </div>
            </div>
            <CustomDurationModal
                focusDuration={focusDuration}
                restDuration={restDuration}
                totalCycles={totalCycles}
                handleOnChangeFocusDuration={handleOnChangeFocusDuration}
                handleOnChangeRestDuration={handleOnChangeRestDuration}
                handleOnChangeTotalCycles={handleOnChangeTotalCycles}
                resetDuration={resetDuration}
                isShowModal={isShowModal}
                closeModal={closeModal}
            />
        </>
    );
}

export default App;
