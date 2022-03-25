/* eslint-disable */
import { useEffect, useRef } from 'react';
import { DomHandler } from '../utils/Utils';
import { useEventListener } from './useEventListener';
import { useResizeListener } from './useResizeListener';
import { useOverlayScrollListener } from './useOverlayScrollListener';
import { useUnmountEffect } from './useUnmountEffect';

export const useOverlayListener = ({ target, overlay, listener, when = true }) => {
    const targetRef = useRef(null);
    const overlayRef = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({ type: 'click', listener: event => {
        // right click
        (event.which !== 3) && isOutsideClicked(event) && listener && listener(event, 'outside');
    }});
    const [bindWindowResizeListener, unbindWindowResizeListener] = useResizeListener({ listener: event => {
        !DomHandler.isTouchDevice() && listener && listener(event, 'resize');
    }});
    const [bindOverlayScrollListener, unbindOverlayScrollListener] = useOverlayScrollListener({ target: targetRef, listener: event => {
        listener && listener(event, 'scroll');
    }});

    const isOutsideClicked = (event) => {
        return targetRef.current && !(targetRef.current.isSameNode(event.target) || targetRef.current.contains(event.target)
            || (overlayRef.current && overlayRef.current.contains(event.target)));
    }

    const bind = () => {
        bindDocumentClickListener();
        bindWindowResizeListener();
        bindOverlayScrollListener();
    }

    const unbind = () => {
        unbindDocumentClickListener();
        unbindWindowResizeListener();
        unbindOverlayScrollListener();
    }

    useEffect(() => {
        if (when) {
            targetRef.current = DomHandler.getTargetElement(target);
            overlayRef.current = DomHandler.getTargetElement(overlay);
        }
        else {
            unbind();
            targetRef.current = overlayRef.current = null;
        }
    }, [target, overlay, when]);

    useEffect(() => {
        unbind();
        when && bind();
    }, [when]);

    useUnmountEffect(() => {
        unbind();
    });

    return [bind, unbind];
}
/* eslint-enable */
