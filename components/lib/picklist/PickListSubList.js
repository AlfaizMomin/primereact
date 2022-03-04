import React, {forwardRef, useRef, useImperativeHandle} from 'react';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { PickListItem } from './PickListItem';

export const PickListSubList = forwardRef((props,ref) => {

    const listElementRef = useRef(null);

    const onItemClick = (event) => {
        let originalEvent = event.originalEvent;
        let item = event.value;
        let selection = [...props.selection];
        let index = ObjectUtils.findIndexInList(item, selection, props.dataKey);
        let selected = (index !== -1);
        let metaSelection = props.metaKeySelection;

        if(metaSelection) {
            let metaKey = (originalEvent.metaKey||originalEvent.ctrlKey);

            if(selected && metaKey) {
                selection.splice(index, 1);
            }
            else {
                if(!metaKey) {
                    selection.length = 0;
                }
                selection.push(item);
            }
        }
        else {
            if(selected)
                selection.splice(index, 1);
            else
                selection.push(item);
        }

        if(props.onSelectionChange) {
            props.onSelectionChange({
                event: originalEvent,
                value: selection
            })
        }
    }

    const onItemKeyDown = (event) => {
        let listItem = event.originalEvent.currentTarget;

        switch(event.originalEvent.which) {
            //down
            case 40:
                let nextItem = findNextItem(listItem);
                if (nextItem) {
                    nextItem.focus();
                }

                event.originalEvent.preventDefault();
            break;

            //up
            case 38:
                let prevItem = findPrevItem(listItem);
                if (prevItem) {
                    prevItem.focus();
                }

                event.originalEvent.preventDefault();
            break;

            //enter
            case 13:
                onItemClick(event);
                event.originalEvent.preventDefault();
            break;

            default:
            break;
        }
    }

    const findNextItem = (item) => {
        let nextItem = item.nextElementSibling;

        if (nextItem)
            return !DomHandler.hasClass(nextItem, 'p-picklist-item') ? this.findNextItem(nextItem) : nextItem;
        else
            return null;
    }

    const findPrevItem = (item) => {
        let prevItem = item.previousElementSibling;

        if (prevItem)
            return !DomHandler.hasClass(prevItem, 'p-picklist-item') ? findPrevItem(prevItem) : prevItem;
        else
            return null;
    }

    const isSelected = (item) => {
        return ObjectUtils.findIndexInList(item, props.selection, props.dataKey) !== -1;
    }

    useImperativeHandle(ref, () => ({
        listElementRef
    }));

    let header = null;
    let items = null;
    let wrapperClassName = classNames('p-picklist-list-wrapper', props.className);
    let listClassName = classNames('p-picklist-list', props.listClassName);

    if (props.header) {
        header = <div className="p-picklist-header">{ObjectUtils.getJSXElement(props.header, props)}</div>
    }

    if(props.list) {
        items = props.list.map((item, i) => {
            return <PickListItem key={JSON.stringify(item)} value={item} template={props.itemTemplate}
                selected={isSelected(item)} onClick={onItemClick} onKeyDown={onItemKeyDown} tabIndex={props.tabIndex} />
        });
    }

    return (
        <div ref={listElementRef} className={wrapperClassName}>
            {header}
            <ul className={listClassName} style={props.style} role="listbox" aria-multiselectable>
                {items}
            </ul>
        </div>
    );
})
