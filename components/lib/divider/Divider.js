import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const Divider = (props) => {
    const isHorizontal = props.layout === 'horizontal';
    const isVertical = props.layout === 'vertical';
    const dividerClassName = classNames(`p-divider p-component p-divider-${props.layout} p-divider-${props.type}`, {
        'p-divider-left': isHorizontal && (!props.align || props.align === 'left'),
        'p-divider-right': isHorizontal && props.align === 'right',
        'p-divider-center': (isHorizontal && props.align === 'center') || (isVertical && (!props.align || props.align === 'center')),
        'p-divider-top': isVertical && props.align === 'top',
        'p-divider-bottom': isVertical && props.align === 'bottom',
    }, props.className);

    return (
        <div className={dividerClassName} style={props.style} role="separator">
            <div className="p-divider-content">
                {props.children}
            </div>
        </div>

    );
}

Divider.defaultProps = {
    __TYPE: 'Divider',
    align: null,
    layout: 'horizontal',
    type: 'solid',
    style: null,
    className: null
}

Divider.propTypes = {
    __TYPE: PropTypes.string,
    align: PropTypes.string,
    layout: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
};
