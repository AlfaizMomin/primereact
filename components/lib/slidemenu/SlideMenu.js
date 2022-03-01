import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, ZIndexUtils } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useUpdateEffect } from '../hooks/useUpdateEffect';
import { useUnmountEffect } from '../hooks/useUnmountEffect';
import { useEventListener } from '../hooks/useEventListener';
import { useResizeListener } from '../hooks/useResizeListener';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';

export const SlideMenuSub = (props) => {

    const [activeItem, setActiveItem] = useState(null);

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

        if (item.items) {
            setActiveItem(item)
            props.onForward();
        }
    }

    const useSeparator = (index) => {
        return (
            <li key={'separator_' + index} className="p-menu-separator"></li>
        );
    }

    const useSubmenu = (item) => {
        if (item.items) {
            return (
                <SlideMenuSub model={item.items} index={props.index + 1} menuWidth={props.menuWidth} effectDuration={props.effectDuration}
                    onForward={props.onForward} parentActive={item === activeItem} />
            );
        }

        return null;
    }

    const useMenuitem = (item, index) => {
        const active = activeItem === item;
        const className = classNames('p-menuitem', { 'p-menuitem-active': active, 'p-disabled': item.disabled }, item.className);
        const iconClassName = classNames('p-menuitem-icon', item.icon);
        const submenuIconClassName = 'p-submenu-icon pi pi-fw pi-angle-right';
        const icon = item.icon && <span className={iconClassName}></span>;
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        const submenuIcon = item.items && <span className={submenuIconClassName}></span>;
        const submenu = useSubmenu(item);
        let content = (
            <a href={item.url || '#'} className="p-menuitem-link" target={item.target} onClick={(event) => onItemClick(event, item, index)} aria-disabled={item.disabled}>
                {icon}
                {label}
                {submenuIcon}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => onItemClick(event, item, index),
                className: 'p-menuitem-link',
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
            <li key={item.label + '_' + index} className={className} style={item.style}>
                {content}
                {submenu}
            </li>
        );
    }

    const useItem = (item, index) => {
        if (item.separator)
            return useSeparator(index);
        else
            return useMenuitem(item, index);
    }

    const useItems = () => {
        if (props.model) {
            return (
                props.model.map((item, index) => {
                    return useItem(item, index);
                })
            );
        }

        return null;
    }

    const className = classNames({ 'p-slidemenu-rootlist': props.root, 'p-submenu-list': !props.root, 'p-active-submenu': props.parentActive });
    const style = {
        width: props.menuWidth + 'px',
        left: props.root ? (-1 * props.level * props.menuWidth) + 'px' : props.menuWidth + 'px',
        transitionProperty: props.root ? 'left' : 'none',
        transitionDuration: props.effectDuration + 'ms',
        transitionTimingFunction: props.easing
    };
    const items = useItems();

    return (
        <ul className={className} style={style}>
            {items}
        </ul>
    );
}

