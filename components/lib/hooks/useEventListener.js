import { useEffect, useRef } from 'react';
import { DomHandler, ObjectUtils } from '../utils/Utils';

export const useEventListener = (type, listener, target) => {
    const listenerRef = useRef(null);
    const targetRef = useRef(null);

    const bind = () => {
        if (!listenerRef.current && targetRef.current) {
            listenerRef.current = event => listener && listener(event);
            targetRef.current.addEventListener(type, listenerRef.current);
        }
    }

    const unbind = () => {
        if (listenerRef.current) {
            targetRef.current.removeEventListener(type, listenerRef.current);
            listenerRef.current = null;
        }
    }

    useEffect(() => {
        const targetEl = document;
        if (target) {
            const el = ObjectUtils.getPropValue(target);
            targetEl = DomHandler.isExist(el) ? el : targetEl;
        }

        targetRef.current = targetEl;

        return () => {
            unbind();
        }
    }, []);

    return [bind, unbind];
}
