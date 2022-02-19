import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, ObjectUtils } from '../utils/Utils';
import { tip } from '../tooltip/Tooltip';

export const Chips = memo((props) => {
    const [focused, setFocused] = useState(false);
    const elementRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(props.inputRef);
    const tooltipRef = useRef(null);

    const removeItem = (event, index) => {
        if (props.disabled && props.readOnly) {
            return;
        }

        let values = [...props.value];
        const removedItem = values.splice(index, 1);

        if (!isRemovable(removedItem, index)) {
            return;
        }

        if (props.onRemove) {
            props.onRemove({
                originalEvent: event,
                value: removedItem
            });
        }

        if (props.onChange) {
            props.onChange({
                originalEvent: event,
                value: values,
                stopPropagation : () =>{},
                preventDefault : () =>{},
                target: {
                    name: props.name,
                    id: props.id,
                    value : values
                }
            });
        }
    }

    const addItem = (event, item, preventDefault) => {
        if (item && item.trim().length) {
            let values = props.value ? [...props.value] : [];

            if (props.allowDuplicate || values.indexOf(item) === -1) {
                values.push(item);

                if (props.onAdd) {
                    props.onAdd({
                        originalEvent: event,
                        value: item
                    });
                }
            }
            updateInput(event, values, preventDefault)
        }

    }

    const onWrapperClick = () => {
        inputRef.current.focus();
    }

    const onKeyDown = (event) => {
        const inputValue = event.target.value;
        const values = props.value || [];

        switch(event.which) {
            //backspace
            case 8:
                if (inputRef.current.value.length === 0 && values.length > 0) {
                    removeItem(event, values.length - 1);
                }
            break;

            //enter
            case 13:
                if (inputValue && inputValue.trim().length && (!props.max || props.max > values.length)) {
                    addItem(event, inputValue, true);
                }
            break;

            default:
                if (isMaxedOut()) {
                    event.preventDefault();
                }
                else if (props.separator) {
                    if (props.separator === ',' && event.which === 188) {
                        addItem(event, inputValue, true);
                    }
                }
            break;
        }
    }

    const updateInput = (event, items, preventDefault) => {
        if (props.onChange) {
            props.onChange({
                originalEvent: event,
                value: items,
                stopPropagation : () =>{},
                preventDefault : () =>{},
                target: {
                    name: props.name,
                    id: props.id,
                    value : items
                }
            });
        }

        inputRef.current.value = '';

        if (preventDefault) {
            event.preventDefault();
        }
    }

    const onPaste = (event) => {
        if (props.separator) {
            let pastedData = (event.clipboardData || window['clipboardData']).getData('Text');

            if (pastedData) {
                let values = props.value || [];
                let pastedValues = pastedData.split(props.separator);
                pastedValues = pastedValues.filter(val => ((props.allowDuplicate || values.indexOf(val) === -1) && val.trim().length));
                values = [...values, ...pastedValues];

                updateInput(event, values, true);
            }

        }
    }

    const onFocus = (event) => {
        setFocused(true);

        if (props.onFocus) {
            props.onFocus(event);
        }
    }

    const onBlur = (event) => {
        setFocused(false);

        if (props.onBlur) {
            props.onBlur(event);
        }
    }

    const isMaxedOut = () => {
        return props.max && props.value && props.max === props.value.length;
    }

    const isFilled = useMemo(() => {
        return (props.value && props.value.length) || (inputRef.current && inputRef.current.value && inputRef.current.value.length);
    });

    const isRemovable = (value, index) => {
        return ObjectUtils.getPropValue(props.removable, { value, index, props });
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
                target: inputRef.current,
                targetContainer: listRef.current,
                content: props.tooltip,
                options: props.tooltipOptions
            });
        }

        return () => {
            if (tooltipRef.current) {
                tooltipRef.current.destroy();
                tooltipRef.current = null;
            }
        }
    }, [props.tooltip, props.tooltipOptions]);

    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.deactivate();
            tooltipRef.current.activate();
        }
    }, [props.value]);

    const useRemoveIcon = (value, index) => {
        if (!props.disabled && !props.readOnly && isRemovable(value, index)) {
            return (
                <span className="p-chips-token-icon pi pi-times-circle" onClick={(event) => removeItem(event, index)}></span>
            )
        }

        return null;
    }

    const useItem = (value, index) => {
        const content = props.itemTemplate ? props.itemTemplate(value) : value;
        const icon = useRemoveIcon(value, index);

        return (
            <li key={index} className="p-chips-token p-highlight">
                <span className="p-chips-token-label">{content}</span>
                {icon}
            </li>
        );
    }

    const useInput = () => {
        return (
            <li className="p-chips-input-token">
                <input ref={inputRef} placeholder={props.placeholder} type="text" name={props.name} disabled={props.disabled||isMaxedOut()}
                            onKeyDown={onKeyDown} onPaste={onPaste} onFocus={onFocus} onBlur={onBlur} aria-labelledby={props.ariaLabelledBy}
                            readOnly={props.readOnly} />
            </li>
        );
    }

    const useItems = () => {
        if (props.value) {
            return props.value.map((value, index) => {
                return useItem(value, index);
            });
        }

        return null;
    }

    const useList = () => {
        const className = classNames('p-inputtext p-chips-multiple-container', {
            'p-disabled': props.disabled,
            'p-focus': focused
        });
        const items = useItems();
        const input = useInput();

        return (
            <ul ref={listRef} className={className} onClick={onWrapperClick}>
                {items}
                {input}
            </ul>
        );
    }

    const className = classNames('p-chips p-component p-inputwrapper', props.className, {
        'p-inputwrapper-filled': isFilled,
        'p-inputwrapper-focus': focused
    });
    const list = useList();

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style}>
            {list}
        </div>
    )
});

Chips.defaultProps = {
    id: null,
    inputRef: null,
    name: null,
    placeholder: null,
    value: null,
    max: null,
    disabled: null,
    readOnly: false,
    removable: true,
    style: null,
    className: null,
    tooltip: null,
    tooltipOptions: null,
    ariaLabelledBy: null,
    separator: null,
    allowDuplicate: true,
    itemTemplate: null,
    onAdd: null,
    onRemove: null,
    onChange: null,
    onFocus: null,
    onBlur: null
}

Chips.propTypes = {
    id: PropTypes.string,
    inputRef: PropTypes.any,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.array,
    max: PropTypes.number,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    removable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    style: PropTypes.object,
    className: PropTypes.string,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    ariaLabelledBy: PropTypes.string,
    separator: PropTypes.string,
    allowDuplicate: PropTypes.bool,
    itemTemplate: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
}
