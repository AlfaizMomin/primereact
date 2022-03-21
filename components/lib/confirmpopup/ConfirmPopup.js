import React, { useRef, useState, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, ZIndexUtils, IconUtils } from '../utils/Utils';
import { Button } from '../button/Button';
import { CSSTransition } from '../csstransition/CSSTransition';
import PrimeReact, { localeOption } from '../api/Api';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import { useMountEffect, useUnmountEffect, useUpdateEffect, useResizeListener, useEventListener, useOverlayScrollListener } from '../hooks/Hooks';

export function confirmPopup(props) {
    let appendTo = props.appendTo || document.body;

    let confirmPopupWrapper = document.createDocumentFragment();
    DomHandler.appendChild(confirmPopupWrapper, appendTo);

    props = {...props, ...{visible: props.visible === undefined ? true : props.visible}};

    let confirmPopupEl = React.createElement(ConfirmPopup, props);
    ReactDOM.render(confirmPopupEl, confirmPopupWrapper);

    let updateConfirmPopup = (newProps) => {
        props = { ...props, ...newProps };
        ReactDOM.render(React.cloneElement(confirmPopupEl, props), confirmPopupWrapper);
    };

    return {
        _destroy: () => {
            ReactDOM.unmountComponentAtNode(confirmPopupWrapper);
        },
        show: () => {
            updateConfirmPopup({ visible: true, onHide: () => {
                updateConfirmPopup({ visible: false }); // reset
            }});
        },
        hide: () => {
            updateConfirmPopup({ visible: false });
        },
        update: (newProps) => {
            updateConfirmPopup(newProps);
        }
    }
}

