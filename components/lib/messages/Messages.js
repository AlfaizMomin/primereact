import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { UIMessage } from './UIMessage';
import { TransitionGroup } from 'react-transition-group';
import { CSSTransition } from '../csstransition/CSSTransition';

let messageIdx = 0;

export const Messages = forwardRef((props, ref) => {
    const [messages,setMessages] = useState([]);

    const show = (value) => {
        if (value) {
            let _messages = [];
    
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
    
            setMessages(_messages);
        }
    }
    
    const clear = () => {
        setMessages([]);
    }
    
    const replace = (value) => {
        setMessages(value);
    }
    
    const onClose = (message) => {
        let _messages = messages.filter(msg => msg.id !== message.id);
        setMessages(_messages);
    
        if (props.onRemove) {
            props.onRemove(message);
        }
    }

    useImperativeHandle(ref, () => ({
        show,
        replace,
        clear
    }));

    return (
        <div id={props.id} className={props.className} style={props.style}>
            <TransitionGroup>
                {
                    messages.map((message) => {
                        const messageRef = React.createRef();

                        return (
                            <CSSTransition nodeRef={messageRef} key={message.id} classNames="p-message" unmountOnExit timeout={{ enter: 300, exit: 300 }} options={props.transitionOptions}>
                                <UIMessage ref={messageRef} message={message} onClick={props.onClick} onClose={onClose} />
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        </div>
    );
});

Messages.defaultProps = {
    id: null,
    className: null,
    style: null,
    transitionOptions: null,
    onRemove: null,
    onClick: null
}

Messages.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    transitionOptions: PropTypes.object,
    onRemove: PropTypes.func,
    onClick: PropTypes.func
};