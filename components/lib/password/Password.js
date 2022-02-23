import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { tip } from '../tooltip/Tooltip';
import { InputText } from '../inputtext/InputText';
import { CSSTransition } from '../csstransition/CSSTransition';
import PrimeReact, { localeOption } from '../api/Api';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';
import { useResizeListener } from '../hooks/useResizeListener';

export const Password = memo((props) => {
    const promptLabel = () => props.promptLabel || localeOption('passwordPrompt');
    const weakLabel = () => props.weakLabel || localeOption('weak');
    const mediumLabel = () => props.mediumLabel || localeOption('medium');
    const strongLabel = () => props.strongLabel || localeOption('strong');

    const [overlayVisible, setOverlayVisible] = useState(false);
    const [meter, setMeter] = useState(null);
    const [infoText, setInfoText] = useState(promptLabel);
    const [focused, setFocused] = useState(false);
    const [unmasked, setUnmasked] = useState(false);
    const elementRef = useRef(null);
    const overlayRef = useRef(null);
    const inputRef = useRef(props.inputRef);
    const tooltipRef = useRef(null);
    const mediumCheckRegExp = useRef(new RegExp(props.mediumRegex));
    const strongCheckRegExp = useRef(new RegExp(props.strongRegex));
    const type = unmasked ? 'text' : 'password';

    const [bindOverlayScroll, unbindOverlayScroll] = useOverlayScrollListener({ target: elementRef, listener: () => {
        overlayVisible && hide();
    }});
    const [bindWindowResize, unbindWindowResize] = useResizeListener({ listener: () => {
        if (overlayVisible && !DomHandler.isTouchDevice()) {
            hide();
        }
    }});

    const isFilled = useMemo(() => (
        ObjectUtils.isNotEmpty(props.value) || ObjectUtils.isNotEmpty(props.defaultValue) || (inputRef.current && ObjectUtils.isNotEmpty(inputRef.current.value))
    ), [props.value, props.defaultValue, inputRef]);

    const updateLabels = () => {
        if (meter) {
            let label = null;
            switch (meter.strength) {
                case 'weak':
                    label = weakLabel();
                    break;

                case 'medium':
                    label = mediumLabel();
                    break;

                case 'strong':
                    label = strongLabel();
                    break;

                default:
                    break;
            }

            if (label && infoText !== label) {
                setInfoText(label);
            }
        }
        else {
            const _promptLabel = promptLabel();
            if (infoText !== _promptLabel) {
                setInfoText(_promptLabel);
            }
        }
    }

    const onPanelClick = (event) => {
        if (props.feedback) {
            OverlayService.emit('overlay-click', {
                originalEvent: event,
                target: elementRef.current
            });
        }
    }

    const onMaskToggle = () => {
        setUnmasked((prevState) => !prevState);
    }

    const show = () => {
        updateLabels();
        setOverlayVisible(true);
    }

    const hide = () => {
        setOverlayVisible(false);
    }

    const alignOverlay = () => {
        if (inputRef.current) {
            DomHandler.alignOverlay(overlayRef.current, inputRef.current.parentElement, props.appendTo || PrimeReact.appendTo);
        }
    }

    const onOverlayEnter = () => {
        ZIndexUtils.set('overlay', overlayRef.current,  PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        alignOverlay();
    }

    const onOverlayEntered = () => {
        bindOverlayScroll();
        bindWindowResize();

        props.onShow && props.onShow();
    }

    const onOverlayExit = () => {
        unbindOverlayScroll();
        unbindWindowResize();
    }

    const onOverlayExited = () => {
        ZIndexUtils.clear(overlayRef.current);

        props.onHide && props.onHide();
    }

    const onFocus = (event) => {
        setFocused(true);

        if (props.feedback) {
            show();
        }

        props.onFocus && props.onFocus(event);
    }

    const onBlur = (event) => {
        setFocused(false);

        if (props.feedback) {
            hide();
        }

        props.onBlur && props.onBlur(event);
    }

    const onKeyup = (e) => {
        let keyCode = e.keyCode || e.which;

        if (props.feedback) {
            let value = e.target.value;
            let label = null;
            let _meter = null;

            switch (testStrength(value)) {
                case 1:
                    label = weakLabel();
                    _meter = {
                        strength: 'weak',
                        width: '33.33%'
                    };
                    break;

                case 2:
                    label = mediumLabel();
                    _meter = {
                        strength: 'medium',
                        width: '66.66%'
                    };
                    break;

                case 3:
                    label = strongLabel();
                    _meter = {
                        strength: 'strong',
                        width: '100%'
                    };
                    break;

                default:
                    label = promptLabel();
                    _meter = null;
                    break;
            }

            setMeter(_meter);
            setInfoText(label);

            if (!!keyCode && !overlayVisible) {
                show();
            }
        }

        props.onKeyUp && props.onKeyUp(e);
    }

    const onInput = (event, validatePattern) => {
        if (props.onInput) {
            props.onInput(event, validatePattern);
        }

        if (!props.onChange) {
            ObjectUtils.isNotEmpty(event.target.value) ?
                DomHandler.addClass(elementRef.current, 'p-inputwrapper-filled') :
                DomHandler.removeClass(elementRef.current, 'p-inputwrapper-filled');
        }
    }

    const testStrength = (str) => {
        if (strongCheckRegExp.current.test(str))
            return 3;
        else if (mediumCheckRegExp.current.test(str))
            return 2;
        else if (str.length)
            return 1;

        return 0;
    }

    useEffect(() => {
        ObjectUtils.combinedRefs(inputRef, props.inputRef);
    }, [inputRef]);

    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.update({ content: props.tooltip, ...(props.tooltipOptions || {}) });
        }
        else if (props.tooltip) {
            tooltipRef.current = tip({
                target: inputRef.current,
                content: props.tooltip,
                options: props.tooltipOptions
            });
        }

        return () => {
            if (tooltipRef.current) {
                tooltipRef.current.destroy();
                tooltipRef.current = null;
            }
        }
    }, [props.tooltip, props.tooltipOptions]);

    useEffect(() => {
        mediumCheckRegExp.current = new RegExp(props.mediumRegex);
    }, [props.mediumRegex]);

    useEffect(() => {
        strongCheckRegExp.current = new RegExp(props.strongRegex);
    }, [props.strongRegex]);

    useEffect(() => {
        if (!isFilled && DomHandler.hasClass(elementRef.current, 'p-inputwrapper-filled')) {
            DomHandler.removeClass(elementRef.current, 'p-inputwrapper-filled');
        }

        return () => {
            ZIndexUtils.clear(overlayRef.current);
        }
    }, [isFilled]);

    const useIcon = () => {
        if (props.toggleMask) {
            const iconClassName = unmasked ? 'pi pi-eye-slash' : 'pi pi-eye';
            let content = <i className={iconClassName} onClick={onMaskToggle} />

            if (props.icon) {
                const defaultIconOptions = {
                    onClick: onMaskToggle,
                    className: iconClassName,
                    element: content,
                    props: props
                };

                content = ObjectUtils.getJSXElement(props.icon, defaultIconOptions);
            }

            return content;
        }

        return null;
    }

    const usePanel = () => {
        const panelClassName = classNames('p-password-panel p-component', props.panelClassName);
        const { strength, width } = meter || { strength: '', width: '0%' };
        const header = ObjectUtils.getJSXElement(props.header, props);
        const footer = ObjectUtils.getJSXElement(props.footer, props);
        const content = props.content ? ObjectUtils.getJSXElement(props.content, props) : (
            <>
                <div className="p-password-meter">
                    <div className={`p-password-strength ${strength}`} style={{ width }}></div>
                </div>
                <div className="p-password-info">
                    {infoText}
                </div>
            </>
        );

        const panel = (
            <CSSTransition nodeRef={overlayRef} classNames="p-connected-overlay" in={overlayVisible} timeout={{ enter: 120, exit: 100 }} options={props.transitionOptions}
                unmountOnExit onEnter={onOverlayEnter} onEntered={onOverlayEntered} onExit={onOverlayExit} onExited={onOverlayExited}>
                <div ref={overlayRef} className={panelClassName} style={props.panelStyle} onClick={onPanelClick}>
                    {header}
                    {content}
                    {footer}
                </div>
            </CSSTransition>
        );

        return <Portal element={panel} appendTo={props.appendTo} />;
    }

    const className = classNames('p-password p-component p-inputwrapper', {
        'p-inputwrapper-filled': isFilled,
        'p-inputwrapper-focus': focused,
        'p-input-icon-right': props.toggleMask
    }, props.className);
    const inputClassName = classNames('p-password-input', props.inputClassName)

    const inputProps = ObjectUtils.findDiffKeys(props, Password.defaultProps);
    const icon = useIcon();
    const panel = usePanel();

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style}>
            <InputText ref={inputRef} id={props.inputId} {...inputProps} type={type} className={inputClassName} style={props.inputStyle}
                onFocus={onFocus} onBlur={onBlur} onKeyUp={onKeyup} onInput={onInput} />
            {icon}
            {panel}
        </div>
    )
})

