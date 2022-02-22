import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useEventListener } from '../hooks/useEventListener';
import { useResizeListener } from '../hooks/useResizeListener';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';

export const Menu = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(!props.popup);
    const menuRef = useRef(null);
    const target = useRef(null);
    const currentEvent = useRef(null);

    const [bindResizeListener, unbindResizeListener] = useResizeListener({ listener: event => {
        if (visible && !DomHandler.isTouchDevice()) {
            hide(event);
        }
    }});
    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({ type: 'click', listener: event => {
        if (visible && isOutsideClicked(event)) {
            hide(event);
        }
    }});


    const [bindScrollListener, unbindScrollListener] = useOverlayScrollListener({target: target.current, listener: (event) => {
        if (visible) {
            hide(event);
        }
    }});

    useEffect(() => {
        return () => {
            unbindDocumentListeners();
            unbindScrollListener();

            ZIndexUtils.clear(menuRef.current);
        }
    }, []);

    const onPanelClick = (event) => {
        if (props.popup) {
            OverlayService.emit('overlay-click', {
                originalEvent: event,
                target: target.current
            });
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

        if (props.popup) {
            hide(event);
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

            default:
                break;
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

    const toggle = (event) => {
        if (props.popup) {
            if (visible)
                hide(event);
            else
                show(event);
        }
    }

    const show = (event) => {
        target.current = event.currentTarget;
        currentEvent.current = event;

        setVisible(true);
    }

    const hide = (event) => {
        target.current = event.currentTarget;
        currentEvent.current = event;

        setVisible(false);
    }

    useEffect(() => {
        console.log(currentEvent.current)

        if (visible && props.onShow) {
            props.onShow(currentEvent.current);
        }

        if (!visible && props.onHide) {
            props.onShow(currentEvent.current);
        }
    }, [visible])


    const onEnter = () => {
        ZIndexUtils.set('menu', menuRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['menu']);
        DomHandler.absolutePosition(menuRef.current, target.current);
    }

    const onEntered = () => {
        bindDocumentListeners();
        bindScrollListener();
    }

    const onExit = () => {
        target.current = null;
        unbindDocumentListeners();
        unbindScrollListener();
    }

    const onExited = () => {
        ZIndexUtils.clear(menuRef.current);
    }

    const bindDocumentListeners = () => {
        bindDocumentClickListener();
        bindResizeListener();
    }

    const unbindDocumentListeners = () => {
        unbindDocumentClickListener();
        unbindResizeListener();
    }

    const isOutsideClicked = (event) => {
        return menuRef && menuRef.current && !(menuRef.current.isSameNode(event.target) || menuRef.current.contains(event.target));
    }

    useImperativeHandle(ref, () => ({
        toggle,
        show,
        hide
    }));


    const useSubmenu = (submenu, index) => {
        const className = classNames('p-submenu-header', { 'p-disabled': submenu.disabled }, submenu.className);
        const items = submenu.items.map((item, index) => {
            return useMenuItem(item, index);
        });

        return (
            <React.Fragment key={submenu.label + '_' + index}>
                <li className={className} style={submenu.style} role="presentation" aria-disabled={submenu.disabled}>{submenu.label}</li>
                {items}
            </React.Fragment>
        );
    }

    const useSeparator = (index) => {
        return (
            <li key={'separator_' + index} className="p-menu-separator" role="separator"></li>
        );
    }

    const useMenuItem = (item, index) => {
        const className = classNames('p-menuitem', item.className);
        const linkClassName = classNames('p-menuitem-link', { 'p-disabled': item.disabled })
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const tabIndex = item.disabled ? null : 0;
        let content = (
            <a href={item.url || '#'} className={linkClassName} role="menuitem" target={item.target} onClick={(event) => onItemClick(event, item)} onKeyDown={(event) => onItemKeyDown(event, item)} tabIndex={tabIndex} aria-disabled={item.disabled}>
                {icon}
                {label}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item),
                onKeyDown: (event) => onItemKeyDown(event, item),
                className: linkClassName,
                tabIndex: tabIndex,
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

    const useItem = (item, index) => {
        if (item.separator) {
            return useSeparator(index);
        }
        else {
            if (item.items)
                return useSubmenu(item, index);
            else
                return useMenuItem(item, index);
        }
    }

    const useMenu = () => {
        return (
            props.model.map((item, index) => {
                return useItem(item, index);
            })
        );
    }

    const useElement = () => {
        if (props.model) {
            const className = classNames('p-menu p-component', props.className, { 'p-menu-overlay': props.popup });
            const menuitems = useMenu();

            return (
                <CSSTransition nodeRef={menuRef} classNames="p-connected-overlay" in={visible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                    unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                    <div ref={menuRef} id={props.id} className={className} style={props.style} onClick={onPanelClick}>
                        <ul className="p-menu-list p-reset" role="menu">
                            {menuitems}
                        </ul>
                    </div>
                </CSSTransition>
            );
        }

        return null;
    }

    const element = useElement();

    return props.popup ? <Portal element={element} appendTo={props.appendTo} /> : element;
})

Menu.defaultProps = {
    id: null,
    model: null,
    popup: false,
    style: null,
    className: null,
    autoZIndex: true,
    baseZIndex: 0,
    appendTo: null,
    transitionOptions: null,
    onShow: null,
    onHide: null
};

Menu.propTypes = {
    id: PropTypes.string,
    model: PropTypes.array,
    popup: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    autoZIndex: PropTypes.bool,
    baseZIndex: PropTypes.number,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func
};
