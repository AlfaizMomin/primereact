import React from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const NextPageLink = (props) => {
    const className = classNames('p-paginator-next p-paginator-element p-link', { 'p-disabled': props.disabled });
    const iconClassName = 'p-paginator-icon pi pi-angle-right';
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

NextPageLink.defaultProps = {
    disabled: false,
    onClick: null,
    template: null
}

NextPageLink.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    template: PropTypes.any
}