Password.defaultProps = {
    id: null,
    inputId: null,
    inputRef: null,
    promptLabel: null,
    weakLabel: null,
    mediumLabel: null,
    strongLabel: null,
    mediumRegex: '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})',
    strongRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})',
    feedback: true,
    toggleMask: false,
    appendTo: null,
    header: null,
    content: null,
    footer: null,
    icon: null,
    tooltip: null,
    tooltipOptions: null,
    style: null,
    className: null,
    inputStyle: null,
    inputClassName: null,
    panelStyle: null,
    panelClassName: null,
    transitionOptions: null,
    onInput: null,
    onShow: null,
    onHide: null
}

Password.propTypes = {
    id: PropTypes.string,
    inputId: PropTypes.string,
    inputRef: PropTypes.any,
    promptLabel: PropTypes.string,
    weakLabel: PropTypes.string,
    mediumLabel: PropTypes.string,
    strongLabel:PropTypes.string,
    mediumRegex: PropTypes.string,
    strongRegex: PropTypes.string,
    feedback: PropTypes.bool,
    toggleMask: PropTypes.bool,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    header: PropTypes.any,
    content: PropTypes.any,
    footer: PropTypes.any,
    icon: PropTypes.any,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string,
    inputStyle: PropTypes.object,
    inputClassName: PropTypes.string,
    panelStyle: PropTypes.object,
    panelClassName: PropTypes.string,
    transitionOptions: PropTypes.object,
    onInput: PropTypes.func,
    onShow: PropTypes.func,
    onHide: PropTypes.func
}
