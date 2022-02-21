import { useEffect, useRef } from 'react';

export const useUpdateEffect = (listener, dependencies) => {
    const mounted = useRef(false);
    return useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        
        return listener();
    }, dependencies);
}