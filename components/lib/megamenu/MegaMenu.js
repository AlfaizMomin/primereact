import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import { useEventListener } from '../hooks/Hooks';

export const MegaMenu = (props) => {

    const [activeItem, setActiveItem] = useState(null);
    const container = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (container.current && !container.current.contains(event.target)) {
                setActiveItem(null)
            }
        }
    });

    useEffect(() => {
        bindDocumentClickListener();

        return () => unbindDocumentClickListener();
    },[])

    const onLeafClick = (event, item) => {
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

        setActiveItem(null)
    }

    const onCategoryMouseEnter = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (activeItem) {
            setActiveItem(item);
        }
    }

    const onCategoryClick = (event, item) => {
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
                item: props.item
            });
        }

        if (item.items) {
            if (activeItem && activeItem === item) {
                setActiveItem(null)
            }
            else {
                setActiveItem(item)
            }
        }

        event.preventDefault();
    }

    const onCategoryKeyDown = (event, item) => {
        let listItem = event.currentTarget.parentElement;

        switch (event.which) {
            //down
            case 40:
                if (isHorizontal())
                    expandMenu(item);
                else
                    navigateToNextItem(listItem);

                event.preventDefault();
                break;

            //up
            case 38:
                if (isVertical())
                    navigateToPrevItem(listItem);
                else if (item.items && item === activeItem)
                    collapseMenu();

                event.preventDefault();
                break;

            //right
            case 39:
                if (isHorizontal())
                    navigateToNextItem(listItem);
                else
                    expandMenu(item);

                event.preventDefault()
                break;

            //left
            case 37:
                if (isHorizontal())
                    navigateToPrevItem(listItem);
                else if (item.items && item === activeItem)
                    collapseMenu();

                event.preventDefault();
                break;

            default:
                break;
        }
    }

    const expandMenu = (item) => {
        if (item.items) {
            setActiveItem(item);
        }
    }

    const collapseMenu = (item) => {
        setActiveItem(null);
    }

    const findNextItem = (item) => {
        let nextItem = item.nextElementSibling;

        if (nextItem)
            return DomHandler.hasClass(nextItem, 'p-disabled') || !DomHandler.hasClass(nextItem, 'p-menuitem') ? findNextItem(nextItem) : nextItem;
        else
            return null;
    }

    const findPrevItem = (item) => {
        let prevItem = item.previousElementSibling;

        if (prevItem)
            return DomHandler.hasClass(prevItem, 'p-disabled') || !DomHandler.hasClass(prevItem, 'p-menuitem') ? findPrevItem(prevItem) : prevItem;
        else
            return null;
    }

    const navigateToNextItem = (listItem) => {
        let nextItem = findNextItem(listItem);
        if (nextItem) {
            nextItem.children[0].focus();
        }
    }

    const navigateToPrevItem = (listItem) => {
        let prevItem = findPrevItem(listItem);
        if (prevItem) {
            prevItem.children[0].focus();
        }
    }

    const isHorizontal = () => {
        return props.orientation === 'horizontal';
    }

    const isVertical = () => {
        return props.orientation === 'vertical';
    }

    const getColumnClassName = (category) => {
        let length = category.items ? category.items.length : 0;
        let columnClass;

        switch (length) {
            case 2:
                columnClass = 'p-megamenu-col-6';
                break;

            case 3:
                columnClass = 'p-megamenu-col-4';
                break;

            case 4:
                columnClass = 'p-megamenu-col-3';
                break;

            case 6:
                columnClass = 'p-megamenu-col-2';
                break;

            default:
                columnClass = 'p-megamenu-col-12';
                break;
        }

        return columnClass;
    }


    const useSeparator = (index) => {
        return (
            <li key={'separator_' + index} className="p-menu-separator" role="separator"></li>
        );
    }

    const useSubmenuIcon = (item) => {
        if (item.items) {
            const className = classNames('p-submenu-icon pi', { 'pi-angle-down': isHorizontal(), 'pi-angle-right': isVertical() });

            return (
                <span className={className}></span>
            );
        }

        return null;
    }

    const useSubmenuItem = (item, index) => {
        if (item.separator) {
            return useSeparator(index);
        }
        else {
            const className = classNames('p-menuitem', item.className);
            const linkClassName = classNames('p-menuitem-link', { 'p-disabled': item.disabled });
            const iconClassName = classNames(item.icon, 'p-menuitem-icon');
            const icon = item.icon && <span className={iconClassName}></span>;
            const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
            let content = (
                <a href={item.url || '#'} className={linkClassName} target={item.target} onClick={(event) => onLeafClick(event, item)} role="menuitem" aria-disabled={item.disabled}>
                    {icon}
                    {label}
                    <Ripple />
                </a>
            );

            if (item.template) {
                const defaultContentOptions = {
                    onClick: (event) => onLeafClick(event, item),
                    className: linkClassName,
                    labelClassName: 'p-menuitem-text',
                    iconClassName,
                    element: content,
                    props: props
                };

                content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
            }

            return (
                <li key={item.label + '_' + index} className={className} style={item.style} role="none">
                    {content}
                </li>
            );
        }
    }

    const useSubmenu = (submenu) => {
        const className = classNames('p-megamenu-submenu-header', { 'p-disabled': submenu.disabled }, submenu.className);
        const items = submenu.items.map((item, index) => {
            return useSubmenuItem(item, index);
        });

        return (
            <React.Fragment key={submenu.label}>
                <li className={className} style={submenu.style} role="presentation" aria-disabled={submenu.disabled}>{submenu.label}</li>
                {items}
            </React.Fragment>
        );
    }

    const useSubmenus = (column) => {
        return (
            column.map((submenu, index) => {
                return useSubmenu(submenu, index);
            })
        );
    }

    const useColumn = (category, column, index, columnClassName) => {
        const submenus = useSubmenus(column);

        return (
            <div key={category.label + '_column_' + index} className={columnClassName}>
                <ul className="p-megamenu-submenu" role="menu">
                    {submenus}
                </ul>
            </div>
        );
    }

    const useColumns = (category) => {
        if (category.items) {
            const columnClassName = getColumnClassName(category);

            return (
                category.items.map((column, index) => {
                    return useColumn(category, column, index, columnClassName);
                })
            );
        }

        return null;
    }

    const useCategoryPanel = (category) => {
        if (category.items) {
            const columns = useColumns(category);

            return (
                <div className="p-megamenu-panel">
                    <div className="p-megamenu-grid">
                        {columns}
                    </div>
                </div>
            );
        }

        return null;
    }

    const useCategory = (category, index) => {
        const className = classNames('p-menuitem', { 'p-menuitem-active': category === activeItem }, category.className);
        const linkClassName = classNames('p-menuitem-link', { 'p-disabled': category.disabled });
        const iconClassName = classNames('p-menuitem-icon', category.icon);
        const icon = category.icon && <span className={iconClassName}></span>;
        const label = category.label && <span className="p-menuitem-text">{category.label}</span>;
        const itemContent = category.template ? ObjectUtils.getJSXElement(category.template, category) : null;
        const submenuIcon = useSubmenuIcon(category);
        const panel = useCategoryPanel(category);

        return (
            <li key={category.label + '_' + index} className={className} style={category.style} onMouseEnter={e => onCategoryMouseEnter(e, category)} role="none">
                <a href={category.url || '#'} className={linkClassName} target={category.target} onClick={e => onCategoryClick(e, category)} onKeyDown={e => onCategoryKeyDown(e, category)}
                    role="menuitem" aria-haspopup={category.items != null}>
                    {icon}
                    {label}
                    {itemContent}
                    {submenuIcon}
                    <Ripple />
                </a>
                {panel}
            </li>
        );
    }

    const useMenu = () => {
        if (props.model) {
            return (
                props.model.map((item, index) => {
                    return useCategory(item, index, true);
                })
            );
        }

        return null;
    }

    const useCustomContent = () => {
        if (props.children) {
            return (
                <div className="p-megamenu-custom">
                    {props.children}
                </div>
            );
        }

        return null;
    }


    const className = classNames('p-megamenu p-component', {
        'p-megamenu-horizontal': props.orientation === 'horizontal',
        'p-megamenu-vertical': props.orientation === 'vertical'
    }, props.className);
    const menu = useMenu();
    const customContent = useCustomContent();

    return (
        <div ref={container} id={props.id} className={className} style={props.style}>
            <ul className="p-megamenu-root-list" role="menubar">
                {menu}
            </ul>
            {customContent}
        </div>
    );

}

MegaMenu.defaultProps = {
    __TYPE: 'MegaMenu',
    id: null,
    model: null,
    style: null,
    className: null,
    orientation: 'horizontal'
}

MegaMenu.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    model: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    orientation: PropTypes.string
}
