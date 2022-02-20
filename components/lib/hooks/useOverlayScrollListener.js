import { useEffect, useRef } from 'react';
import { DomHandler } from '../utils/Utils';
import { usePrevious } from './usePrevious';

export const useOverlayScrollListener = ({ target, listener, options }) => {
    const targetRef = useRef(null);
    const listenerRef = useRef(null);
    const scrollableParents = useRef([]);
    const prevOptions = usePrevious(options);

    const bind = () => {
        if (!listenerRef.current && targetRef.current) {
            const nodes = scrollableParents.current = DomHandler.getScrollableParents(targetRef.current);

            listenerRef.current = event => listener && listener(event);
            nodes.forEach((node) => node.addEventListener('scroll', listenerRef.current, options));
        }
    }

    const unbind = () => {
        if (listenerRef.current) {
            const nodes = scrollableParents.current;
            nodes.forEach((node) => node.removeEventListener('scroll', listenerRef.current, options));

            listenerRef.current = null;
        }
    }

    useEffect(() => {
        targetRef.current = DomHandler.getTargetElement(target);

        return () => {
            unbind();
        }
    }, [target]);

    useEffect(() => {
        if (listenerRef.current && (listenerRef.current !== listener || prevOptions !== options)) {
            unbind();
            bind();
        }
    }, [listener, options]);

    return [bind, unbind];
}
