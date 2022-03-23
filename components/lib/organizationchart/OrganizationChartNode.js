import React, { memo, useState } from 'react';
import { classNames, ObjectUtils } from '../utils/Utils';

export const OrganizationChartNode = memo((props) => {
    const node = props.node;
    const [expandedState, setExpandedState] = useState(node.expanded);
    const leaf = node.leaf === false ? false : !(node.children && node.children.length);
    const colspan = (node.children && node.children.length) ? node.children.length * 2 : null;
    const selected = props.isSelected(node);
    const visibility = (!leaf && expandedState) ? 'inherit' : 'hidden';

    const onNodeClick = (event, node) => {
        props.onNodeClick(event, node);
    }

    const toggleNode = (event, node) => {
        setExpandedState(prevExpanded => !prevExpanded);
        event.preventDefault();
    }

    const useChildNodes = () => {
        return (
            <tr style={{ visibility }} className="p-organizationchart-nodes">
                {
                    node.children && node.children.map((child, index) => {
                        return (
                            <td key={index} colSpan="2">
                                <OrganizationChartNode node={child} nodeTemplate={props.nodeTemplate} selectionMode={props.selectionMode}
                                    onNodeClick={props.onNodeClick} isSelected={props.isSelected} />
                            </td>
                        )
                    })
                }
            </tr>
        )
    }

    const useLinesMiddle = () => {
        const nodeChildLength = node.children && node.children.length;

        return (
            <tr style={{ visibility }} className="p-organizationchart-lines">
                {
                    node.children && node.children.length === 1 && (
                        <td colSpan={colspan}>
                            <div className="p-organizationchart-line-down"></div>
                        </td>
                    )
                }
                {
                    node.children && node.children.length > 1 && (
                        node.children.map((_, index) => {
                            const leftClassName = classNames('p-organizationchart-line-left', { 'p-organizationchart-line-top': index !== 0 });
                            const rightClassName = classNames('p-organizationchart-line-right', { 'p-organizationchart-line-top': index !== nodeChildLength - 1 });

                            return [<td key={index + '_lineleft'} className={leftClassName}>&nbsp;</td>, <td key={index + '_lineright'} className={rightClassName}>&nbsp;</td>];
                        })
                    )
                }
            </tr>
        )
    }

    const useLinesDown = () => {
        return (
            <tr style={{ visibility }} className="p-organizationchart-lines">
                <td colSpan={colspan}>
                    <div className="p-organizationchart-line-down"></div>
                </td>
            </tr>
        )
    }

    const useToggler = () => {
        if (!leaf) {
            const toggleIconClassName = classNames('p-node-toggler-icon', {
                'pi pi-chevron-down': expandedState,
                'pi pi-chevron-up': !expandedState
            });

            return (
                /* eslint-disable */
                <a href="#" className="p-node-toggler" onClick={(e) => toggleNode(e, node)}>
                    <i className={toggleIconClassName}></i>
                </a>
                /* eslint-enable */
            )
        }

        return null;
    }

    const useNodeLabel = () => {
        const label = props.nodeTemplate ? ObjectUtils.getJSXElement(props.nodeLabel, node) : node.label;

        return <div>{label}</div>
    }

    const useNodeContent = () => {
        const nodeClassName = classNames('p-organizationchart-node-content', {
            'p-organizationchart-selectable-node': props.selectionMode && node.selectable !== false,
            'p-highlight': selected
        }, node.className);
        const label = useNodeLabel();
        const toggler = useToggler();

        return (
            <tr>
                <td colSpan={colspan}>
                    <div className={nodeClassName} onClick={(e) => onNodeClick(e, node)}>
                        {label}
                        {toggler}
                    </div>
                </td>
            </tr>
        )
    }

    const nodeContent = useNodeContent();
    const linesDown = useLinesDown();
    const linesMiddle = useLinesMiddle();
    const childNodes = useChildNodes();

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
});
