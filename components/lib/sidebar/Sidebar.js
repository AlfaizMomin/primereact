import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useMountEffect, useUpdateEffect, useEventListener } from '../hooks/Hooks';

export const Sidebar = (props) => {
    const [maskVisible, setMaskVisible] = useState(props.visible);
    const [visible, setVisible] = useState(props.visible);
    const sidebarRef = useRef(null);
    const maskRef = useRef(null);
    const closeIconRef = useRef(null);

    const [bindDocumentEscapeListener, unbindDocumentEscapeListener] = useEventListener({ type: 'keydown', listener: event => {
        if (event.which === 27) {
            if (ZIndexUtils.get(maskRef.current) === ZIndexUtils.getCurrent('modal', PrimeReact.autoZIndex)) {
                onClose(event);
            }
        }
    }});

    const getPositionClass = () => {
        const positions = ['left', 'right', 'top', 'bottom'];
        const pos = positions.find(item => item === props.position);

        return pos ? `p-sidebar-${pos}` : '';
    }

    const focus = () => {
        let activeElement = document.activeElement;
        let isActiveElementInDialog = activeElement && sidebarRef && sidebarRef.current.contains(activeElement);
        if (!isActiveElementInDialog && props.showCloseIcon) {
            closeIconRef.current.focus();
        }
    }

    const onMaskClick = (event) => {
        if (props.dismissable && props.modal && maskRef.current === event.target) {
            onClose(event);
        }
    }

    const onClose = (event) => {
        props.onHide();
        event.preventDefault();
    }

    const onEntered = () => {
        if (props.onShow) {
            props.onShow();
        }

        focus();

        enableDocumentSettings();
    }

    const onExiting = () => {
        if (props.modal) {
            DomHandler.addClass(maskRef.current, 'p-component-overlay-leave');
        }
    }

    const onExited = () => {
        ZIndexUtils.clear(maskRef.current);
        setMaskVisible(false);
        disableDocumentSettings();
    }

    const enableDocumentSettings = () => {
        bindGlobalListeners();

        if (props.blockScroll) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
        }
    }

    const disableDocumentSettings = () => {
        unbindGlobalListeners();

        if (props.blockScroll) {
            DomHandler.removeClass(document.body, 'p-overflow-hidden');
        }
    }

    const bindGlobalListeners = () => {
        if (props.closeOnEscape) {
            bindDocumentEscapeListener();
        }
    }

    const unbindGlobalListeners = () => {
        unbindDocumentEscapeListener();
    }

    useMountEffect(() => {
        if (props.visible) {
            setVisible(true);
            setMaskVisible(true);
        }

        return () => {
            disableDocumentSettings();
            maskRef.current && ZIndexUtils.clear(maskRef.current);
        }
    });

    useUpdateEffect(() => {
        if (props.visible)
            setMaskVisible(true);
        else
            setVisible(false);
    }, [props.visible]);

    useUpdateEffect(() => {
        if (maskVisible) {
            setVisible(true);
            ZIndexUtils.set('modal', maskRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex['modal']);
        }
    }, [maskVisible]);

    const useCloseIcon = () => {
        if (props.showCloseIcon) {
            return (
                <button type="button" ref={closeIconRef} className="p-sidebar-close p-sidebar-icon p-link" onClick={onClose} aria-label={props.ariaCloseLabel}>
                    <span className="p-sidebar-close-icon pi pi-times" />
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useIcons = () => {
        if (props.icons) {
            return ObjectUtils.getJSXElement(props.icons, props);
        }

        return null;
    }

    const useElement = () => {
        const className = classNames('p-sidebar p-component', props.className);
        const maskClassName = classNames('p-sidebar-mask', {
            'p-component-overlay p-component-overlay-enter': props.modal,
            'p-sidebar-mask-scrollblocker': props.blockScroll,
            'p-sidebar-visible': maskVisible,
            'p-sidebar-full': props.fullScreen
        }, props.maskClassName, getPositionClass());

        const closeIcon = useCloseIcon();
        const icons = useIcons();

        const transitionTimeout = {
            enter: props.fullScreen ? 150 : 300,
            exit: props.fullScreen ? 150 : 300
        };

        return (
            <div ref={maskRef} style={props.maskStyle} className={maskClassName} onClick={onMaskClick}>
                <CSSTransition nodeRef={sidebarRef} classNames="p-sidebar" in={visible} timeout={transitionTimeout} options={props.transitionOptions}
                    unmountOnExit onEntered={onEntered} onExiting={onExiting} onExited={onExited}>
                    <div ref={sidebarRef} id={props.id} className={className} style={props.style} role="complementary">
                        <div className="p-sidebar-header">
                            {icons}
                            {closeIcon}
                        </div>
                        <div className="p-sidebar-content">
                            {props.children}
                        </div>
                    </div>
                </CSSTransition>
            </div>
        );
    }

    const useSidebar = () => {
        const element = useElement();

        return <Portal element={element} appendTo={props.appendTo} visible />;
    }

    return maskVisible && useSidebar();
}

Sidebar.defaultProps = {
    __TYPE: 'Sidebar',
    id: null,
    style: null,
    className: null,
    maskStyle: null,
    maskClassName: null,
    visible: false,
    position: 'left',
    fullScreen: false,
    blockScroll: false,
    baseZIndex: 0,
    dismissable: true,
    showCloseIcon: true,
    ariaCloseLabel: 'close',
    closeOnEscape: true,
    icons: null,
    modal: true,
    appendTo: null,
    transitionOptions: null,
    onShow: null,
    onHide: null
};

Sidebar.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    maskStyle: PropTypes.object,
    maskClassName: PropTypes.string,
    visible: PropTypes.bool,
    position: PropTypes.string,
    fullScreen: PropTypes.bool,
    blockScroll: PropTypes.bool,
    baseZIndex: PropTypes.number,
    dismissable: PropTypes.bool,
    showCloseIcon: PropTypes.bool,
    ariaCloseLabel: PropTypes.string,
    closeOnEscape: PropTypes.bool,
    icons: PropTypes.any,
    modal: PropTypes.bool,
    appendTo: PropTypes.any,
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func.isRequired
};
