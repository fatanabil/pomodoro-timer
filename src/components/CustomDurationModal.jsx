import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import XIcon from '../assets/icons/XIcon';

const CustomDurationModal = ({
    focusDuration,
    restDuration,
    totalCycles,
    handleOnChangeFocusDuration,
    handleOnChangeRestDuration,
    resetDuration,
    handleOnChangeTotalCycles,
    isShowModal,
    closeModal,
    pipSize,
    updatePipSize,
    isPiPSupported,
    pipEnabled,
    handleOnChangePipEnabled,
}) => {
    const [pipWidth, setPipWidth] = useState(pipSize?.width || 300);
    const [pipHeight, setPipHeight] = useState(pipSize?.height || 200);

    useEffect(() => {
        if (pipSize) {
            setPipWidth(pipSize.width || 300);
            setPipHeight(pipSize.height || 200);
        }
    }, [pipSize]);
    const totalMinutes = Math.floor((focusDuration / 60 + restDuration / 60) * totalCycles * 10) / 10;
    const totalHours = Math.floor((totalMinutes / 60) * 10) / 10;

    const handleOnSubmitForm = (ev) => {
        ev.preventDefault();
        closeModal();
    };

    const handleOnClickReset = (ev) => {
        ev.preventDefault();
        resetDuration();
    };

    return ReactDOM.createPortal(
        <div
            className={`bg-white dark:bg-slate-700 p-6 fixed z-50 left-1/2 top-1/2 rounded-md shadow-lg dark:shadow-md -translate-x-1/2  text-dark-cerulean dark:text-white w-[calc(100%_-_32px)] max-w-lg ${
                isShowModal ? '-translate-y-1/2 opacity-100' : '-translate-y-[calc(50%_-_8px)] opacity-0 pointer-events-none'
            } transition-all duration-300`}
        >
            <header className='flex justify-between w-full mb-6'>
                <h2 className='text-lg font-semibold'>Custom Duration</h2>
                <button className='w-fit h-fit' onClick={closeModal}>
                    <XIcon className='size-6 hover:cursor-pointer' />
                </button>
            </header>
            <form onSubmit={handleOnSubmitForm} className='flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='focus-duration'>Focus Duration</label>
                    <span className='flex w-full gap-3 items-center'>
                        <input
                            type='number'
                            inputMode='number'
                            id='focus-duration'
                            required={true}
                            className='bg-slate-300 dark:bg-slate-600 outline-none dark:text-white py-2 px-3 rounded-md grow'
                            value={focusDuration ? focusDuration / 60 : null}
                            onChange={handleOnChangeFocusDuration}
                        />
                        <p>minutes</p>
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='rest-duration'>Rest Duration</label>
                    <span className='flex w-full gap-3 items-center'>
                        <input
                            type='number'
                            inputMode='number'
                            id='rest-duration'
                            required={true}
                            className='bg-slate-300 dark:bg-slate-600 outline-none dark:text-white py-2 px-3 rounded-md grow'
                            value={restDuration ? restDuration / 60 : null}
                            onChange={handleOnChangeRestDuration}
                        />
                        <p>minutes</p>
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor='total-cycles'>Total Cycles</label>
                    <input
                        type='number'
                        inputMode='number'
                        id='total-cycles'
                        required={true}
                        className='bg-slate-300 dark:bg-slate-600 outline-none dark:text-white py-2 px-3 rounded-md grow'
                        value={totalCycles ? totalCycles : null}
                        onChange={handleOnChangeTotalCycles}
                    />
                    <p className='text-xs text-slate-400'>
                        Total time to completed cycle : {totalMinutes} minutes {`(${totalHours} hours)`}
                    </p>
                </div>
                {isPiPSupported && (
                    <div className='flex flex-col gap-2 pt-2 border-t border-slate-300 dark:border-slate-600'>
                        <div className='flex items-center justify-between mb-2'>
                            <label className='text-sm font-semibold'>Picture-in-Picture</label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    id='pip-enabled'
                                    checked={pipEnabled}
                                    onChange={handleOnChangePipEnabled}
                                    className='w-4 h-4 text-ocean-green bg-slate-300 dark:bg-slate-600 border-slate-300 rounded focus:ring-ocean-green focus:ring-2'
                                />
                                <span className='text-sm'>Enable PiP</span>
                            </label>
                        </div>
                        {pipEnabled && (
                            <div className='flex flex-col gap-3'>
                                <label className='text-sm font-semibold'>Window Size</label>
                                <div className='flex gap-3 items-center'>
                                    <label htmlFor='pip-width' className='text-sm w-20'>Width:</label>
                                    <input
                                        type='number'
                                        inputMode='number'
                                        id='pip-width'
                                        min='200'
                                        max='800'
                                        className='bg-slate-300 dark:bg-slate-600 outline-none dark:text-white py-2 px-3 rounded-md grow'
                                        value={pipWidth}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPipWidth(value);
                                        }}
                                        onBlur={(e) => {
                                            const numValue = parseInt(e.target.value);
                                            const currentHeight = typeof pipHeight === 'number' ? pipHeight : (parseInt(pipHeight) || pipSize?.height || 200);
                                            if (isNaN(numValue) || numValue < 200) {
                                                setPipWidth(200);
                                                updatePipSize(200, currentHeight);
                                            } else if (numValue > 800) {
                                                setPipWidth(800);
                                                updatePipSize(800, currentHeight);
                                            } else {
                                                setPipWidth(numValue);
                                                updatePipSize(numValue, currentHeight);
                                            }
                                        }}
                                    />
                                    <p className='text-sm'>px</p>
                                </div>
                                <div className='flex gap-3 items-center'>
                                    <label htmlFor='pip-height' className='text-sm w-20'>Height:</label>
                                    <input
                                        type='number'
                                        inputMode='number'
                                        id='pip-height'
                                        min='150'
                                        max='600'
                                        className='bg-slate-300 dark:bg-slate-600 outline-none dark:text-white py-2 px-3 rounded-md grow'
                                        value={pipHeight}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPipHeight(value);
                                        }}
                                        onBlur={(e) => {
                                            const numValue = parseInt(e.target.value);
                                            const currentWidth = typeof pipWidth === 'number' ? pipWidth : (parseInt(pipWidth) || pipSize?.width || 300);
                                            if (isNaN(numValue) || numValue < 150) {
                                                setPipHeight(150);
                                                updatePipSize(currentWidth, 150);
                                            } else if (numValue > 600) {
                                                setPipHeight(600);
                                                updatePipSize(currentWidth, 600);
                                            } else {
                                                setPipHeight(numValue);
                                                updatePipSize(currentWidth, numValue);
                                            }
                                        }}
                                    />
                                    <p className='text-sm'>px</p>
                                </div>
                                <p className='text-xs text-slate-400'>
                                    PiP window will automatically open when you switch tabs during an active timer.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                <div className='flex w-full justify-between'>
                    <button
                        className='px-6 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-150 rounded-md active:scale-95'
                        onClick={(ev) => handleOnClickReset(ev)}
                    >
                        Reset
                    </button>
                    <button type='submit' className='bg-ocean-green py-2 rounded-md active:scale-95 transition-all duration-150 self-end px-12 text-white'>
                        Save
                    </button>
                </div>
            </form>
        </div>,
        document.getElementById('modal')
    );
};

export default CustomDurationModal;
