import React from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';

export const Message = (props) => {

    const getContent = () => {
        if (props.content) {
            return ObjectUtils.getJSXElement(props.content, props);
        }

        const text = ObjectUtils.getJSXElement(props.text, props);
        const icon = classNames('p-inline-message-icon pi', {
            'pi-info-circle': props.severity === 'info',
            'pi-exclamation-triangle': props.severity === 'warn',
            'pi-times-circle': props.severity === 'error',
            'pi-check': props.severity === 'success',
        });

        return (
            <>
                <span className={icon}></span>
                <span className="p-inline-message-text">{text}</span>
            </>
        );
    }


    const className = classNames('p-inline-message p-component', {
        'p-inline-message-info': props.severity === 'info',
        'p-inline-message-warn': props.severity === 'warn',
        'p-inline-message-error': props.severity === 'error',
        'p-inline-message-success': props.severity === 'success',
        'p-inline-message-icon-only': !props.text
    }, props.className);

    const content = getContent();

    return (
        <div id={props.id} aria-live="polite" className={className} style={props.style} role="alert">
            {content}
        </div>
    );
}

Message.defaultProps = {
    id: null,
    className: null,
    style: null,
    text: null,
    severity: 'info',
    content: null
}

Message.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    text: PropTypes.any,
    severity: PropTypes.string,
    content: PropTypes.any
};
