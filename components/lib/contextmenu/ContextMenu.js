import React, { useRef, forwardRef, useState, useImperativeHandle, memo } from 'react';
import PropTypes from 'prop-types';
import PrimeReact from '../api/Api';
import { Ripple } from '../ripple/Ripple';
import { Portal } from '../portal/Portal';
import { CSSTransition } from '../csstransition/CSSTransition';
import { DomHandler, ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { useMountEffect, useUnmountEffect, useUpdateEffect, useEventListener, useResizeListener } from '../hooks/Hooks';

const ContextMenuSub = memo((props) => {
    const [activeItemState, setActiveItemState] = useState(null);
    const submenuRef = useRef(null);
    const active = props.root || !props.resetMenu;

    if (props.resetMenu === true && activeItemState !== null) {
        setActiveItemState(null);
    }

    const onItemMouseEnter = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        setActiveItemState(item);
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

    useUpdateEffect(() => {
        active && position();
    });

    const useSeparator = (index) => {
        return <li key={'separator_' + index} className="p-menu-separator" role="separator"></li>
    }

    const useSubmenu = (item) => {
        if (item.items) {
            return <ContextMenuSub model={item.items} resetMenu={item !== activeItemState} onLeafClick={props.onLeafClick} />
        }

        return null;
    }

    const useMenuItem = (item, index) => {
        const active = activeItemState === item;
        const key = item.label + '_' + index;
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
                props,
                active
            };

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li key={key} role="none" className={className} style={item.style} onMouseEnter={(event) => onItemMouseEnter(event, item)}>
                {content}
                {submenu}
            </li>
        )
    }

    const useItem = (item, index) => {
        return item.separator ? useSeparator(index) : useMenuItem(item, index);
    }

    const useMenu = () => {
        return props.model ? props.model.map(useItem) : null;
    }

    const className = classNames({
        'p-submenu-list': !props.root
    });
    const submenu = useMenu();

    return (
        <CSSTransition nodeRef={submenuRef} classNames="p-contextmenusub" in={active} timeout={{ enter: 0, exit: 0 }} unmountOnExit onEnter={onEnter}>
            <ul ref={submenuRef} className={className}>
                {submenu}
            </ul>
        </CSSTransition>
    )
});

export const ContextMenu = memo(forwardRef((props, ref) => {
    const [visibleState, setVisibleState] = useState(false);
    const [reshowState, setReshowState] = useState(false);
    const [resetMenuState, setResetMenuState] = useState(false);
    const menuRef = useRef(null);
    const currentEvent = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (isOutsideClicked(event) && event.button !== 2) {
                hide(event);
                setResetMenuState(true);
            }
        }
    });

    const [bindDocumentContextMenuListener, ] = useEventListener({
        type: 'contextmenu', listener: event => {
            show(event);
        }
    });

    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: event => {
            if (visibleState && !DomHandler.isTouchDevice()) {
                hide(event);
            }
        }
    });

    const onMenuClick = () => {
        setResetMenuState(false);
    }

    const onMenuMouseEnter = () => {
        setResetMenuState(false);
    }

    const show = (event) => {
        event.stopPropagation();
        event.preventDefault();

        currentEvent.current = event;

        if (visibleState) {
            setReshowState(true);
        }
        else {
            setVisibleState(true);
            props.onShow && props.onShow(currentEvent.current);
        }
    }

    const hide = (event) => {
        currentEvent.current = event;

        setVisibleState(false);
        setReshowState(false);
        props.onHide && props.onHide(currentEvent.current);
    }

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
        ZIndexUtils.clear(menuRef.current);
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
        setResetMenuState(true);
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

    useMountEffect(() => {
        if (props.global) {
            bindDocumentContextMenuListener();
        }
    });

    useUpdateEffect(() => {
        if (visibleState) {
            setVisibleState(false);
            setReshowState(false);
            setResetMenuState(true);
        }
        else if (!reshowState) {
            show(currentEvent.current);
        }
    }, [reshowState, props.model]);

    useUnmountEffect(() => {
        ZIndexUtils.clear(menuRef.current);
    });

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    const useContextMenu = () => {
        const className = classNames('p-contextmenu p-component', props.className);

        return (
            <CSSTransition nodeRef={menuRef} classNames="p-contextmenu" in={visibleState} timeout={{ enter: 250, exit: 0 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={menuRef} id={props.id} className={className} style={props.style} onClick={onMenuClick} onMouseEnter={onMenuMouseEnter}>
                    <ContextMenuSub model={props.model} root resetMenu={resetMenuState} onLeafClick={onLeafClick} />
                </div>
            </CSSTransition>
        )
    }

    const element = useContextMenu();

    return <Portal element={element} appendTo={props.appendTo} />
}));

ContextMenu.defaultProps = {
    __TYPE: 'ContextMenu',
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
}

ContextMenu.propTypes = {
    __TYPE: PropTypes.string,
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
}
