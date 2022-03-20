import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, IconUtils, ObjectUtils } from '../utils/Utils';
import { tip } from '../tooltip/Tooltip';
import { useUnmountEffect } from '../hooks/Hooks';

export const Checkbox = memo((props) => {
    const [focused, setFocused] = useState(false);
    const elementRef = useRef(null);
    const inputRef = useRef(props.inputRef);
    const tooltipRef = useRef(null);

    const onClick = (event) => {
        if (!props.disabled && !props.readOnly && props.onChange) {
            const checked = isChecked();
            const value = checked ? props.falseValue : props.trueValue;

            props.onChange({
                originalEvent: event,
                value: props.value,
                checked: value,
                stopPropagation: () => { },
                preventDefault: () => { },
                target: {
                    type: 'checkbox',
                    name: props.name,
                    id: props.id,
                    value: props.value,
                    checked: value,
                }
            });

            inputRef.current.checked = !checked;
            inputRef.current.focus();

            event.preventDefault();
        }
    }

    const onFocus = () => {
        setFocused(true);
    }

    const onBlur = () => {
        setFocused(false);
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            onClick(event);
            event.preventDefault();
        }
    }

    const isChecked = () => {
        return props.checked === props.trueValue;
    }

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

    useEffect(() => {
        inputRef.current.checked = isChecked();
    }, [props.checked, props.trueValue]);

    useUnmountEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.destroy();
            tooltipRef.current = null;
        }
    });

    const checked = isChecked();
    const containerClass = classNames('p-checkbox p-component', {
        'p-checkbox-checked': checked,
        'p-checkbox-disabled': props.disabled,
        'p-checkbox-focused': focused
    }, props.className);
    const boxClass = classNames('p-checkbox-box', {
        'p-highlight': checked,
        'p-disabled': props.disabled,
        'p-focus': focused
    });
    const icon = IconUtils.getJSXIcon(checked && props.icon, { className: 'p-checkbox-icon p-c' }, { props, checked });

    return (
        <div ref={elementRef} id={props.id} className={containerClass} style={props.style} onClick={onClick} onContextMenu={props.onContextMenu} onMouseDown={props.onMouseDown}>
            <div className="p-hidden-accessible">
                <input ref={inputRef} type="checkbox" id={props.inputId} name={props.name} tabIndex={props.tabIndex} defaultChecked={checked} aria-labelledby={props.ariaLabelledBy}
                    onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} disabled={props.disabled} readOnly={props.readOnly} required={props.required} />
            </div>
            <div className={boxClass} role="checkbox" aria-checked={checked}>
                {icon}
            </div>
        </div>
    )
});

Checkbox.defaultProps = {
    id: null,
    inputRef: null,
    inputId: null,
    value: null,
    name: null,
    checked: false,
    trueValue: true,
    falseValue: false,
    style: null,
    className: null,
    disabled: false,
    required: false,
    readOnly: false,
    tabIndex: null,
    icon: 'pi pi-check',
    tooltip: null,
    tooltipOptions: null,
    ariaLabelledBy: null,
    onChange: null,
    onMouseDown: null,
    onContextMenu: null
}

Checkbox.propTypes = {
    id: PropTypes.string,
    inputRef: PropTypes.any,
    inputId: PropTypes.string,
    value: PropTypes.any,
    name: PropTypes.string,
    checked: PropTypes.any,
    trueValue: PropTypes.any,
    falseValue: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    tabIndex: PropTypes.number,
    icon: PropTypes.any,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    ariaLabelledBy: PropTypes.string,
    onChange: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func
}
