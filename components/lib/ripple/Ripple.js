import React, { useRef } from 'react';
import { DomHandler } from '../utils/Utils';
import PrimeReact from '../api/Api';
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useMountEffect } from "../hooks/useMountEffect";
import { useUnmountEffect } from "../hooks/useUnmountEffect";
import { useEventListener } from '../hooks/useEventListener';

export const Ripple = () => {

    const ink = useRef(null);
    const target = useRef(null);

    const [bindEvents, unbindEvents] = useEventListener({
        type: 'mousedown', listener: () => {
            if (target.current) {
                target.current.addEventListener('mousedown', onMouseDown);
            }
        }
    });

    const getTarget = () => {
        return ink.current && ink.current.parentElement;
    }

    const onMouseDown = (event) => {
        if (!ink.current || getComputedStyle(ink.current, null).display === 'none') {
            return;
        }

        DomHandler.removeClass(ink.current, 'p-ink-active');
        if (!DomHandler.getHeight(ink.current) && !DomHandler.getWidth(ink.current)) {
            let d = Math.max(DomHandler.getOuterWidth(target.current), DomHandler.getOuterHeight(target.current));
            ink.current.style.height = d + 'px';
            ink.current.style.width = d + 'px';
        }

        let offset = DomHandler.getOffset(target.current);
        let x = event.pageX - offset.left + document.body.scrollTop - DomHandler.getWidth(ink.current) / 2;
        let y = event.pageY - offset.top + document.body.scrollLeft - DomHandler.getHeight(ink.current) / 2;

        ink.current.style.top = y + 'px';
        ink.current.style.left = x + 'px';
        DomHandler.addClass(ink.current, 'p-ink-active');
    }

    const onAnimationEnd = (event) => {
        DomHandler.removeClass(event.currentTarget, 'p-ink-active');
    }

    useMountEffect(() => {
        if (ink.current) {
            target.current = getTarget();
            bindEvents();
        }
    })

    useUpdateEffect(() => {
        if (ink.current && !target.current) {
            target.current = getTarget();
            bindEvents();
        }
    })

    useUnmountEffect(() => {
        if (ink.current) {
            target.current = null;
            unbindEvents();
        }
    })

    return PrimeReact.ripple ? (<span ref={ink} className="p-ink" onAnimationEnd={onAnimationEnd}></span>) : null;

}
