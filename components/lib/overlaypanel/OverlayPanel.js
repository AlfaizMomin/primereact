import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ZIndexUtils, classNames, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';
import { useMountEffect, useUnmountEffect, useUpdateEffect, useResizeListener, useEventListener, useOverlayScrollListener } from '../hooks/Hooks';

export const OverlayPanel = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const attributeSelector = useRef(UniqueComponentId());
    const isPanelClicked = useRef(false);
    const overlayRef = useRef(null);
    const currentTarget = useRef(null);
    const styleElement = useRef(null);
    const overlayEventListener = useRef(null);

    const [bindResizeListener, unbindResizeListener] = useResizeListener({ listener: () => {
        if (visible) {
            hide();
        }
    }});

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({ type: 'click', listener: event => {
        if (!isPanelClicked.current && isOutsideClicked(event.target)) {
            hide();
        }

        isPanelClicked.current = false;
    }});

    const [bindScrollListener, unbindScrollListener] = useOverlayScrollListener({target: currentTarget.current, listener: () => {
        if (visible && !DomHandler.isTouchDevice()) {
            hide();
        }
    }});

    const isOutsideClicked = (target) => {
        return overlayRef && overlayRef.current && !(overlayRef.current.isSameNode(target) || overlayRef.current.contains(target));
    }

    const hasTargetChanged = (event, target) => {
        return currentTarget.current != null && currentTarget.current !== (target||event.currentTarget||event.target);
    }

    const onCloseClick = (event) => {
        hide();

        event.preventDefault();
    }

    const onPanelClick = (event) => {
        isPanelClicked.current = true;

        OverlayService.emit('overlay-click', {
            originalEvent: event,
            target: currentTarget.current
        });
    }

    const onContentClick = () => {
        isPanelClicked.current = true;
    }

    const toggle = (event, target) => {
        if (visible) {
            hide();

            if (hasTargetChanged(event, target)) {
                currentTarget.current = target||event.currentTarget||event.target;

                setTimeout(() => {
                    show(event, currentTarget.current);
                }, 200);
            }
        }
        else {
            show(event, target);
        }
    }

    const show = (event, target) => {
        currentTarget.current = target||event.currentTarget||event.target;

        if (visible) {
            align();
        }
        else {
            setVisible(true);
        }
    }

    const hide = () => {
        setVisible(false);
    }

    const onEnter = () => {
        ZIndexUtils.set('overlay', overlayRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        overlayRef.current.setAttribute(attributeSelector.current, '');
        align();
    }

    const onEntered = () => {
        bindDocumentClickListener();
        bindScrollListener();
        bindResizeListener();

        props.onShow && props.onShow();
    }

    const onExit = () => {
        unbindDocumentClickListener();
        unbindScrollListener();
        unbindResizeListener();
    }

    const onExited = () => {
        ZIndexUtils.clear(overlayRef.current);

        props.onHide && props.onHide();
    }

    const align = () => {
        if (currentTarget.current) {
            DomHandler.absolutePosition(overlayRef.current, currentTarget.current);

            const containerOffset = DomHandler.getOffset(overlayRef.current);
            const targetOffset = DomHandler.getOffset(currentTarget.current);
            let arrowLeft = 0;

            if (containerOffset.left < targetOffset.left) {
                arrowLeft = targetOffset.left - containerOffset.left;
            }
            overlayRef.current.style.setProperty('--overlayArrowLeft', `${arrowLeft}px`);

            if (containerOffset.top < targetOffset.top) {
                DomHandler.addClass(overlayRef.current, 'p-overlaypanel-flipped');
            }
        }
    }

    const createStyle = () => {
        if (!styleElement.current) {
            styleElement.current = DomHandler.createInlineStyle(PrimeReact.nonce);

            let innerHTML = '';
            for (let breakpoint in props.breakpoints) {
                innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-overlaypanel[${attributeSelector.current}] {
                            width: ${props.breakpoints[breakpoint]} !important;
                        }
                    }
                `
            }

            styleElement.innerHTML = innerHTML;
        }
    }

    useMountEffect(() => {
        if (props.breakpoints) {
            createStyle();
        }
    });

    useUpdateEffect(() => {
        if (visible) {
            overlayEventListener.current = (e) => {
                if (!isOutsideClicked(e.target)) {
                    isPanelClicked.current = true;
                }
            };

            OverlayService.on('overlay-click', overlayEventListener.current);
        }
        else {
            OverlayService.off('overlay-click', overlayEventListener.current);
            overlayEventListener.current = null;
        }

    }, [visible]);

    useUnmountEffect(() => {
        unbindDocumentClickListener();
        unbindResizeListener();

        styleElement.current = DomHandler.removeInlineStyle(styleElement.current);

        if (overlayEventListener.current) {
            OverlayService.off('overlay-click', overlayEventListener.current);
            overlayEventListener.current = null;
        }

        ZIndexUtils.clear(overlayRef.current);
    });

    useImperativeHandle(ref, () => ({
        toggle,
        show,
        hide
    }));

    const useCloseIcon = () => {
        if(props.showCloseIcon) {
            return (
                <button type="button" className="p-overlaypanel-close p-link" onClick={onCloseClick} aria-label={props.ariaCloseLabel}>
                    <span className="p-overlaypanel-close-icon pi pi-times"></span>
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useElement = () => {
        let className = classNames('p-overlaypanel p-component', props.className);
        let closeIcon = useCloseIcon();

        return (
            <CSSTransition nodeRef={overlayRef} classNames="p-overlaypanel" in={visible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={overlayRef} id={props.id} className={className} style={props.style} onClick={onPanelClick}>
                    <div className="p-overlaypanel-content" onClick={onContentClick} onMouseDown={onContentClick}>
                        {props.children}
                    </div>
                    {closeIcon}
                </div>
            </CSSTransition>
        );
    }

    let element = useElement();

    return <Portal element={element} appendTo={props.appendTo} />;

})

OverlayPanel.defaultProps = {
    id: null,
    dismissable: true,
    showCloseIcon: false,
    style: null,
    className: null,
    appendTo: null,
    breakpoints: null,
    ariaCloseLabel: 'close',
    transitionOptions: null,
    onShow: null,
    onHide: null
}

OverlayPanel.propTypes = {
    id: PropTypes.string,
    dismissable: PropTypes.bool,
    showCloseIcon: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    breakpoints: PropTypes.object,
    ariaCloseLabel: PropTypes.string,
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func
}
