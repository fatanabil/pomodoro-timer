import ResetIcon from '../assets/icons/ResetIcon';

const PiPWindow = ({ timerState, onStartTimer, onResetTimer, onClose }) => {
    const { timeLeft, isActive, status, cycle, totalCycles } = timerState;

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, '0');
        const minutes = Math.floor((seconds / 60) % 60)
            .toString()
            .padStart(2, '0');
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');
        return { hours, minutes, secs };
    };

    const { hours, minutes, secs } = formatTime(timeLeft);

    const bgColor = isActive
        ? status === 'focus'
            ? 'bg-emerald-500'
            : 'bg-amber-500'
        : 'bg-slate-100 dark:bg-slate-800';

    return (
        <div
            className={`w-full min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${bgColor} text-white`}
        >
            <div className="flex gap-2 text-4xl md:text-5xl justify-center mb-4 font-semibold">
                <p>{hours}</p>
                <p>:</p>
                <p>{minutes}</p>
                <p>:</p>
                <p>{secs}</p>
            </div>

            {isActive && (
                <>
                    <p className="text-sm mb-4">
                        Cycle: {cycle}/{totalCycles}
                    </p>
                </>
            )}

            {/* <div className="flex gap-3 items-center">
                {!isActive && (
                    <button
                        className="px-6 py-2 text-sm bg-ocean-green rounded-md hover:ring-1 ring-white transition-all active:scale-90"
                        onClick={onStartTimer}
                    >
                        Start
                    </button>
                )}
                {isActive && (
                    <button
                        className="p-2 bg-rose-500 rounded-md hover:ring-1 ring-white transition-all active:scale-90"
                        onClick={onResetTimer}
                    >
                        <ResetIcon className="size-5" />
                    </button>
                )}
                <button
                    className="px-4 py-2 text-sm bg-slate-600 rounded-md hover:bg-slate-700 transition-all active:scale-90"
                    onClick={onClose}
                >
                    Close
                </button>
            </div> */}
        </div>
    );
};

export default PiPWindow;

