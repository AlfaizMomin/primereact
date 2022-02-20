import { useEffect, useRef } from 'react';
import { DomHandler } from '../utils/Utils';

export const useEventListener = ({ target = 'document', type, listener, options }) => {
    const targetRef = useRef(null);
    const listenerRef = useRef(null);

    const bind = () => {
        if (!listenerRef.current && targetRef.current) {
            listenerRef.current = event => listener && listener(event);
            targetRef.current.addEventListener(type, listenerRef.current, options);
        }
    }

    const unbind = () => {
        if (listenerRef.current) {
            targetRef.current.removeEventListener(type, listenerRef.current, options);
            listenerRef.current = null;
        }
    }

    useEffect(() => {
        targetRef.current = DomHandler.getTargetElement(target);

        return () => {
            unbind();
        }
    }, [target]);

    return [bind, unbind];
}
