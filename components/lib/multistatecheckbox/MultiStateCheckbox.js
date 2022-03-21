import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';
import { tip } from '../tooltip/Tooltip';
import { useMountEffect, useUnmountEffect } from '../hooks/Hooks';

export const MultiStateCheckbox = memo((props) => {
    const [focused, setFocused] = useState(false);
    const elementRef = useRef(null);
    const inputRef = useRef(props.inputRef);
    const tooltipRef = useRef(null);

    const onClick = (event) => {
        if (!props.disabled && !props.readOnly) {
            toggle(event);
            inputRef.current.focus();
        }
    }

    const getOptionValue = (option) => {
        return props.optionValue ? ObjectUtils.resolveFieldData(option, props.optionValue) : option;
    }

    const equalityKey = () => {
        return props.optionValue ? null : props.dataKey;
    }

    const findSelectedOptionMap = () => {
        let option, index;

        if (props.options) {
            const key = equalityKey();
            index = props.options.findIndex(option => ObjectUtils.equals(props.value, getOptionValue(option), key));
            option = props.options[index];
        }

        return { option, index };
    }

    const findNextOption = () => {
        if (props.options) {
            const { index } = findSelectedOptionMap();
            return index === props.options.length - 1 ? (props.empty ? null : props.options[0]) : props.options[index + 1];
        }

        return null;
    }

    const toggle = (event) => {
        if (props.onChange) {
            const newValue = getOptionValue(findNextOption());

            props.onChange({
                originalEvent: event,
                value: newValue,
                stopPropagation: () => { },
                preventDefault: () => { },
                target: {
                    name: props.name,
                    id: props.id,
                    value: newValue
                }
            })
        }
    }

    const onFocus = () => {
        setFocused(true);
    }

    const onBlur = () => {
        setFocused(false);
    }

    useMountEffect(() => {
        if (!props.empty && props.value === null) {
            toggle();
        }
    });

    useEffect(() => {
        ObjectUtils.combinedRefs(inputRef, props.inputRef);
    }, [inputRef]);

    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.update({ content: props.tooltip, ...(props.tooltipOptions || {}) });
        }
        else if (props.tooltip) {
            tooltipRef.current = tip({
                target: elementRef.current,
                content: props.tooltip,
                options: props.tooltipOptions
            });
        }
    }, [props.tooltip, props.tooltipOptions]);

    useUnmountEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.destroy();
            tooltipRef.current = null;
        }
    });

    const useIcon = (option) => {
        const icon = (option && option.icon) || '';
        const className = classNames('p-checkbox-icon p-c', {
            [`${icon}`]: true
        });
        const content = <span className={className}></span>;

        if (props.iconTemplate) {
            const defaultOptions = {
                option,
                className,
                element: content,
                props
            }

            return ObjectUtils.getJSXElement(props.iconTemplate, defaultOptions);
        }

        return content;
    }

    const { option } = findSelectedOptionMap();
    const className = classNames('p-multistatecheckbox p-checkbox p-component', props.className);
    const boxClassName = classNames('p-checkbox-box', {
        'p-highlight': !!option,
        'p-disabled': props.disabled,
        'p-focus': focused
    }, option && option.className);

    const icon = useIcon(option);

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style} onClick={onClick}>
            <div className="p-hidden-accessible">
                <input ref={inputRef} type="checkbox" aria-labelledby={props.ariaLabelledBy} id={props.inputId} name={props.name}
                    onFocus={onFocus} onBlur={onBlur} disabled={props.disabled} readOnly={props.readOnly} defaultChecked={!!option} />
            </div>
            <div className={boxClassName} role="checkbox" aria-checked={!!option} style={option && option.style}>
                {icon}
            </div>
        </div>
    )
})

MultiStateCheckbox.defaultProps = {
    __TYPE: 'MultiStateCheckbox',
    id: null,
    inputRef: null,
    inputId: null,
    value: null,
    options: null,
    optionValue: null,
    iconTemplate: null,
    dataKey: null,
    name: null,
    style: null,
    className: null,
    disabled: false,
    readOnly: false,
    empty: true,
    tooltip: null,
    tooltipOptions: null,
    ariaLabelledBy: null,
    onChange: null
}

MultiStateCheckbox.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    inputRef: PropTypes.any,
    inputId: PropTypes.string,
    value: PropTypes.any,
    options: PropTypes.any,
    optionValue: PropTypes.string,
    iconTemplate: PropTypes.any,
    dataKey: PropTypes.string,
    name: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    empty: PropTypes.bool,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    ariaLabelledBy: PropTypes.string,
    onChange: PropTypes.func
}
