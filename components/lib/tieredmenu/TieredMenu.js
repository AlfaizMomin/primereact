import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, classNames, ZIndexUtils } from '../utils/Utils';
import { TieredMenuSub } from './TieredMenuSub';
import { CSSTransition } from '../csstransition/CSSTransition';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useEventListener } from '../hooks/useEventListener';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';
import { useResizeListener } from '../hooks/useResizeListener';
import { useUnmountEffect } from '../hooks/useUnmountEffect';

export const TieredMenu = forwardRef((props, ref) => {

    const [visible, setVisible] = useState(!props.popup)
    const menuRef = useRef(null)
    const currentEvent = useRef(null);
    const target = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (props.popup && visible && menuRef.current && !menuRef.current.contains(event.target)) {
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

    const [bindResizeListener, unbindResizeListener] = useResizeListener({
        listener: event => {
            if (visible && !DomHandler.isTouchDevice()) {
                hide(event);
            }
        }
    });

    useUnmountEffect(() => {
        unbindDocumentListeners();
        unbindScrollListener();

        ZIndexUtils.clear(menuRef.current);
    })

    const onPanelClick = (event) => {
        if (props.popup) {
            OverlayService.emit('overlay-click', {
                originalEvent: event,
                target: target.current
            });
        }
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
            props.onShow(currentEvent.current);
        }

        if (!visible && props.onHide) {
            props.onShow(currentEvent.current);
        }
    }, [visible])

    const onEnter = () => {
        if (props.autoZIndex) {
            ZIndexUtils.set('menu', menuRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['menu']);
        }
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

    useImperativeHandle(ref, () => ({
        toggle,
        show,
        hide
    }));

    const useElement = () => {
        const className = classNames('p-tieredmenu p-component', { 'p-tieredmenu-overlay': props.popup }, props.className);

        return (
            <CSSTransition nodeRef={menuRef} classNames="p-connected-overlay" in={visible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={menuRef} id={props.id} className={className} style={props.style} onClick={onPanelClick}>
                    <TieredMenuSub model={props.model} root popup={props.popup} />
                </div>
            </CSSTransition>
        );
    }

    const element = useElement();

    return props.popup ? <Portal element={element} appendTo={props.appendTo} /> : element;
})


TieredMenu.defaultProps = {
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

TieredMenu.propTypes = {
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
