import React from 'react';
import { Button } from '../button/Button';
import { ObjectUtils, classNames } from '../utils/Utils';

export const PickListControls = (props) => {
    const moveUp = (event) => {
        let selectedItems = props.selection;

        if (selectedItems && selectedItems.length) {
            let list = [...props.list];

            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list, props.dataKey);

                if (selectedItemIndex !== 0) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex - 1];
                    list[selectedItemIndex - 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }

            if (props.onReorder) {
                props.onReorder({
                    originalEvent: event,
                    value: list,
                    direction: 'up'
                });
            }
        }
    }

    const moveTop = (event) => {
        let selectedItems = props.selection;

        if (selectedItems && selectedItems.length) {
            let list = [...props.list];

            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list, props.dataKey);

                if (selectedItemIndex !== 0) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.unshift(movedItem);
                }
                else {
                    break;
                }
            }

            if (props.onReorder) {
                props.onReorder({
                    originalEvent: event,
                    value: list,
                    direction: 'top'
                });
            }
        }
    }

    const moveDown = (event) => {
        let selectedItems = props.selection;

        if (selectedItems && selectedItems.length) {
            let list = [...props.list];

            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list, props.dataKey);

                if (selectedItemIndex !== (list.length - 1)) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex + 1];
                    list[selectedItemIndex + 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }

            if (props.onReorder) {
                props.onReorder({
                    originalEvent: event,
                    value: list,
                    direction: 'down'
                });
            }
        }
    }

    const moveBottom = (event) => {
        let selectedItems = props.selection;

        if (selectedItems && selectedItems.length) {
            let list = [...props.list];

            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list, props.dataKey);

                if (selectedItemIndex !== (list.length - 1)) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.push(movedItem);
                }
                else {
                    break;
                }
            }

            if (props.onReorder) {
                props.onReorder({
                    originalEvent: event,
                    value: list,
                    direction: 'bottom'
                });
            }
        }
    }

    let moveDisabled = !props.selection.length;
    let className = classNames('p-picklist-buttons', props.className);

    return <div className={className}>
        <Button disabled={moveDisabled} type="button" icon="pi pi-angle-up" onClick={moveUp}></Button>
        <Button disabled={moveDisabled} type="button" icon="pi pi-angle-double-up" onClick={moveTop}></Button>
        <Button disabled={moveDisabled} type="button" icon="pi pi-angle-down" onClick={moveDown}></Button>
        <Button disabled={moveDisabled} type="button" icon="pi pi-angle-double-down" onClick={moveBottom}></Button>
    </div>;
}
