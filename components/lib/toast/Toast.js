import React, { useState, useRef, forwardRef, useImperativeHandle, createRef, memo } from 'react';
import PropTypes from 'prop-types';
import { classNames, ZIndexUtils } from '../utils/Utils';
import { ToastMessage } from './ToastMessage';
import { TransitionGroup } from 'react-transition-group';
import { CSSTransition } from '../csstransition/CSSTransition';
import PrimeReact from '../api/Api';
import { Portal } from '../portal/Portal';
import { useUnmountEffect } from '../hooks/Hooks';

let messageIdx = 0;

export const Toast = memo(forwardRef((props, ref) => {
    const [messages, setMessages] = useState([]);
    const containerRef = useRef(null);

    const show = (value) => {
        if (value) {
            let _messages;

            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i].id = messageIdx++;
                    _messages = [...messages, ...value];
                }
            }
            else {
                value.id = messageIdx++;
                _messages = messages ? [...messages, value] : [value];
            }

            messages.length === 0 && ZIndexUtils.set('toast', containerRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['toast']);

            setMessages(_messages);
        }
    }

    const clear = () => {
        ZIndexUtils.clear(containerRef.current);
        setMessages([]);
    }

    const onClose = (message) => {
        let _messages = messages.filter(msg => msg.id !== message.id);
        setMessages(_messages);

        props.onRemove && props.onRemove(message);
    }

    const onEntered = () => {
        props.onShow && props.onShow();
    }

    const onExited = () => {
        messages.length === 0 && ZIndexUtils.clear(containerRef.current);

        props.onHide && props.onHide();
    }

    useUnmountEffect(() => {
        ZIndexUtils.clear(containerRef.current);
    });

    useImperativeHandle(ref, () => ({
        show,
        clear
    }));

    const useElement = () => {
        const className = classNames('p-toast p-component p-toast-' + props.position, props.className);

        return (
            <div ref={containerRef} id={props.id} className={className} style={props.style}>
                <TransitionGroup>
                    {
                        messages.map((message) => {
                            const messageRef = createRef();

                            return (
                                <CSSTransition nodeRef={messageRef} key={message.id} classNames="p-toast-message" unmountOnExit timeout={{ enter: 300, exit: 300 }} onEntered={onEntered} onExited={onExited} options={props.transitionOptions}>
                                    <ToastMessage ref={messageRef} message={message} onClick={props.onClick} onClose={onClose} />
                                </CSSTransition>
                            )
                        })
                    }
                </TransitionGroup>
            </div>
        );
    }

    const element = useElement();

    return (
        <Portal element={element} appendTo={props.appendTo} />
    )
}))

Toast.defaultProps = {
    __TYPE: 'Toast',
    id: null,
    className: null,
    style: null,
    baseZIndex: 0,
    position: 'top-right',
    transitionOptions: null,
    appendTo: 'self',
    onClick: null,
    onRemove: null,
    onShow: null,
    onHide: null
}

Toast.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    baseZIndex: PropTypes.number,
    position: PropTypes.string,
    transitionOptions: PropTypes.object,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onClick: PropTypes.func,
    onRemove: PropTypes.func,
    onShow: PropTypes.func,
    onHide: PropTypes.func
}
