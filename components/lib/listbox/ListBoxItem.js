import React, { memo } from 'react';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const ListBoxItem = memo((props) => {

    const onClick = (event) => {
        if (props.onClick) {
            props.onClick({
                originalEvent: event,
                option: props.option
            });
        }

        event.preventDefault();
    }

    const onTouchEnd = (event) => {
        if (props.onTouchEnd) {
            props.onTouchEnd({
                originalEvent: event,
                option: props.option
            });
        }
    }

    const onKeyDown = (event) => {
        const item = event.currentTarget;

        switch (event.which) {
            //down
            case 40:
                const nextItem = findNextItem(item);
                nextItem && nextItem.focus();

                event.preventDefault();
                break;

            //up
            case 38:
                const prevItem = findPrevItem(item);
                prevItem && prevItem.focus();

                event.preventDefault();
                break;

            //enter
            case 13:
                onClick(event);
                event.preventDefault();
                break;

            default:
                break;
        }
    }

    const findNextItem = (item) => {
        let nextItem = item.nextElementSibling;

        if (nextItem)
            return DomHandler.hasClass(nextItem, 'p-disabled') || DomHandler.hasClass(nextItem, 'p-listbox-item-group') ? findNextItem(nextItem) : nextItem;
        else
            return null;
    }

    const findPrevItem = (item) => {
        let prevItem = item.previousElementSibling;

        if (prevItem)
            return DomHandler.hasClass(prevItem, 'p-disabled') || DomHandler.hasClass(prevItem, 'p-listbox-item-group') ? findPrevItem(prevItem) : prevItem;
        else
            return null;
    }

    const className = classNames('p-listbox-item', {
        'p-highlight': props.selected,
        'p-disabled': props.disabled
    }, props.option.className);
    const content = props.template ? ObjectUtils.getJSXElement(props.template, props.option) : props.label;

    return (
        <li className={className} onClick={onClick} onTouchEnd={onTouchEnd} onKeyDown={onKeyDown} tabIndex={props.tabIndex}
            aria-label={props.label} key={props.label} role="option" aria-selected={props.selected}>
            {content}
            <Ripple />
        </li>
    )
})
