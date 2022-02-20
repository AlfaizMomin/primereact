import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const Skeleton = memo((props) => {
    const skeletonStyle = () => {
        if (props.size)
            return { width: props.size, height: props.size, borderRadius: props.borderRadius };
        else
            return { width: props.width, height: props.height, borderRadius: props.borderRadius };
    }

    const skeletonClassName = classNames('p-skeleton p-component', {
        'p-skeleton-circle': props.shape === 'circle',
        'p-skeleton-none': props.animation === 'none'
    }, props.className);
    const style = skeletonStyle();

    return (
        <div style={style} className={skeletonClassName}></div>
    );
})

Skeleton.defaultProps = {
    shape: 'rectangle',
    size: null,
    width: '100%',
    height: '1rem',
    borderRadius: null,
    animation: 'wave',
    style: null,
    className: null
}

Skeleton.propTypes = {
    shape: PropTypes.string,
    size: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    borderRadius: PropTypes.string,
    animation: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
};