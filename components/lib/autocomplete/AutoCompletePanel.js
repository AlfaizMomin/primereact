import React, { forwardRef } from 'react';
import { ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Portal } from '../portal/Portal';
import { VirtualScroller } from '../virtualscroller/VirtualScroller';

const AutoCompletePanelComponent = (props) => {

    const getOptionGroupRenderKey = (optionGroup) => {
        return ObjectUtils.resolveFieldData(optionGroup, props.optionGroupLabel);
    }

    const useGroupChildren = (optionGroup, i) => {
        const groupChildren = props.getOptionGroupChildren(optionGroup);
        return (
            groupChildren.map((item, j) => {
                let itemContent = props.itemTemplate ? ObjectUtils.getJSXElement(props.itemTemplate, item, j) : props.field ? ObjectUtils.resolveFieldData(item, props.field) : item;

                return (
                    <li key={j + '_item'} role="option" aria-selected={props.ariaSelected === item} className="p-autocomplete-item" onClick={(e) => props.onItemClick(e, item)} data-group={i} data-index={j}>
                        {itemContent}
                        <Ripple />
                    </li>
                );
            })
        )
    }

    const useItem = (suggestion, index) => {
        if (props.optionGroupLabel) {
            const groupContent = props.optionGroupTemplate ? ObjectUtils.getJSXElement(props.optionGroupTemplate, suggestion, index) : props.getOptionGroupLabel(suggestion);
            const groupChildrenContent = useGroupChildren(suggestion, index);
            const key = index + '_' + getOptionGroupRenderKey(suggestion);

            return (
                <React.Fragment key={key}>
                    <li className="p-autocomplete-item-group">
                        {groupContent}
                    </li>
                    {groupChildrenContent}
                </React.Fragment>
            )
        }
        else {
            let itemContent = props.itemTemplate ? ObjectUtils.getJSXElement(props.itemTemplate, suggestion, index) : props.field ? ObjectUtils.resolveFieldData(suggestion, props.field) : suggestion;

            return (
                <li key={index + '_item'} role="option" aria-selected={props.ariaSelected === suggestion} className="p-autocomplete-item" onClick={(e) => props.onItemClick(e, suggestion)}>
                    {itemContent}
                    <Ripple />
                </li>
            );
        }
    }

    const useItems = () => {
        if (props.suggestions) {
            return props.suggestions.map((suggestion, index) => useItem(suggestion, index));
        }

        return null;
    }

    const useContent = () => {
        if (props.virtualScrollerOptions) {
            const virtualScrollerProps = {
                ...props.virtualScrollerOptions, ...{
                    style: { ...props.virtualScrollerOptions.style, ...{ height: props.scrollHeight } },
                    items: props.suggestions,
                    itemTemplate: (item, options) => item && useItem(item, options.index),
                    contentTemplate: (options) => {
                        const className = classNames('p-autocomplete-items', options.className);

                        return (
                            <ul ref={options.contentRef} className={className} role="listbox" id={props.listId}>
                                {options.children}
                            </ul>
                        );
                    }
                }
            };

            return <VirtualScroller ref={props.virtualScrollerRef} {...virtualScrollerProps} />;
        }
        else {
            const items = useItems();

            return (
                <ul className="p-autocomplete-items" role="listbox" id={props.listId}>
                    {items}
                </ul>
            );
        }
    }

    const useElement = () => {
        const panelClassName = classNames('p-autocomplete-panel p-component', props.panelClassName);
        const panelStyle = { maxHeight: props.scrollHeight, ...props.panelStyle };
        const content = useContent();

        return (
            <CSSTransition nodeRef={props.forwardRef} classNames="p-connected-overlay" in={props.in} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={props.onEnter} onEntering={props.onEntering} onEntered={props.onEntered} onExit={props.onExit} onExited={props.onExited}>
                <div ref={props.forwardRef} className={panelClassName} style={panelStyle} onClick={props.onClick}>
                    {content}
                </div>
            </CSSTransition>
        );
    }

    const element = useElement();

    return <Portal element={element} appendTo={props.appendTo} />;
}

export const AutoCompletePanel = forwardRef((props, ref) => <AutoCompletePanelComponent forwardRef={ref} {...props} />);
