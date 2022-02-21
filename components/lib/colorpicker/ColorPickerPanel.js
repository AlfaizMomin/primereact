import React, { Component, forwardRef } from 'react';
import { classNames } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Portal } from '../portal/Portal';

export const ColorPickerPanel = forwardRef((props, ref) => {

    const useElement = () => {
        let className = classNames('p-colorpicker-panel', {
            'p-colorpicker-overlay-panel': !props.inline,
            'p-disabled': props.disabled
        });

        return (
            <CSSTransition nodeRef={ref} classNames="p-connected-overlay" in={props.in} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={props.onEnter} onEntered={props.onEntered} onExit={props.onExit} onExited={props.onExited}>
                <div ref={ref} className={className} onClick={props.onClick}>
                    {props.children}
                </div>
            </CSSTransition>
        );
    }

    const element = useElement();

    return props.inline ? element : <Portal element={element} appendTo={props.appendTo} />;
})
