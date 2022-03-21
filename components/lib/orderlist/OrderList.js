import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { OrderListControls } from './OrderListControls';
import { OrderListSubList } from './OrderListSubList';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { useUpdateEffect } from '../hooks/Hooks';

export const OrderList = (props) => {

    const [selection, setSelection] = useState([]);

    const elementRef = useRef(null);
    const sublistRef = useRef(null);
    const reorderDirection = useRef(null);
    const onDrop = useRef(null);
    const onDragStart = useRef(null);
    const onDragEnter = useRef(null);
    const onDragEnd = useRef(null);

    const onItemClick = (event) => {
        let metaKey = (event.originalEvent.metaKey || event.originalEvent.ctrlKey);
        let index = ObjectUtils.findIndexInList(event.value, selection, props.dataKey);
        let selected = (index !== -1);
        let newSelection;

        if (selected) {
            if (metaKey)
                newSelection = selection.filter((val, i) => i !== index);
            else
                newSelection = [event.value];
        }
        else {
            if (metaKey)
                newSelection = [...selection, event.value];
            else
                newSelection = [event.value];
        }

        setSelection(newSelection)
    }

    const onItemKeyDown = (event) => {
        let listItem = event.originalEvent.currentTarget;

        switch (event.originalEvent.which) {
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
            return !DomHandler.hasClass(nextItem, 'p-orderlist-item') ? findNextItem(nextItem) : nextItem;
        else
            return null;
    }

    const findPrevItem = (item) => {
        let prevItem = item.previousElementSibling;

        if (prevItem)
            return !DomHandler.hasClass(prevItem, 'p-orderlist-item') ? findPrevItem(prevItem) : prevItem;
        else
            return null;
    }

    const onReorder = (event) => {
        if (props.onChange) {
            props.onChange({
                event: event.originalEvent,
                value: event.value
            });
        }

        reorderDirection.current = event.direction;
    }

    useUpdateEffect(() => {
        if (reorderDirection.current) {
            updateListScroll();
            reorderDirection.current = null;
        }
    })

    const updateListScroll = () => {
        let listItems = DomHandler.find(sublistRef.current.listElementRef.current, '.p-orderlist-item.p-highlight');

        if (listItems && listItems.length) {
            switch (reorderDirection.current) {
                case 'up':
                    DomHandler.scrollInView(sublistRef.current.listElementRef.current, listItems[0]);
                    break;

                case 'top':
                    sublistRef.current.listElementRef.current.scrollTop = 0;
                    break;

                case 'down':
                    DomHandler.scrollInView(sublistRef.current.listElementRef.current, listItems[listItems.length - 1]);
                    break;

                case 'bottom':
                    sublistRef.current.listElementRef.current.scrollTop = sublistRef.current.listElementRef.current.scrollHeight;
                break;

                default:
                break;
            }
        }
    }

    let className = classNames('p-orderlist p-component', props.className);

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style}>
            <OrderListControls value={props.value} selection={selection} onReorder={onReorder} dataKey={props.dataKey} />
            <OrderListSubList ref={sublistRef} value={props.value} selection={selection} onItemClick={onItemClick} onItemKeyDown={onItemKeyDown}
                itemTemplate={props.itemTemplate} header={props.header} listStyle={props.listStyle} dataKey={props.dataKey}
                dragdrop={props.dragdrop} onDragStart={onDragStart.current} onDragEnter={onDragEnter.current} onDragEnd={onDragEnd.current} onDragLeave={onDragEnter} onDrop={onDrop}
                onChange={props.onChange} tabIndex={props.tabIndex} />
        </div>
    );
}

OrderList.defaultProps = {
    __TYPE: 'OrderList',
    id: null,
    value: null,
    header: null,
    style: null,
    className: null,
    listStyle: null,
    dragdrop: false,
    tabIndex: 0,
    dataKey: null,
    onChange: null,
    itemTemplate: null
}

OrderList.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    value: PropTypes.array,
    header: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    listStyle: PropTypes.object,
    dragdrop: PropTypes.bool,
    tabIndex: PropTypes.number,
    dataKey: PropTypes.string,
    onChange: PropTypes.func,
    itemTemplate: PropTypes.func
}