export const ConfirmPopup = (props) => {

    const [visible, setVisible] = useState(false);
    const isPanelClicked = useRef(false);
    const overlayRef = useRef(null);
    const acceptBtnRef = useRef(null);
    const overlayEventListener = useRef(null);
    const currentResult = useRef('');

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

    const [bindScrollListener, unbindScrollListener] = useOverlayScrollListener({target: props.target, listener: (event) => {
        if (visible) {
            hide(event);
        }
    }});

    const acceptLabel = () => {
        return props.acceptLabel || localeOption('accept');
    }

    const rejectLabel = () => {
        return props.rejectLabel || localeOption('reject');
    }

    const isOutsideClicked = (target) => {
        return overlayRef && overlayRef.current && !(overlayRef.current.isSameNode(target) || overlayRef.current.contains(target));
    }

    const onCloseClick = (event) => {
        hide();

        event.preventDefault();
    }

    const onPanelClick = (event) => {
        isPanelClicked.current = true;

        OverlayService.emit('overlay-click', {
            originalEvent: event,
            target: props.target
        });
    }

    const accept = () => {
        if (props.accept) {
            props.accept();
        }

        hide('accept');
    }

    const reject = () => {
        if (props.reject) {
            props.reject();
        }

        hide('reject');
    }

    const show = () => {
        setVisible(true);
    }

    const hide = (result) => {
        currentResult.current = result;
        setVisible(false);
    }

    const onEnter = () => {
        ZIndexUtils.set('overlay', overlayRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        align();
    }

    const onEntered = () => {
        bindDocumentClickListener();
        bindScrollListener();
        bindResizeListener();

        if (acceptBtnRef && acceptBtnRef.current) {
            acceptBtnRef.current.focus();
        }

        props.onShow && props.onShow();
    }

    const onExit = () => {
        unbindDocumentClickListener();
        unbindScrollListener();
        unbindResizeListener();
    }

    const onExited = () => {
        ZIndexUtils.clear(overlayRef.current);
    }

    const align = () => {
        if (props.target) {
            DomHandler.absolutePosition(overlayRef.current, props.target);

            const containerOffset = DomHandler.getOffset(overlayRef.current);
            const targetOffset = DomHandler.getOffset(props.target);
            let arrowLeft = 0;

            if (containerOffset.left < targetOffset.left) {
                arrowLeft = targetOffset.left - containerOffset.left;
            }
            overlayRef.current.style.setProperty('--overlayArrowLeft', `${arrowLeft}px`);

            if (containerOffset.top < targetOffset.top) {
                DomHandler.addClass(overlayRef.current, 'p-confirm-popup-flipped');
            }
        }
    }

    useMountEffect(() => {
        if (props.visible) {
            setVisible(true);
        }
    });


    useUpdateEffect(() => {
        if (visible) {
            overlayEventListener.current = (e) => {
                if (!isOutsideClicked(e.target)) {
                    isPanelClicked = true;
                }
            };

            OverlayService.on('overlay-click', overlayEventListener.current);
        }
        else {
            OverlayService.off('overlay-click', overlayEventListener.current);
            overlayEventListener.current = null;

            if (props.onHide) {
                props.onHide(currentResult.current);
            }
        }
    }, [visible]);

    useUpdateEffect(() => {
        if (props.visible)
            setVisible(true);
        else
            setVisible(false);
    }, [props.visible]);

    useUnmountEffect(() => {
        unbindDocumentClickListener();
        unbindResizeListener();
        unbindScrollListener();

        if (overlayEventListener.current) {
            OverlayService.off('overlay-click', overlayEventListener.current);
            overlayEventListener.current = null;
        }

        ZIndexUtils.clear(overlayRef.current);
    });

    const useContent = () => {
        const message = ObjectUtils.getJSXElement(props.message, props);

        return (
            <div className="p-confirm-popup-content">
                {IconUtils.getJSXIcon(props.icon, { className: 'p-confirm-popup-icon' }, { props: props })}
                <span className="p-confirm-popup-message">{message}</span>
            </div>
        );
    }

    const useFooter = () => {
        const acceptClassName = classNames('p-confirm-popup-accept p-button-sm', props.acceptClassName);
        const rejectClassName = classNames('p-confirm-popup-reject p-button-sm', {
            'p-button-text': !props.rejectClassName
        }, props.rejectClassName);

        const content = (
            <div className="p-confirm-popup-footer">
                <Button label={rejectLabel()} icon={props.rejectIcon} className={rejectClassName} onClick={reject} />
                <Button ref={acceptBtnRef} label={acceptLabel()} icon={props.acceptIcon} className={acceptClassName} onClick={accept} />
            </div>
        )

        if (props.footer) {
            const defaultContentOptions = {
                accept: accept,
                reject: reject,
                className: 'p-confirm-popup-footer',
                acceptClassName,
                rejectClassName,
                acceptLabel: acceptLabel(),
                rejectLabel: rejectLabel(),
                element: content,
                props: props
            };

            return ObjectUtils.getJSXElement(props.footer, defaultContentOptions);
        }

        return content;
    }

    const useElement = () => {
        const className = classNames('p-confirm-popup p-component', props.className);
        const content = useContent();
        const footer = useFooter();

        return (
            <CSSTransition nodeRef={overlayRef} classNames="p-connected-overlay" in={visible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExit={onExit} onExited={onExited}>
                <div ref={overlayRef} id={props.id} className={className} style={props.style} onClick={onPanelClick}>
                    {content}
                    {footer}
                </div>
            </CSSTransition>
        );
    }

    let element = useElement();

    return <Portal element={element} appendTo={props.appendTo} visible={props.visible} />;
}

ConfirmPopup.defaultProps = {
    __TYPE: 'ConfirmPopup',
    target: null,
    visible: false,
    message: null,
    rejectLabel: null,
    acceptLabel: null,
    icon: null,
    rejectIcon: null,
    acceptIcon: null,
    rejectClassName: null,
    acceptClassName: null,
    className: null,
    style: null,
    appendTo: null,
    dismissable: true,
    footer: null,
    onShow: null,
    onHide: null,
    accept: null,
    reject: null,
    transitionOptions: null
}

ConfirmPopup.propTypes = {
    __TYPE: PropTypes.string,
    target: PropTypes.any,
    visible: PropTypes.bool,
    message: PropTypes.any,
    rejectLabel: PropTypes.string,
    acceptLabel: PropTypes.string,
    icon: PropTypes.any,
    rejectIcon: PropTypes.any,
    acceptIcon: PropTypes.any,
    rejectClassName: PropTypes.string,
    acceptClassName: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    dismissable: PropTypes.bool,
    footer: PropTypes.any,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    accept: PropTypes.func,
    reject: PropTypes.func,
    transitionOptions: PropTypes.object
}
