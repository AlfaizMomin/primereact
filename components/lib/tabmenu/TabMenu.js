import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const TabMenu = (props) => {

    const [activeIndexState, setActiveIndexState] = useState(props.activeIndex);
    const activeIndex = props.onTabChange ? props.activeIndex : activeIndexState;
    const inkbarRef = useRef(null);
    const navRef = useRef(null);
    const tabsRef = useRef({})

    const itemClick = (event, item, index) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (!item.url) {
            event.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }

        if (props.onTabChange) {
            props.onTabChange({
                originalEvent: event,
                value: item,
                index
            });
        }
        else {
            setActiveIndexState(index)
        }
    }

    const getActiveIndex = () => {
        return props.onTabChange ? props.activeIndex : activeIndex;
    }

    const isSelected = (index) => {
        return (index === (getActiveIndex() || 0));
    }

    const updateInkBar = () => {
        const activeIndex = getActiveIndex();
        const tabHeader = tabsRef.current[`tab_${activeIndex}`];

        inkbarRef.current.style.width = DomHandler.getWidth(tabHeader) + 'px';
        inkbarRef.current.style.left = DomHandler.getOffset(tabHeader).left - DomHandler.getOffset(navRef.current).left + 'px';
    }

    useEffect(() => {
        updateInkBar();
    })

    const useMenuItem = (item, index) => {
        const active = isSelected(index);
        const className = classNames('p-tabmenuitem', {
            'p-highlight': active,
            'p-disabled': item.disabled
        }, item.className);
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        let content = (
            <a href={item.url || '#'} className="p-menuitem-link" target={item.target} onClick={(event) => itemClick(event, item, index)} role="presentation">
                {icon}
                {label}
                <Ripple />
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => itemClick(event, item, index),
                className: 'p-menuitem-link',
                labelClassName: 'p-menuitem-text',
                iconClassName,
                element: content,
                props: props,
                active,
                index
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li ref={tabsRef.current[`tab_${index}`]} key={item.label + '_' + index} className={className} style={item.style} role="tab" aria-selected={active} aria-expanded={active} aria-disabled={item.disabled}>
                {content}
            </li>
        );
    }

    const useItems = () => {
        return (
            props.model.map((item, index) => {
                return useMenuItem(item, index);
            })
        );
    }

    if (props.model) {
        const className = classNames('p-tabmenu p-component', props.className);
        const items = useItems();

        return (
            <div id={props.id} className={className} style={props.style}>
                <ul ref={navRef} className="p-tabmenu-nav p-reset" role="tablist">
                    {items}
                    <li ref={inkbarRef} className="p-tabmenu-ink-bar"></li>
                </ul>
            </div>
        );
    }

    return null;
}

TabMenu.defaultProps = {
    __TYPE: 'TabMenu',
    id: null,
    model: null,
    activeIndex: 0,
    style: null,
    className: null,
    onTabChange: null
}

TabMenu.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    model: PropTypes.array,
    activeIndex: PropTypes.number,
    style: PropTypes.any,
    className: PropTypes.string,
    onTabChange: PropTypes.func
}
