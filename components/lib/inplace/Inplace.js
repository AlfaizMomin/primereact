import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';
import { Button } from '../button/Button';

export const InplaceDisplay = props => props.children;
export const InplaceContent = props => props.children;

export const Inplace = (props) => {

    const [active, setActive] = useState(false);

    const open = (event) => {
        if (props.disabled) {
            return;
        }

        if (props.onOpen) {
            props.onOpen(event);
        }
        if (props.onToggle) {
            props.onToggle({
                originalEvent: event,
                value: true
            });
        }
        else {
            setActive(true);
        }
    }

    const close = (event) => {
        if (props.onClose) {
            props.onClose(event);
        }

        if (props.onToggle) {
            props.onToggle({
                originalEvent: event,
                value: false
            });
        }
        else {
            setActive(false);
        }
    }

    const onDisplayKeyDown = (event) => {
        if (event.key === 'Enter') {
            open(event);
            event.preventDefault();
        }
    }

    const isActive = () => {
        return props.onToggle ? props.active : active;
    }

    const useDisplay = (content) => {
        const className = classNames('p-inplace-display', { 'p-disabled': props.disabled });

        return (
            <div className={className} onClick={open} onKeyDown={onDisplayKeyDown} tabIndex={props.tabIndex} aria-label={props.ariaLabel}>
                {content}
            </div>
        );
    }

    const useCloseButton = () => {
        if (props.closable) {
            return (
                <Button type="button" className="p-inplace-content-close" icon="pi pi-times" onClick={close} />
            )
        }

        return null;
    }

    const useContent = (content) => {
        const closeButton = useCloseButton();

        return (
            <div className="p-inplace-content">
                {content}
                {closeButton}
            </div>
        );
    }

    const useChildren = () => {
        const active = isActive();

        return (
            React.Children.map(props.children, (child, i) => {
                if (active && child.type === InplaceContent) {
                    return useContent(child);
                }
                else if (!active && child.type === InplaceDisplay) {
                    return useDisplay(child);
                }
            })
        );
    }

    const className = classNames('p-inplace p-component', { 'p-inplace-closable': props.closable }, props.className);

    return (
        <div className={className}>
            {useChildren()}
        </div>
    );

}

Inplace.defaultProps = {
    style: null,
    className: null,
    active: false,
    closable: false,
    disabled: false,
    tabIndex: 0,
    ariaLabel: null,
    onOpen: null,
    onClose: null,
    onToggle: null
};

Inplace.propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    active: PropTypes.bool,
    closable: PropTypes.bool,
    disabled: PropTypes.bool,
    tabIndex: PropTypes.number,
    ariaLabel: PropTypes.string,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onToggle: PropTypes.func,
};
