import React, { useRef, forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useUpdateEffect } from '../hooks/useUpdateEffect';
import { useEventListener } from '../hooks/useEventListener';
import { useResizeListener } from '../hooks/useResizeListener';

const ContextMenuSub = (props) => {

    const [activeItem, setActiveItem] = useState(null);
    const submenuRef = useRef(null);

    const onItemMouseEnter = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        setActiveItem(item);
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

        if (!item.items) {
            props.onLeafClick(event);
        }
    }

    const position = () => {
        const parentItem = submenuRef.current.parentElement;
        const containerOffset = DomHandler.getOffset(submenuRef.current.parentElement)
        const viewport = DomHandler.getViewport();
        const sublistWidth = submenuRef.current.offsetParent ? submenuRef.current.offsetWidth : DomHandler.getHiddenElementOuterWidth(submenuRef.current);
        const itemOuterWidth = DomHandler.getOuterWidth(parentItem.children[0]);

        submenuRef.current.style.top = '0px';

        if ((parseInt(containerOffset.left, 10) + itemOuterWidth + sublistWidth) > (viewport.width - DomHandler.calculateScrollbarWidth())) {
            submenuRef.current.style.left = -1 * sublistWidth + 'px';
        }
        else {
            submenuRef.current.style.left = itemOuterWidth + 'px';
        }
    }

    const onEnter = () => {
        position();
    }

    const isActive = () => {
        return props.root || !props.resetMenu;
    }

    useUpdateEffect(() => {
        if (props.resetMenu === true) {
            setActiveItem(null);
        }
    }, [props.resetMenu])

    useUpdateEffect(() => {
        if (isActive()) {
            position();
        }
    })

    const useSeparator = (index) => {
        return (
            <li key={'separator_' + index} className="p-menu-separator" role="separator"></li>
        );
    }

    const useSubmenu = (item) => {
        if (item.items) {
            return (
                <ContextMenuSub model={item.items} resetMenu={item !== activeItem} onLeafClick={props.onLeafClick} />
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
            <a href={item.url || '#'} className={linkClassName} target={item.target} onClick={(event) => onItemClick(event, item, index)} role="menuitem"
                aria-haspopup={item.items != null} aria-disabled={item.disabled}>
                {icon}
                {label}
                {submenuIcon}
                <Ripple />
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
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li key={item.label + '_' + index} role="none" className={className} style={item.style} onMouseEnter={(event) => onItemMouseEnter(event, item)}>
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
    const active = isActive()

    return (
        <CSSTransition nodeRef={submenuRef} classNames="p-contextmenusub" in={active} timeout={{ enter: 0, exit: 0 }}
            unmountOnExit onEnter={onEnter}>
            <ul ref={submenuRef} className={className}>
                {submenu}
            </ul>
        </CSSTransition>
    );
}

export const ContextMenu = forwardRef((props, ref) => {

    const [visible, setVisible] = useState(false);
    const [reshow, setReshow] = useState(false);
    const [resetMenu, setResetMenu] = useState(false);
    const menuRef = useRef(null);
    const currentEvent = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (isOutsideClicked(event) && event.button !== 2) {
                hide(event);
                setResetMenu(true);
            }
        }
    });

    const [bindDocumentContextMenuListener, unbindDocumentContextMenuListener] = useEventListener({
        type: 'contextmenu', listener: event => {
            show(event);
        }
    });

    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: event => {
            if (visible && !DomHandler.isTouchDevice()) {
                hide(event);
            }
        }
    });


    const onMenuClick = () => {
        setResetMenu(false);
    }

    const onMenuMouseEnter = () => {
        setResetMenu(false)
    }

    const show = (event) => {
        if (!(event instanceof Event)) {
            event.persist();
        }

        event.stopPropagation();
        event.preventDefault();

        currentEvent.current = event;

        if (visible) {
            setReshow(true)
        }
        else {
            setVisible(true)
        }
    }

    const hide = (event) => {
        if (!(event instanceof Event)) {
            event.persist();
        }

        currentEvent.current = event;

        setVisible(false);
        setReshow(false);
    }

    useUpdateEffect(() => {
        if (props.onShow && visible) {
            props.onShow(currentEvent.current);
        }

        if (props.onHide && !visible && !reshow) {
            props.onHide(currentEvent.current);
        }
    },[visible,reshow])

    const onEnter = () => {
        if (props.autoZIndex) {
            ZIndexUtils.set('menu', menuRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['menu']);
        }

        position(currentEvent.current);
    }

    const onEntered = () => {
        bindDocumentListeners();
    }

    const onExit = () => {
        unbindDocumentListeners();
    }

    const onExited = () => {
        ZIndexUtils.clear(menuRef.current);
    }

    const position = (event) => {
        if (event) {
            let left = event.pageX + 1;
            let top = event.pageY + 1;
            let width = menuRef.current.offsetParent ? menuRef.current.offsetWidth : DomHandler.getHiddenElementOuterWidth(menuRef.current);
            let height = menuRef.current.offsetParent ? menuRef.current.offsetHeight : DomHandler.getHiddenElementOuterHeight(menuRef.current);
            let viewport = DomHandler.getViewport();

            //flip
            if (left + width - document.body.scrollLeft > viewport.width) {
                left -= width;
            }

            //flip
            if (top + height - document.body.scrollTop > viewport.height) {
                top -= height;
            }

            //fit
            if (left < document.body.scrollLeft) {
                left = document.body.scrollLeft;
            }

            //fit
            if (top < document.body.scrollTop) {
                top = document.body.scrollTop;
            }

            menuRef.current.style.left = left + 'px';
            menuRef.current.style.top = top + 'px';
        }
    }

    const onLeafClick = (event) => {
        setResetMenu(true)
        hide(event);

        event.stopPropagation();
    }

    const isOutsideClicked = (event) => {
        return menuRef && menuRef.current && !(menuRef.current.isSameNode(event.target) || menuRef.current.contains(event.target));
    }

    const bindDocumentListeners = () => {
        bindDocumentResizeListener();
        bindDocumentClickListener();
    }

    const unbindDocumentListeners = () => {
        unbindDocumentResizeListener();
        unbindDocumentClickListener();
    }

    useEffect(() => {
        if (props.global) {
            bindDocumentContextMenuListener();
        }

        return () => {
            unbindDocumentListeners();
            unbindDocumentContextMenuListener();

            ZIndexUtils.clear(menuRef.current);
        }
    }, []);

    useUpdateEffect(() => {
        if (visible && reshow) {
            setVisible(false);
            setReshow(false);
            setResetMenu(true);
        }
        else if (!visible && !reshow && resetMenu)  {
            show(currentEvent.current);
        }
    }, [reshow]);

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    const useContextMenu = () => {
        const className = classNames('p-contextmenu p-component', props.className);

        return (
            <CSSTransition nodeRef={menuRef} classNames="p-contextmenu" in={visible} timeout={{ enter: 250, exit: 0 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={menuRef} id={props.id} className={className} style={props.style} onClick={onMenuClick} onMouseEnter={onMenuMouseEnter}>
                    <ContextMenuSub model={props.model} root resetMenu={resetMenu} onLeafClick={onLeafClick} />
                </div>
            </CSSTransition>
        );
    }

    const element = useContextMenu();

    return <Portal element={element} appendTo={props.appendTo} />;
})

ContextMenuSub.defaultProps = {
    model: null,
    root: false,
    className: null,
    resetMenu: false,
    onLeafClick: null
};

ContextMenuSub.propTypes = {
    model: PropTypes.any,
    root: PropTypes.bool,
    className: PropTypes.string,
    resetMenu: PropTypes.bool,
    onLeafClick: PropTypes.func
};

ContextMenu.defaultProps = {
    id: null,
    model: null,
    style: null,
    className: null,
    global: false,
    autoZIndex: true,
    baseZIndex: 0,
    appendTo: null,
    transitionOptions: null,
    onShow: null,
    onHide: null
};

ContextMenu.propTypes = {
    id: PropTypes.string,
    model: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    global: PropTypes.bool,
    autoZIndex: PropTypes.bool,
    baseZIndex: PropTypes.number,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func
};
