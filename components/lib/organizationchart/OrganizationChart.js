import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';
import { OrganizationChartNode  } from './OrganizationChartNode';

export const OrganizationChart = (props) => {
    const root = props.value && props.value.length ? props.value[0] : null;
    const className = classNames('p-organizationchart p-component', props.className);

    const onNodeClick = (event, node) => {
        if (props.selectionMode) {
            const eventTarget = event.target;
            if (eventTarget.className && (eventTarget.className.indexOf('p-node-toggler') !== -1 || eventTarget.className.indexOf('p-node-toggler-icon') !== -1)) {
                return;
            }

            if (node.selectable === false) {
                return;
            }

            let index = findIndexInSelection(node);
            let selected = (index >= 0);
            let selection;

            if (props.selectionMode === 'single') {
                if (selected) {
                    selection = null;
                    if (props.onNodeUnselect) {
                        props.onNodeUnselect({originalEvent: event, node: node});
                    }
                }
                else {
                    selection = node;
                    if (props.onNodeSelect) {
                        props.onNodeSelect({originalEvent: event, node: node});
                    }
                }
            }
            else if (props.selectionMode === 'multiple') {
                if (selected) {
                    selection = props.selection.filter((val,i) => i !== index);
                    if (props.onNodeUnselect) {
                        props.onNodeUnselect({originalEvent: event, node: node});
                    }
                }
                else {
                    selection = [...props.selection||[], node];
                    if(props.onNodeSelect) {
                        props.onNodeSelect({originalEvent: event, node: node});
                    }
                }
            }

            if (props.onSelectionChange) {
                props.onSelectionChange({
                    originalEvent: event,
                    data: selection
                });
            }
        }
    }

    const findIndexInSelection = (node) => {
        let index = -1;

        if(props.selectionMode && props.selection) {
            if(props.selectionMode === 'single') {
                index = (props.selection === node) ? 0 : - 1;
            }
            else if(props.selectionMode === 'multiple') {
                for(let i = 0; i  < props.selection.length; i++) {
                    if(props.selection[i] === node) {
                        index = i;
                        break;
                    }
                }
            }
        }

        return index;
    }

    const isSelected = (node) => {
        return findIndexInSelection(node) !== -1;
    }

    return (
        <div id={props.id} style={props.style} className={className}>
            <OrganizationChartNode node={root} nodeTemplate={props.nodeTemplate} selectionMode={props.selectionMode}
                    onNodeClick={onNodeClick} isSelected={isSelected}/>
        </div>
    );
}

OrganizationChart.defaultProps = {
    __TYPE: 'OrganizationChart',
    id: null,
    value: null,
    style: null,
    className: null,
    selectionMode: null,
    selection: null,
    nodeTemplate: null,
    onSelectionChange: null,
    onNodeSelect: null,
    onNodeUnselect: null
}

OrganizationChart.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    value: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    selectionMode: PropTypes.string,
    selection: PropTypes.any,
    nodeTemplate: PropTypes.any,
    onSelectionChange: PropTypes.func,
    onNodeSelect: PropTypes.func,
    onNodeUnselect: PropTypes.func
}
