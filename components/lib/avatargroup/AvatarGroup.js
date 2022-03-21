import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const AvatarGroup = (props) => {
    const containerClassName = classNames('p-avatar-group p-component', props.className);

    return (
        <div className={containerClassName} style={props.style}>
            {props.children}
        </div>
    );
}

AvatarGroup.defaultProps = {
    __TYPE: 'AvatarGroup',
    style: null,
    className: null
}

AvatarGroup.propTypes = {
    __TYPE: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
}
