import React, { forwardRef, memo, useRef } from 'react';
import { localeOption } from '../api/Api';
import { DropdownItem } from './DropdownItem';
import { Portal } from '../portal/Portal';
import { CSSTransition } from '../csstransition/CSSTransition';
import { VirtualScroller } from '../virtualscroller/VirtualScroller';
import { ObjectUtils, classNames } from '../utils/Utils';

export const DropdownPanel = memo(forwardRef((props, ref) => {
    const virtualScrollerRef = useRef(null);
    const filterInputRef = useRef(null);
    const isEmptyFilter = !(props.visibleOptions && props.visibleOptions.length) && props.hasFilter;

    const onEnter = () => {
        props.onEnter(() => {
            if (virtualScrollerRef.current) {
                const selectedIndex = props.getSelectedOptionIndex();
                if (selectedIndex !== -1) {
                    setTimeout(() => virtualScrollerRef.current.scrollToIndex(selectedIndex), 0);
                }
            }
        });
    }

    const onEntered = () => {
        props.onEntered(() => {
            if (props.filter && props.filterInputAutoFocus) {
                filterInputRef.current.focus();
            }
        });
    }

    const onFilterInputChange = (event) => {
        virtualScrollerRef.current && virtualScrollerRef.current.scrollToIndex(0);

        props.onFilterInputChange && props.onFilterInputChange(event);
    }

    const useGroupChildren = (optionGroup) => {
        const groupChildren = props.getOptionGroupChildren(optionGroup);
        return (
            groupChildren.map((option, j) => {
                const optionLabel = props.getOptionLabel(option);
                const optionKey = j + '_' + props.getOptionRenderKey(option);
                const disabled = props.isOptionDisabled(option);

                return (
                    <DropdownItem key={optionKey} label={optionLabel} option={option} template={props.itemTemplate} selected={props.isSelected(option)} disabled={disabled} onClick={props.onOptionClick} />
                )
            })
        )
    }

    const useEmptyMessage = (emptyMessage, isFilter) => {
        const message = ObjectUtils.getJSXElement(emptyMessage, props) || localeOption(isFilter ? 'emptyFilterMessage' : 'emptyMessage');

        return (
            <li className="p-dropdown-empty-message">
                {message}
            </li>
        )
    }

    const useItem = (option, index) => {
        if (props.optionGroupLabel) {
            const groupContent = props.optionGroupTemplate ? ObjectUtils.getJSXElement(props.optionGroupTemplate, option, index) : props.getOptionGroupLabel(option);
            const groupChildrenContent = useGroupChildren(option);
            const key = index + '_' + props.getOptionGroupRenderKey(option);

            return (
                <React.Fragment key={key}>
                    <li className="p-dropdown-item-group">
                        {groupContent}
                    </li>
                    {groupChildrenContent}
                </React.Fragment>
            )
        }
        else {
            const optionLabel = props.getOptionLabel(option);
            const optionKey = index + '_' + props.getOptionRenderKey(option);
            const disabled = props.isOptionDisabled(option);

            return (
                <DropdownItem key={optionKey} label={optionLabel} option={option} template={props.itemTemplate} selected={props.isSelected(option)} disabled={disabled} onClick={props.onOptionClick} />
            )
        }
    }

    const useItems = () => {
        if (ObjectUtils.isNotEmpty(props.visibleOptions)) {
            return props.visibleOptions.map(useItem);
        }
        else if (props.hasFilter) {
            return useEmptyMessage(props.emptyFilterMessage, true);
        }

        return useEmptyMessage(props.emptyMessage);
    }

    const useFilterClearIcon = () => {
        if (props.showFilterClear && props.filterValue) {
            return <i className="p-dropdown-filter-clear-icon pi pi-times" onClick={() => props.onFilterClearIconClick(() => filterInputRef.current.focus())}></i>
        }

        return null;
    }

    const useFilter = () => {
        if (props.filter) {
            const clearIcon = useFilterClearIcon();
            const containerClassName = classNames('p-dropdown-filter-container', { 'p-dropdown-clearable-filter': !!clearIcon });
            return (
                <div className="p-dropdown-header">
                    <div className={containerClassName}>
                        <input ref={filterInputRef} type="text" autoComplete="off" className="p-dropdown-filter p-inputtext p-component" placeholder={props.filterPlaceholder}
                            onKeyDown={props.onFilterInputKeyDown} onChange={onFilterInputChange} value={props.filterValue} />
                        {clearIcon}
                        <i className="p-dropdown-filter-icon pi pi-search"></i>
                    </div>
                </div>
            )
        }

        return null;
    }

    const useContent = () => {
        if (props.virtualScrollerOptions) {
            const virtualScrollerProps = {
                ...props.virtualScrollerOptions,
                ...{
                    style: { ...props.virtualScrollerOptions.style, ...{ height: props.scrollHeight } },
                    className: classNames('p-dropdown-items-wrapper', props.virtualScrollerOptions.className),
                    items: props.visibleOptions,
                    onLazyLoad: (event) => props.virtualScrollerOptions.onLazyLoad({ ...event, ...{ filter: props.filterValue } }),
                    itemTemplate: (item, options) => item && useItem(item, options.index),
                    contentTemplate: (options) => {
                        const className = classNames('p-dropdown-items', options.className);
                        const content = isEmptyFilter ? useEmptyMessage() : options.children;

                        return (
                            <ul ref={options.contentRef} className={className} role="listbox">
                                {content}
                            </ul>
                        )
                    }
                }
            };

            return <VirtualScroller ref={virtualScrollerRef} {...virtualScrollerProps} />
        }
        else {
            const items = useItems();

            return (
                <div className="p-dropdown-items-wrapper" style={{ maxHeight: props.scrollHeight || 'auto' }}>
                    <ul className="p-dropdown-items" role="listbox">
                        {items}
                    </ul>
                </div>
            )
        }
    }

    const useElement = () => {
        const className = classNames('p-dropdown-panel p-component', props.panelClassName);
        const filter = useFilter();
        const content = useContent();

        return (
            <CSSTransition nodeRef={ref} classNames="p-connected-overlay" in={props.in} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntering={props.onEntering} onEntered={onEntered} onExit={props.onExit} onExited={props.onExited}>
                <div ref={ref} className={className} style={props.panelStyle} onClick={props.onClick}>
                    {filter}
                    {content}
                </div>
            </CSSTransition>
        )
    }

    const element = useElement();

    return <Portal element={element} appendTo={props.appendTo} />
}));
