import React, { forwardRef } from 'react';
import { classNames } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Portal } from '../portal/Portal';

export const TreeSelectPanel = forwardRef((props, ref) => {

    const useElement = () => {
        const className = classNames('p-treeselect-panel p-component', props.panelClassName);

        return (
            <CSSTransition nodeRef={ref} classNames="p-connected-overlay" in={props.in} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={props.onEnter} onEntering={props.onEntering} onEntered={props.onEntered} onExit={props.onExit} onExited={props.onExited}>
                <div ref={ref} className={className} style={props.panelStyle} onClick={props.onClick}>
                    {props.header}
                    <div className="p-treeselect-items-wrapper" style={{ maxHeight: props.scrollHeight || 'auto' }}>
                        {props.children}
                    </div>
                    {props.footer}
                </div>
            </CSSTransition>
        );
    }

    const element = useElement();

    return <Portal element={element} appendTo={props.appendTo} />
})
