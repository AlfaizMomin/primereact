import React, { useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

const UIMessageComponent = (props) => {
    const timer = useRef(null);

    useEffect(() => {
        if (!props.message.sticky) {
            timer.current = setTimeout(() => {
                onClose(null);
            }, props.message.life || 3000);
        }

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    const onClose = (event) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        if (props.onClose) {
            props.onClose(props.message);
        }

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    const onClick = () => {
        if (props.onClick) {
            props.onClick(props.message);
        }
    }

    const useCloseIcon = () => {
        if (props.message.closable !== false) {
            return (
                <button type="button" className="p-message-close p-link" onClick={onClose}>
                    <i className="p-message-close-icon pi pi-times"></i>
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useMessage = () => {
        if (props.message) {
            const { severity, content, summary, detail } = props.message;
            const icon = classNames('p-message-icon pi ', {
                'pi-info-circle': severity === 'info',
                'pi-check': severity === 'success',
                'pi-exclamation-triangle': severity === 'warn',
                'pi-times-circle': severity === 'error'
            });

            return content || (
                <>
                    <span className={icon}></span>
                    <span className="p-message-summary">{summary}</span>
                    <span className="p-message-detail">{detail}</span>
                </>
            );
        }

        return null;
    }

    const severity = props.message.severity;
    const className = 'p-message p-component p-message-' + severity;
    const closeIcon = useCloseIcon();
    const message = useMessage();

    return (
        <div ref={props.forwardRef} className={className} onClick={onClick}>
            <div className="p-message-wrapper">
                {message}
                {closeIcon}
            </div>
        </div>
    );
}

UIMessageComponent.defaultProps = {
    message: null,
    onClose: null,
    onClick: null
}

UIMessageComponent.propTypes = {
    message: PropTypes.object,
    onClose: PropTypes.func,
    onClick: PropTypes.func
};

export const UIMessage = forwardRef((props, ref) => <UIMessageComponent forwardRef={ref} {...props} />);
