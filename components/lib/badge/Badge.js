import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const Badge = memo((props) => {
    const badgeClassName = classNames('p-badge p-component', {
        'p-badge-no-gutter': props.value && String(props.value).length === 1,
        'p-badge-dot': !props.value,
        'p-badge-lg': props.size === 'large',
        'p-badge-xl': props.size === 'xlarge',
        [`p-badge-${props.severity}`]: props.severity !== null
    }, props.className);

    return (
        <span className={badgeClassName} style={props.style}>
            {props.value}
        </span>
    )
});

Badge.defaultProps = {
    __TYPE: 'Badge',
    value: null,
    severity: null,
    size: null,
    style: null,
    className: null
}

Badge.propTypes = {
    __TYPE: PropTypes.string,
    value: PropTypes.any,
    severity: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
}
