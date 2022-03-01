import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const ProgressBar = (props) => {

    const useLabel = () => {
        if (props.showValue && props.value != null) {
            let label = props.displayValueTemplate ? props.displayValueTemplate(props.value) : props.value + props.unit;
            return (
                <div className="p-progressbar-label">{label}</div>
            );
        }

        return null;
    }

    const useDeterminate = () => {
        let className = classNames('p-progressbar p-component p-progressbar-determinate', props.className);
        let label = useLabel();

        return (
            <div role="progressbar" id={props.id} className={className} style={props.style} aria-valuemin="0" aria-valuenow={props.value} aria-valuemax="100" aria-label={props.value}>
                <div className="p-progressbar-value p-progressbar-value-animate" style={{ width: props.value + '%', display: 'block', backgroundColor: props.color }}></div>
                {label}
            </div>
        );
    }

    const useIndeterminate = () => {
        let className = classNames('p-progressbar p-component p-progressbar-indeterminate', props.className);

        return (
            <div role="progressbar" id={props.id} className={className} style={props.style}>
                <div className="p-progressbar-indeterminate-container">
                    <div className="p-progressbar-value p-progressbar-value-animate" style={{ backgroundColor: props.color }}></div>
                </div>
            </div>
        )
    }

    if (props.mode === 'determinate')
        return useDeterminate();
    else if (props.mode === 'indeterminate')
        return useIndeterminate();
    else
        throw new Error(props.mode + " is not a valid mode for the ProgressBar. Valid values are 'determinate' and 'indeterminate'");


}

ProgressBar.defaultProps = {
    id: null,
    value: null,
    showValue: true,
    unit: '%',
    style: null,
    className: null,
    mode: 'determinate',
    displayValueTemplate: null,
    color: null
}

ProgressBar.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showValue: PropTypes.bool,
    unit: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    mode: PropTypes.string,
    displayValueTemplate: PropTypes.func,
    color: PropTypes.string
};
