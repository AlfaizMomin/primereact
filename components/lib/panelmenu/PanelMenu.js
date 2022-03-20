import React, { useState, Component } from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { useMountEffect } from '../hooks/Hooks';

const PanelMenuSub = (props) => {

    const findActiveItem = () => {
        if (props.model) {
            if (props.multiple) {
                return props.model.filter(item => item.expanded);
            }
            else {
                let activeItem = null;
                props.model.forEach(item => {
                    if (item.expanded) {
                        if (!activeItem)
                            activeItem = item;
                        else
                            item.expanded = false;
                    }
                });

                return activeItem;
            }
        }

        return null;
    }

    const [activeItem, setActiveItem] = useState(findActiveItem());

    const onItemClick = (event, item) => {
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

        let activeItem = activeItem;
        let active = isItemActive(item);

        if (active) {
            item.expanded = false;
            setActiveItem(props.multiple ? activeItem.filter(a_item => a_item !== item) : null)
        }
        else {
            if (!props.multiple && activeItem) {
                activeItem.expanded = false;
            }

            item.expanded = true;
            setActiveItem(props.multiple ? [...(activeItem || []), item] : item)
        }
    }

    const isItemActive = (item) => {
        return activeItem && (props.multiple ? activeItem.indexOf(item) > -1 : activeItem === item);
    }

    const useSeparator = (index) => {
        return <li key={'separator_' + index} className="p-menu-separator"></li>;
    }

    const useSubmenu = (item, active) => {
        const submenuWrapperClassName = classNames('p-toggleable-content', { 'p-toggleable-content-collapsed': !active });
        const submenuContentRef = React.createRef();

        if (item.items) {
            return (
                <CSSTransition nodeRef={submenuContentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit>
                    <div ref={submenuContentRef} className={submenuWrapperClassName}>
                        <PanelMenuSub model={item.items} multiple={props.multiple} />
                    </div>
                </CSSTransition>
            );
        }

        return null;
    }

    const useMenuItem = (item, index) => {
        const active = isItemActive(item);
        const className = classNames('p-menuitem', item.className);
        const linkClassName = classNames('p-menuitem-link', { 'p-disabled': item.disabled });
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const submenuIconClassName = classNames('p-panelmenu-icon pi pi-fw', { 'pi-angle-right': !active, 'pi-angle-down': active });
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const submenuIcon = item.items && <span className={submenuIconClassName}></span>;
        const submenu = useSubmenu(item, active);
        let content = (
            <a href={item.url || '#'} className={linkClassName} target={item.target} onClick={(event) => onItemClick(event, item, index)} role="menuitem" aria-disabled={item.disabled}>
                {submenuIcon}
                {icon}
                {label}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item, index),
                className: linkClassName,
                labelClassName: 'p-menuitem-text',
                iconClassName,
                submenuIconClassName,
                element: content,
                props: props,
                leaf: !item.items,
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li key={item.label + '_' + index} className={className} style={item.style} role="none">
                {content}
                {submenu}
            </li>
        );
    }

    const useItem = (item, index) => {
        if (item.separator)
            return useSeparator(index);
        else
            return useMenuItem(item, index);
    }

    const useMenu = () => {
        if (props.model) {
            return (
                props.model.map((item, index) => {
                    return useItem(item, index);
                })
            );
        }

        return null;
    }

    const className = classNames('p-submenu-list', props.className);
    const menu = useMenu();

    return (
        <ul className={className} role="tree">
            {menu}
        </ul>
    );
}

export const PanelMenu = (props) => {

    const findActiveItem = () => {
        if (props.model) {
            if (props.multiple) {
                return props.model.filter(item => item.expanded);
            }
            else {
                let activeItem = null;
                props.model.forEach(item => {
                    if (item.expanded) {
                        if (!activeItem)
                            activeItem = item;
                        else
                            item.expanded = false;
                    }
                });

                return activeItem;
            }
        }

        return null;
    }

    const [id, setId] = useState(props.id);
    const [activeItem, setActiveItem] = useState(findActiveItem())

    const onItemClick = (event, item) => {
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

        let activeItem = activeItem;
        let active = isItemActive(item);

        if (active) {
            item.expanded = false;
            setActiveItem(props.multiple ? activeItem.filter(a_item => a_item !== item) : null)
        }
        else {
            if (!props.multiple && activeItem) {
                activeItem.expanded = false;
            }

            item.expanded = true;
            setActiveItem(props.multiple ? [...(activeItem || []), item] : item)
        }
    }

    const isItemActive = (item) => {
        return activeItem && (props.multiple ? activeItem.indexOf(item) > -1 : activeItem === item);
    }

    useMountEffect(() => {
        if (!id) {
            setId(UniqueComponentId())
        }
    })

    const usePanel = (item, index) => {
        const active = isItemActive(item);
        const className = classNames('p-panelmenu-panel', item.className);
        const headerClassName = classNames('p-component p-panelmenu-header', { 'p-highlight': active, 'p-disabled': item.disabled });
        const submenuIconClassName = classNames('p-panelmenu-icon pi', { 'pi-chevron-right': !active, ' pi-chevron-down': active });
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const submenuIcon = item.items && <span className={submenuIconClassName}></span>;
        const itemIcon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const contentWrapperClassName = classNames('p-toggleable-content', { 'p-toggleable-content-collapsed': !active });
        const menuContentRef = React.createRef();
        let content = (
            <a href={item.url || '#'} className="p-panelmenu-header-link" onClick={(e) => onItemClick(e, item)} aria-expanded={active}
                id={id + '_header'} aria-controls={id + 'content'} aria-disabled={item.disabled}>
                {submenuIcon}
                {itemIcon}
                {label}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item),
                className: 'p-panelmenu-header-link',
                labelClassName: 'p-menuitem-text',
                submenuIconClassName,
                iconClassName,
                element: content,
                props: props,
                leaf: !item.items,
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <div key={item.label + '_' + index} className={className} style={item.style}>
                <div className={headerClassName} style={item.style}>
                    {content}
                </div>
                <CSSTransition nodeRef={menuContentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit options={props.transitionOptions}>
                    <div ref={menuContentRef} className={contentWrapperClassName} role="region" id={id + '_content'} aria-labelledby={id + '_header'}>
                        <div className="p-panelmenu-content">
                            <PanelMenuSub model={item.items} className="p-panelmenu-root-submenu" multiple={props.multiple} />
                        </div>
                    </div>
                </CSSTransition>
            </div>
        );
    }

    const usePanels = () => {
        if (props.model) {
            return (
                props.model.map((item, index) => {
                    return usePanel(item, index);
                })
            );
        }

        return null;
    }

    const className = classNames('p-panelmenu p-component', props.className);
    const panels = usePanels();

    return (
        <div id={props.id} className={className} style={props.style}>
            {panels}
        </div>
    );
}

PanelMenuSub.defaultProps = {
    model: null,
    multiple: false
};

PanelMenuSub.propTypes = {
    model: PropTypes.any,
    multiple: PropTypes.bool
};


PanelMenu.defaultProps = {
    id: null,
    model: null,
    style: null,
    className: null,
    multiple: false,
    transitionOptions: null
};

PanelMenu.propTypes = {
    id: PropTypes.string,
    model: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    transitionOptions: PropTypes.object
};
