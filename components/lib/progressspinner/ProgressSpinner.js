import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const ProgressSpinner = (props) => {

    let spinnerClass = classNames('p-progress-spinner', props.className);

    return <div id={props.id} style={props.style} className={spinnerClass} role="alert" aria-busy>
        <svg className="p-progress-spinner-svg" viewBox="25 25 50 50" style={{ animationDuration: props.animationDuration }}>
            <circle className="p-progress-spinner-circle" cx="50" cy="50" r="20" fill={props.fill}
                strokeWidth={props.strokeWidth} strokeMiterlimit="10" />
        </svg>
    </div>;
}

ProgressSpinner.defaultProps = {
    id: null,
    style: null,
    className: null,
    strokeWidth: "2",
    fill: "none",
    animationDuration: "2s"
};

ProgressSpinner.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    strokeWidth: PropTypes.string,
    fill: PropTypes.string,
    animationDuration: PropTypes.string
};
