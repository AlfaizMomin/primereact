import React, { memo, useState } from 'react';
import { classNames } from '../utils/Utils';

export const RowCheckbox = memo((props) => {
    const [focused, setFocused] = useState(false);

    const onFocus = () => {
        setFocused(true);
    }

    const onBlur = () => {
        setFocused(false);
    }

    const onClick = (event) => {
        if (!props.disabled) {
            setFocused(true);

            props.onChange(event);
        }
    }

    const onKeyDown = (event) => {
        if (event.code === 'Space') {
            onClick(event);
            event.preventDefault();
        }
    }

    const className = classNames('p-checkbox p-component', { 'p-checkbox-focused': focused })
    const boxClassName = classNames('p-checkbox-box p-component', { 'p-highlight': props.checked, 'p-disabled': props.disabled, 'p-focus': focused });
    const iconClassName = classNames('p-checkbox-icon', { 'pi pi-check': props.checked });
    const tabIndex = props.disabled ? null : '0';

    return (
        <div className={className} onClick={onClick}>
            <div className={boxClassName} role="checkbox" aria-checked={props.checked} tabIndex={tabIndex}
                onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur}>
                <span className={iconClassName}></span>
            </div>
        </div>
    )
})
