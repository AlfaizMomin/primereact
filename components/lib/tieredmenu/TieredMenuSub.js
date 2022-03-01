import React, { useRef, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import { useEventListener } from '../hooks/useEventListener';
import { useMountEffect } from '../hooks/useMountEffect';
import { useUnmountEffect } from '../hooks/useUnmountEffect';
import { useUpdateEffect } from '../hooks/useUpdateEffect';

export const TieredMenuSub = forwardRef((props, ref) => {

    const [activeItem, setActiveItem] = useState(null);
    const element = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (element.current && !element.current.contains(event.target)) {
                setActiveItem(null);
            }
        }
    });

    useMountEffect(() => {
        bindDocumentClickListener();
    })

    useUnmountEffect(() => {
        unbindDocumentClickListener();
    })

    useUpdateEffect(() => {
        setActiveItem(null);

        if (!props.root && props.parentActive) {
            position();
        }
    }, [props.parentActive])

    const position = () => {
        if (element.current) {
            const parentItem = element.current.parentElement;
            const containerOffset = DomHandler.getOffset(parentItem);
            const viewport = DomHandler.getViewport();
            const sublistWidth = element.current.offsetParent ? element.current.offsetWidth : DomHandler.getHiddenElementOuterWidth(element.current);
            const itemOuterWidth = DomHandler.getOuterWidth(parentItem.children[0]);

            if ((parseInt(containerOffset.left, 10) + itemOuterWidth + sublistWidth) > (viewport.width - DomHandler.calculateScrollbarWidth())) {
                DomHandler.addClass(element.current, 'p-submenu-list-flipped');
            }
        }
    }

    const onItemMouseEnter = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (props.root) {
            if (activeItem || props.popup) {
                setActiveItem(item);
            }
        }
        else {
            setActiveItem(item);
        }
    }

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

        if (props.root) {
            if (item.items) {
                if (activeItem && item === activeItem) {
                    setActiveItem(null);
                }
                else {
                    setActiveItem(item);
                }
            }
        }

        if (!item.items) {
            onLeafClick();
        }
    }

    const onItemKeyDown = (event, item) => {
        let listItem = event.currentTarget.parentElement;

        switch (event.which) {
            //down
            case 40:
                let nextItem = findNextItem(listItem);
                if (nextItem) {
                    nextItem.children[0].focus();
                }

                event.preventDefault();
                break;

            //up
            case 38:
                let prevItem = findPrevItem(listItem);
                if (prevItem) {
                    prevItem.children[0].focus();
                }

                event.preventDefault();
                break;

            //right
            case 39:
                if (item.items) {
                    setActiveItem(item)

                    setTimeout(() => {
                        listItem.children[1].children[0].children[0].focus();
                    }, 50);
                }

                event.preventDefault();
                break;

            default:
                break;
        }

        if (props.onKeyDown) {
            props.onKeyDown(event, listItem);
        }
    }

    const onChildItemKeyDown = (event, childListItem) => {
        //left
        if (event.which === 37) {
            setActiveItem(null)
            childListItem.parentElement.previousElementSibling.focus();
        }
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

    const onLeafClick = () => {
        setActiveItem(null);

        if (props.onLeafClick) {
            props.onLeafClick();
        }
    }

    const useSeparator = (index) => {
        return (
            <li key={'separator_' + index} className="p-menu-separator" role="separator"></li>
        );
    }

    const useSubmenu = (item) => {
        if (item.items) {
            return (
                <TieredMenuSub model={item.items} onLeafClick={onLeafClick} popup={props.popup} onKeyDown={onChildItemKeyDown} parentActive={item === activeItem} />
            );
        }

        return null;
    }

    const useMenuItem = (item, index) => {
        const active = activeItem === item;
        const className = classNames('p-menuitem', { 'p-menuitem-active': active }, item.className);
        const linkClassName = classNames('p-menuitem-link', { 'p-disabled': item.disabled });
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const submenuIconClassName = 'p-submenu-icon pi pi-angle-right';
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const submenuIcon = item.items && <span className={submenuIconClassName}></span>;
        const submenu = useSubmenu(item);
        let content = (
            <a href={item.url || '#'} className={linkClassName} target={item.target} role="menuitem" aria-haspopup={item.items != null}
                onClick={(event) => onItemClick(event, item)} onKeyDown={(event) => onItemKeyDown(event, item)} aria-disabled={item.disabled}>
                {icon}
                {label}
                {submenuIcon}
                <Ripple />
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item),
                onKeyDown: (event) => onItemKeyDown(event, item),
                className: linkClassName,
                labelClassName: 'p-menuitem-text',
                iconClassName,
                submenuIconClassName,
                element: content,
                props: props,
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li key={item.label + '_' + index} className={className} style={item.style} onMouseEnter={(event) => onItemMouseEnter(event, item)} role="none">
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


    const className = classNames({ 'p-submenu-list': !props.root });
    const submenu = useMenu();

    return (
        <ul ref={element} className={className} role={props.root ? 'menubar' : 'menu'} aria-orientation="horizontal">
            {submenu}
        </ul>
    );
})

TieredMenuSub.defaultProps = {
    model: null,
    root: false,
    className: null,
    popup: false,
    onLeafClick: null,
    onKeyDown: null,
    parentActive: false
};

TieredMenuSub.propTypes = {
    model: PropTypes.any,
    root: PropTypes.bool,
    className: PropTypes.string,
    popup: PropTypes.bool,
    onLeafClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    parentActive: PropTypes.bool
};
