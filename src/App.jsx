import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import ResetIcon from './assets/icons/ResetIcon';
import Navbar from './components/Navbar';
import usePomodoroTimer from './hooks/usePomodoroTimer';
import CustomDurationModal from './components/CustomDurationModal';
import useModal from './hooks/useModal';
import usePictureInPicture from './hooks/usePictureInPicture';
import PiPWindow from './components/PiPWindow';

function App() {
    const DURATION = { focus: 1500, rest: 300, cycle: 4 };
    const [focusDuration, setFocusDuration] = useState(DURATION.focus);
    const [restDuration, setRestDuration] = useState(DURATION.rest);
    const [initialTime, setInitialTime] = useState(focusDuration);
    const [status, setStatus] = useState('focus');
    const [totalCycles, setTotalCycles] = useState(DURATION.cycle);
    const [cycle, setCycle] = useState(1);
    const [pipEnabled, setPipEnabled] = useState(() => {
        const saved = localStorage.getItem('pip-enabled');
        return saved !== null ? JSON.parse(saved) : true; // default true
    });

    const showNotification = () => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.active.postMessage({
                        type: 'NOTIFICATION_UPDATE',
                        data: {
                            title: `${status.toLocaleUpperCase()} time is up!`,
                            body: (() => {
                                if (status === 'rest' && cycle === totalCycles) {
                                    return `All cycle completed!\ncycle : ${cycle} / ${totalCycles}\n${"It's time for long break!".toUpperCase()}`;
                                }

                                if (status === 'focus') {
                                    return `You can rest for ${Math.floor((restDuration / 60) * 100) / 100} minutes`;
                                }

                                if (status == 'rest') {
                                    return `Let's start focus again for ${Math.floor((focusDuration / 60) * 100) / 100} minutes, cycle : ${cycle}/${totalCycles}`;
                                }
                            })(),
                            notiftype: status,
                        },
                    });
                });
            } else {
                console.log('Notification permission denied.');
            }
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
    const pipRootRef = useRef(null);
    
    const timerState = {
        timeLeft,
        isActive,
        status,
        cycle,
        totalCycles,
    };

    const { pipWindow, pipSize, updatePipSize, isSupported: isPiPSupported } = usePictureInPicture(isActive, timerState, pipEnabled);

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
        setPipEnabled(true);
    };

    const handleOnChangePipEnabled = (ev) => {
        const enabled = ev.target.checked;
        setPipEnabled(enabled);
    };

    // Save pipEnabled to localStorage when changed
    useEffect(() => {
        localStorage.setItem('pip-enabled', JSON.stringify(pipEnabled));
    }, [pipEnabled]);

    const resetAll = () => {
        setStatus('focus');
        setInitialTime(DURATION.focus);
        setCycle(1);
        resetTimer();
    };

    useEffect(() => {
        setInitialTime(focusDuration);
    }, [focusDuration]);

    // Render PiP Window content
    useEffect(() => {
        if (pipWindow && pipWindow.document && !pipWindow.closed) {
            const pipRoot = pipWindow.document.getElementById('pip-root');
            if (pipRoot) {
                // Reset root if window was closed and reopened
                if (pipRootRef.current) {
                    try {
                        pipRootRef.current.render(
                            <PiPWindow
                                timerState={timerState}
                                onStartTimer={startTimer}
                                onResetTimer={resetAll}
                                onClose={() => {
                                    if (pipWindow && !pipWindow.closed) {
                                        pipWindow.close();
                                    }
                                }}
                            />
                        );
                    } catch (e) {
                        // If render fails, create new root
                        pipRootRef.current = ReactDOM.createRoot(pipRoot);
                        pipRootRef.current.render(
                            <PiPWindow
                                timerState={timerState}
                                onStartTimer={startTimer}
                                onResetTimer={resetAll}
                                onClose={() => {
                                    if (pipWindow && !pipWindow.closed) {
                                        pipWindow.close();
                                    }
                                }}
                            />
                        );
                    }
                } else {
                    pipRootRef.current = ReactDOM.createRoot(pipRoot);
                    pipRootRef.current.render(
                        <PiPWindow
                            timerState={timerState}
                            onStartTimer={startTimer}
                            onResetTimer={resetAll}
                            onClose={() => {
                                if (pipWindow && !pipWindow.closed) {
                                    pipWindow.close();
                                }
                            }}
                        />
                    );
                }
            }
        } else if (!pipWindow) {
            // Window closed, reset root ref
            pipRootRef.current = null;
        }

        return () => {
            // Cleanup when component unmounts or window closes
            if (!pipWindow || (pipWindow && pipWindow.closed)) {
                pipRootRef.current = null;
            }
        };
    }, [pipWindow, timerState, startTimer, resetAll]);

    // useEffect(() => {
    //     if ('serviceWorker' in navigator) {
    //         navigator.serviceWorker.addEventListener('message', function (event) {
    //             if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
    //                 let audioFile = '';
    //                 if (status === 'focus') {
    //                     audioFile = '/pomodoro-timer/sound/notif-focus.mp3';
    //                 }
    //                 const audio = new Audio(audioFile);
    //                 audio.play().catch((err) => console.warn(`Failed to play audio:`, err));
    //             }
    //         });
    //     }
    // }, []);

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
                <div className='relative flex justify-center'>
                    <button
                        className='relative z-10 px-10 py-2 mt-8 text-white transition-all duration-150 rounded-md bg-ocean-green disabled:bg-slate-500 w-fit disabled:ring-0 hover:ring-1 ring-white active:scale-90'
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
                        <ResetIcon className='transition-all duration-500 size-6 group-hover:rotate-180 group-disabled:group-hover:rotate-0' />
                    </button>
                </div>
                <p className={`text-slate-500 hover:underline hover:cursor-pointer mt-6 text-center ${isActive ? 'invisible' : 'visible'}`} onClick={() => showModal()}>
                    Custom duration? or settings?
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
                pipSize={pipSize}
                updatePipSize={updatePipSize}
                isPiPSupported={isPiPSupported}
                pipEnabled={pipEnabled}
                handleOnChangePipEnabled={handleOnChangePipEnabled}
            />
        </>
    );
}

export default App;