export const SlideMenu = forwardRef((props, ref) => {

    const [level, setLevel] = useState(0);
    const [visible, setVisible] = useState(false);
    const menuRef = useRef(null);
    const target = useRef(null);
    const backward = useRef(null);
    const currentEvent = useRef(null);
    const slideMenuContent = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (visible && isOutsideClicked(event)) {
                hide(event);
            }
        }
    });

    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: event => {
            if (visible && !DomHandler.isTouchDevice()) {
                hide(event);
            }
        }
    });

    const [bindScrollListener, unbindScrollListener] = useOverlayScrollListener({
        target: target.current, listener: (event) => {
            if (visible) {
                hide(event);
            }
        }
    });

    const onPanelClick = (event) => {
        if (props.popup) {
            OverlayService.emit('overlay-click', {
                originalEvent: event,
                target: target.current
            });
        }
    }

    const navigateForward = () => {
        setLevel(prevProps => prevProps + 1)
    }

    const navigateBack = () => {
        setLevel(prevProps => prevProps - 1)

    }

    const useBackward = () => {
        const className = classNames('p-slidemenu-backward', { 'p-hidden': level === 0 });

        return (
            <div ref={backward} className={className} onClick={navigateBack}>
                <span className="p-slidemenu-backward-icon pi pi-fw pi-chevron-left"></span>
                <span>{props.backLabel}</span>
            </div>
        );
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
        currentEvent = event;

        setVisible(true);
    }

    const hide = (event) => {
        target.current = event.currentTarget;
        currentEvent = event;

        setVisible(false);
    }

    useEffect(() => {
        if (visible && props.onShow) {
            props.onShow(currentEvent);
        }

        if (!visible && props.onHide) {
            props.onHide(currentEvent);
        }

    },[visible])

    const onEnter = () => {
        if (props.autoZIndex) {
            ZIndexUtils.set('menu', menuRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['menu']);
        }
        DomHandler.absolutePosition(menuRef.current, target.current);
    }

    const onEntered = () => {
        bindDocumentClickListener();
        bindDocumentResizeListener();
        bindScrollListener();
    }

    const onExit = () => {
        target.current = null;
        unbindDocumentClickListener();
        unbindDocumentResizeListener();
        unbindScrollListener();
    }

    const onExited = () => {
        ZIndexUtils.clear(menuRef.current);

        setLevel(0)
    }

    const isOutsideClicked = (event) => {
        return menuRef && menuRef.current && !(menuRef.current.isSameNode(event.target) || menuRef.current.contains(event.target));
    }


    useUpdateEffect(() => {
        setLevel(0)
    }, [props.model])

    useUnmountEffect(() => {
        unbindDocumentClickListener();
        unbindDocumentResizeListener();

        ZIndexUtils.clear(menuRef.current);
    })

    useImperativeHandle(ref, () => ({
        toggle,
        show,
        hide
    }));

    const useElement = () => {
        const className = classNames('p-slidemenu p-component', { 'p-slidemenu-overlay': props.popup }, props.className);
        const backward = useBackward();

        return (
            <CSSTransition nodeRef={menuRef} classNames="p-connected-overlay" in={!props.popup || visible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={menuRef} id={props.id} className={className} style={props.style} onClick={onPanelClick}>
                    <div className="p-slidemenu-wrapper" style={{ height: props.viewportHeight + 'px' }}>
                        <div className="p-slidemenu-content" ref={slideMenuContent}>
                            <SlideMenuSub model={props.model} root index={0} menuWidth={props.menuWidth} effectDuration={props.effectDuration}
                                level={level} parentActive={level === 0} onForward={navigateForward} />
                        </div>
                        {backward}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    const element = useElement();

    return props.popup ? <Portal element={element} appendTo={props.appendTo} /> : element;
})

SlideMenuSub.defaultProps = {
    model: null,
    level: 0,
    easing: 'ease-out',
    effectDuration: 250,
    menuWidth: 190,
    parentActive: false,
    onForward: null
}

SlideMenuSub.propTypes = {
    model: PropTypes.any,
    level: PropTypes.number,
    easing: PropTypes.string,
    effectDuration: PropTypes.number,
    menuWidth: PropTypes.number,
    parentActive: PropTypes.bool,
    onForward: PropTypes.func
}

SlideMenu.defaultProps = {
    id: null,
    model: null,
    popup: false,
    style: null,
    className: null,
    easing: 'ease-out',
    effectDuration: 250,
    backLabel: 'Back',
    menuWidth: 190,
    viewportHeight: 175,
    autoZIndex: true,
    baseZIndex: 0,
    appendTo: null,
    transitionOptions: null,
    onShow: null,
    onHide: null
}

SlideMenu.propTypes = {
    id: PropTypes.string,
    model: PropTypes.array,
    popup: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    easing: PropTypes.string,
    effectDuration: PropTypes.number,
    backLabel: PropTypes.string,
    menuWidth: PropTypes.number,
    viewportHeight: PropTypes.number,
    autoZIndex: PropTypes.bool,
    baseZIndex: PropTypes.number,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func
}
