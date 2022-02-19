import { useEffect, useRef } from 'react';
import { DomHandler, ObjectUtils } from '../utils/Utils';

export const useEventListener = (type, listener, target) => {
    const ref = useRef(null);
    const node = useRef(null);

    const bind = () => {
        if (!ref.current) {
            ref.current = event => listener && listener(event);
            node.current.addEventListener(type, ref.current);
        }
    }

    const unbind = () => {
        if (ref.current) {
            node.current.removeEventListener(type, ref.current);
            ref.current = null;
        }
    }

    useEffect(() => {
        const targetEl = document;
        if (target) {
            const el = ObjectUtils.getPropValue(target);
            targetEl = DomHandler.isExist(el) ? el : targetEl;
        }

        node.current = targetEl;

        return () => {
            unbind();
        }
    }, []);

    return [bind, unbind];
}
