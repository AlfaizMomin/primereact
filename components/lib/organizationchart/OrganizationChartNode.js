import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/Utils';

export const OrganizationChartNode = (props) => {
    const node = props.node;
    const isLeaf = node.leaf === false ? false : !(node.children && node.children.length);
    const colspan = (node.children && node.children.length) ? node.children.length * 2 : null;
    const selected = props.isSelected(node);
    const [expanded,setExpanded] = useState(node.expanded);

    const onNodeClick = (event, node) => {
        props.onNodeClick(event, node)
    }

    const toggleNode = (event, node) => {
        setExpanded(!expanded);
        event.preventDefault();
    }

    const nodeClassName = classNames('p-organizationchart-node-content', node.className, {
        'p-organizationchart-selectable-node': props.selectionMode && node.selectable !== false,
        'p-highlight': selected
    });
    const nodeLabel = (props.nodeTemplate && props.nodeTemplate(node)) ? <div>{props.nodeTemplate(node)}</div> : <div>{node.label}</div>;
    const toggleIcon = classNames('p-node-toggler-icon', {'pi pi-chevron-down': expanded, 'pi pi-chevron-up': !expanded});
    const nodeContent = (
        <tr>
            <td colSpan={colspan}>
                <div className={nodeClassName} onClick={(e) => onNodeClick(e, node)}>
                    {nodeLabel}
                    {
                        /* eslint-disable */
                        !isLeaf && <a href="#" className="p-node-toggler" onClick={(e) => toggleNode(e, node)}>
                            <i className={toggleIcon}></i>
                        </a>
                        /* eslint-enable */
                    }
                </div>
            </td>
        </tr>
    );

    const _visibility = (!isLeaf && expanded) ? 'inherit' : 'hidden';
    const linesDown = (
        <tr style={{visibility: _visibility}} className="p-organizationchart-lines">
            <td colSpan={colspan}>
                <div className="p-organizationchart-line-down"></div>
            </td>
        </tr>
    );
    const nodeChildLength = node.children && node.children.length;
    const linesMiddle = (
        <tr style={{visibility: _visibility}} className="p-organizationchart-lines">
            {
                node.children && node.children.length === 1 && (
                                <td colSpan={colspan}>
                                    <div className="p-organizationchart-line-down"></div>
                                </td>
                )
            }
            {
                node.children && node.children.length > 1 && (
                                node.children.map((item, index) => {
                                    let leftClass = classNames('p-organizationchart-line-left', {'p-organizationchart-line-top': index !== 0}),
                                    rightClass = classNames('p-organizationchart-line-right', {'p-organizationchart-line-top': index !== nodeChildLength - 1});

                                    return [<td key={index + '_lineleft'} className={leftClass}>&nbsp;</td>, <td key={index + '_lineright'} className={rightClass}>&nbsp;</td>];
                                })
                            )
            }
        </tr>),
        childNodes = (<tr style={{visibility: _visibility}} className="p-organizationchart-nodes">
                {
                    node.children && node.children.map((child, index) => {
                        return (<td key={index} colSpan="2">
                                <OrganizationChartNode node={child} nodeTemplate={props.nodeTemplate} selectionMode={props.selectionMode}
                                    onNodeClick={props.onNodeClick} isSelected={props.isSelected}/>
                            </td>)
                    })
                }
        </tr>
    );

    return (
        <table className="p-organizationchart-table">
            <tbody>
                {nodeContent}
                {linesDown}
                {linesMiddle}
                {childNodes}
            </tbody>
        </table>
    )
}
