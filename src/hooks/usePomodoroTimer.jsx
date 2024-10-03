import { useEffect, useRef, useState } from 'react';

const usePomodoroTimer = (initialTime = 1500, handleExpired, changeStatus) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const intervalRef = useRef(null);

    const updateTimeLeft = (endTime) => {
        const currentTime = Date.now();
        const timeRemaining = Math.max((endTime - currentTime) / 1000, 0);
        setTimeLeft(timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            setTimeLeft(initialTime);
            changeStatus();
            handleExpired();
        }
    };

    const startTimer = () => {
        setTimeout(() => {
            setStartTime(Date.now());
            setIsActive(true);
        }, 500);
    };

    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    useEffect(() => {
        if (isActive) {
            const endTime = startTime + initialTime * 1000;

            updateTimeLeft(endTime);

            intervalRef.current = setInterval(() => {
                updateTimeLeft(endTime);
            }, 1000);
        } else if (!isActive && intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, startTime, initialTime]);

    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    return { timeLeft, isActive, startTimer, resetTimer };
};

export default usePomodoroTimer;
