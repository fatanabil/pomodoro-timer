import { useState } from 'react';

const useModal = () => {
    const [isShow, setIsShow] = useState(false);

    const showModal = () => {
        setIsShow(true);
    };

    const closeModal = () => {
        setIsShow(false);
        setTimeout(() => {}, 300);
    };

    return {
        isShow,
        showModal,
        closeModal,
    };
};

export default useModal;
