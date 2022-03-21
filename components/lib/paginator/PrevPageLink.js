import React from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const PrevPageLink = (props) => {
    const className = classNames('p-paginator-prev p-paginator-element p-link', { 'p-disabled': props.disabled });
    const iconClassName = 'p-paginator-icon pi pi-angle-left';
    const element = (
        <button type="button" className={className} onClick={props.onClick} disabled={props.disabled}>
            <span className={iconClassName}></span>
            <Ripple />
        </button>
    );

    if (props.template) {
        const defaultOptions = {
            onClick: props.onClick,
            className,
            iconClassName,
            disabled: props.disabled,
            element,
            props: props
        };

        return ObjectUtils.getJSXElement(props.template, defaultOptions);
    }

    return element;
}

PrevPageLink.defaultProps = {
    __TYPE: 'PrevPageLink',
    disabled: false,
    onClick: null,
    template: null
}

PrevPageLink.propTypes = {
    __TYPE: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    template: PropTypes.any
}
