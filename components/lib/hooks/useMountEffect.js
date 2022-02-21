import { useEffect } from 'react';

export const useMountEffect = (listener) => {
    return useEffect(() => listener && listener(), []);
}
