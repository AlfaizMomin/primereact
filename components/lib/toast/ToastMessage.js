import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { useMountEffect } from '../hooks/useMountEffect';
import { Ripple } from '../ripple/Ripple';

const ToastMessageComponent = (props) =>  {
    const severity = props.message.severity;
    const contentClassName = props.message.contentClassName;
    const contentStyle = props.message.contentStyle;
    const style = props.message.style;
    const timer = useRef(null);

    useEffect(() => {
        if (!props.message.sticky) {
            timer.current = setTimeout(() => {
                
            }, props.message.life || 3000);
        }

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        }
    }, []);

    const onClose = () => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        if (props.onClose) {
            props.onClose(props.message);
        }
    }

    const onClick = (event) => {
        if (props.onClick && !(DomHandler.hasClass(event.target, 'p-toast-icon-close') || DomHandler.hasClass(event.target, 'p-toast-icon-close-icon'))) {
            props.onClick(props.message);
        }
    }

    const useCloseIcon = () => {
        if (props.message.closable !== false) {
            return (
                <button type="button" className="p-toast-icon-close p-link" onClick={onClose}>
                    <span className="p-toast-icon-close-icon pi pi-times"></span>
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useMessage = () => {
        if (props.message) {
            const { severity, content, summary, detail } = props.message;
            const contentEl = ObjectUtils.getJSXElement(content, {...props, onClose: onClose});
            const iconClassName = classNames('p-toast-message-icon pi', {
                'pi-info-circle': severity === 'info',
                'pi-exclamation-triangle': severity === 'warn',
                'pi-times': severity === 'error',
                'pi-check': severity === 'success'
            });

            return contentEl || (
                <>
                    <span className={iconClassName}></span>
                    <div className="p-toast-message-text">
                        <span className="p-toast-summary">{summary}</span>
                        {detail && <div className="p-toast-detail">{detail}</div>}
                    </div>
                </>
            )
        }

        return null;
    }

    const className = classNames('p-toast-message', {
        'p-toast-message-info': severity === 'info',
        'p-toast-message-warn': severity === 'warn',
        'p-toast-message-error': severity === 'error',
        'p-toast-message-success': severity === 'success'
    }, props.message.className);

    const message = useMessage();
    const closeIcon = useCloseIcon();

    return (
        <div ref={props.forwardRef} className={className} style={style} role="alert" aria-live="assertive" aria-atomic="true" onClick={onClick}>
            <div className={classNames('p-toast-message-content', contentClassName)} style={contentStyle}>
                {message}
                {closeIcon}
            </div>
        </div>
    );
}

ToastMessageComponent.defaultProps = {
    message: null,
    onClose: null,
    onClick: null
}

ToastMessageComponent.propTypes = {
    message: PropTypes.object,
    onClose: PropTypes.func,
    onClick: PropTypes.func
};

export const ToastMessage = React.forwardRef((props, ref) => <ToastMessageComponent forwardRef={ref} {...props} />);
