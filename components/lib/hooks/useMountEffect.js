import { useEffect, useRef } from 'react';

export const useMountEffect = (listener) => {
    return useEffect(listener, []);
}