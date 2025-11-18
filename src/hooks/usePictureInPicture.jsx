import { useEffect, useRef, useState, useCallback } from 'react';

const DEFAULT_PIP_SIZE = { width: 300, height: 200 };

const usePictureInPicture = (isActive, timerState, pipEnabled = true) => {
    const [pipWindow, setPipWindow] = useState(null);
    const [pipSize, setPipSize] = useState(() => {
        const saved = localStorage.getItem('pip-size');
        return saved ? JSON.parse(saved) : DEFAULT_PIP_SIZE;
    });
    const channelRef = useRef(null);
    const isOpeningRef = useRef(false);
    const pipWindowRef = useRef(null);
    const hasUserActivationRef = useRef(true);
    const lastActivationTimeRef = useRef(Date.now());
    const isActiveRef = useRef(isActive);

    useEffect(() => {
        const saved = localStorage.getItem('pip-size');
        if (saved) {
            setPipSize(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pip-size', JSON.stringify(pipSize));
    }, [pipSize]);

    useEffect(() => {
        if (!channelRef.current) {
            try {
                channelRef.current = new BroadcastChannel('pomodoro-pip-channel');
            } catch (error) {
                console.warn('Failed to create BroadcastChannel:', error);
                return;
            }
        }

        const channel = channelRef.current;
        
        const handleMessage = (event) => {
            try {
                if (event.data.type === 'PIP_CLOSE') {
                    setPipWindow(null);
                } else if (event.data.type === 'PIP_SIZE_CHANGE') {
                    setPipSize(event.data.size);
                }
            } catch (error) {
                console.warn('Error handling BroadcastChannel message:', error);
            }
        };

        channel.onmessage = handleMessage;

        return () => {     
        };
    }, []);

    const openPiP = useCallback(async () => {
        const currentWindow = pipWindowRef.current;
        const canOpen = !currentWindow || (currentWindow && currentWindow.closed);
        
        if (!canOpen || isOpeningRef.current) {
            console.log('PiP already open or opening', { pipWindow: !!currentWindow, closed: currentWindow?.closed, isOpening: isOpeningRef.current });
            return;
        }

        const timeSinceActivation = Date.now() - lastActivationTimeRef.current;
        const hasRecentActivation = hasUserActivationRef.current && timeSinceActivation < 5000;
        
        if (!hasRecentActivation) {
            console.log('PiP requires user activation - skipping automatic open');
            return;
        }

        if (!window.documentPictureInPicture) {
            console.warn('Document Picture-in-Picture API is not supported in this browser');
            alert('Picture-in-Picture tidak didukung di browser ini. Gunakan Chrome/Edge versi terbaru.');
            return;
        }

        const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (!isSecureContext) {
            console.warn('PiP requires HTTPS or localhost');
            alert('Picture-in-Picture memerlukan HTTPS atau localhost. Jalankan dengan npm run dev (localhost) atau deploy ke HTTPS.');
            return;
        }

        try {
            isOpeningRef.current = true;
            console.log('Opening PiP window...', { width: pipSize.width, height: pipSize.height });

            const pipWindow = await window.documentPictureInPicture.requestWindow({
                width: pipSize.width,
                height: pipSize.height,
            });

            console.log('PiP window opened successfully');

            try {
                [...document.styleSheets].forEach((styleSheet) => {
                    try {
                        const cssRules = [...styleSheet.cssRules]
                            .map((rule) => rule.cssText)
                            .join('');
                        const style = pipWindow.document.createElement('style');
                        style.textContent = cssRules;
                        pipWindow.document.head.appendChild(style);
                    } catch (e) {
                    }
                });
            } catch (e) {
                console.warn('Could not copy all stylesheets:', e);
            }

            const baseStyle = pipWindow.document.createElement('style');
            baseStyle.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { width: 100%; height: 100%; overflow: hidden; }
                #pip-root { width: 100%; height: 100%; }
            `;
            pipWindow.document.head.appendChild(baseStyle);

            pipWindow.document.body.innerHTML = '<div id="pip-root"></div>';
            pipWindow.document.title = 'Pomodoro Timer';

            const handlePageHide = () => {
                setPipWindow(null);
                pipWindowRef.current = null;
                isOpeningRef.current = false;
            };

            pipWindow.addEventListener('pagehide', handlePageHide);
            
            if (pipWindow.closed) {
                setPipWindow(null);
                pipWindowRef.current = null;
                isOpeningRef.current = false;
                return;
            }

            setPipWindow(pipWindow);
            pipWindowRef.current = pipWindow;
            isOpeningRef.current = false;

        } catch (error) {
            console.error('Failed to open PiP window:', error);
            isOpeningRef.current = false;
            
            if (error.message && error.message.includes('user activation')) {
                console.log('PiP requires user activation - marking as no activation');
                hasUserActivationRef.current = false;
                return;
            }
            
            if (error.message && !error.message.includes('user activation')) {
                console.warn('Unexpected PiP error:', error.message);
            }
        }
    }, [pipWindow, pipSize]);

    const closePiP = useCallback(() => {
        if (pipWindowRef.current) {
            if (!pipWindowRef.current.closed) {
                pipWindowRef.current.close();
            }
            setPipWindow(null);
            pipWindowRef.current = null;
            isOpeningRef.current = false;
        } else if (pipWindow) {
            if (!pipWindow.closed) {
                pipWindow.close();
            }
            setPipWindow(null);
            pipWindowRef.current = null;
            isOpeningRef.current = false;
        }
    }, [pipWindow]);

    useEffect(() => {
        const handleUserActivation = () => {
            hasUserActivationRef.current = true;
            lastActivationTimeRef.current = Date.now();
        };

        const events = ['click', 'keydown', 'mousedown', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, handleUserActivation, { once: false, passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivation);
            });
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            hasUserActivationRef.current = true;
            lastActivationTimeRef.current = Date.now();
        }
    }, [isActive]);

    useEffect(() => {
        if (!pipEnabled) {
            if (pipWindow) {
                closePiP();
            }
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const windowActuallyClosed = !pipWindowRef.current || (pipWindowRef.current && pipWindowRef.current.closed);
                if (isActive && windowActuallyClosed && !isOpeningRef.current) {
                    const timeSinceActivation = Date.now() - lastActivationTimeRef.current;
                    if (hasUserActivationRef.current && timeSinceActivation < 5000) {
                        openPiP();
                    } else {
                        console.log('Skipping PiP open - no recent user activation');
                    }
                }
            } else {
                if (pipWindowRef.current || pipWindow) {
                    closePiP();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, pipWindow, openPiP, closePiP, pipEnabled]);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        if ((!isActive || !pipEnabled) && pipWindow) {
            const timeoutId = setTimeout(() => {

                if (!isActiveRef.current && pipWindowRef.current) {
                    closePiP();
                }
            }, 600); 

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [isActive, pipWindow, pipEnabled, closePiP]);
    
    const updatePipSize = (width, height) => {
        const newSize = { width: Math.max(200, width), height: Math.max(150, height) };
        setPipSize(newSize);
        
        if (pipWindow && !pipWindow.closed) {
            pipWindow.resizeTo(newSize.width, newSize.height);
        }

        if (channelRef.current) {
            try {
                channelRef.current.postMessage({
                    type: 'PIP_SIZE_CHANGE',
                    size: newSize,
                });
            } catch (error) {
                console.warn('Failed to send size change message via BroadcastChannel:', error);
            }
        }
    };

    return {
        pipWindow,
        pipSize,
        openPiP,
        closePiP,
        updatePipSize,
        isSupported: !!window.documentPictureInPicture,
    };
};

export default usePictureInPicture;

