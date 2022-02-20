import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../button/Button';
import { DomHandler, ObjectUtils, classNames, UniqueComponentId, ZIndexUtils } from '../utils/Utils';
import { SplitButtonItem } from './SplitButtonItem';
import { SplitButtonPanel } from './SplitButtonPanel';
import { tip } from '../tooltip/Tooltip';
import { OverlayService } from '../overlayservice/OverlayService';
import PrimeReact from '../api/Api';
import { useEventListener } from '../hooks/useEventListener';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';

export const SplitButton = memo(forwardRef((props, ref) => {
    const [id, setId] = useState(props.id);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const elementRef = useRef(null);
    const defaultButtonRef = useRef(null);
    const overlayRef = useRef(null);
    const tooltipRef = useRef(null);
    const [bindDocumentClick, unbindDocumentClick] = useEventListener({ type: 'click', listener: event => {
            if (overlayVisible && isOutsideClicked(event)) {
                hide();
            }
        }
    });
    const [bindOverlayScroll, unbindOverlayScroll] = useOverlayScrollListener({ target: elementRef, listener: () => {
            if (overlayVisible) {
                hide();
            }
        }
    });
    const [bindWindowResize, unbindWindowResize] = useEventListener({ target: 'window', type: 'resize', listener: () => {
            if (overlayVisible && !DomHandler.isTouchDevice()) {
                hide();
            }
        }
    });

    const onPanelClick = (event) => {
        OverlayService.emit('overlay-click', {
            originalEvent: event,
            target: elementRef.current
        });
    }

    const onDropdownButtonClick = () => {
        overlayVisible ? hide() : show();
    }

    const onItemClick = () => {
        hide();
    }

    const show = () => {
        setOverlayVisible(true);
    }

    const hide = () => {
        setOverlayVisible(false);
    }

    const onOverlayEnter = () => {
        ZIndexUtils.set('overlay', overlayRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        alignOverlay();
    }

    const onOverlayEntered = () => {
        bindDocumentClick();
        bindOverlayScroll();
        bindWindowResize();

        props.onShow && props.onShow();
    }

    const onOverlayExit = () => {
        unbindDocumentClick();
        unbindOverlayScroll();
        unbindWindowResize();
    }

    const onOverlayExited = () => {
        ZIndexUtils.clear(overlayRef.current);

        props.onHide && props.onHide();
    }

    const alignOverlay = () => {
        DomHandler.alignOverlay(overlayRef.current, defaultButtonRef.current.parentElement, props.appendTo || PrimeReact.appendTo);
    }

    const isOutsideClicked = (event) => {
        return elementRef.current && (overlayRef.current && !overlayRef.current.contains(event.target));
    }

    useEffect(() => {
        if (!id) {
            setId(UniqueComponentId());
        }

        return () => {
            ZIndexUtils.clear(overlayRef.current);
        }
    }, []);

    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.update({ content: props.tooltip, ...(props.tooltipOptions || {}) });
        }
        else if (props.tooltip) {
            tooltipRef.current = tip({
                target: elementRef.current,
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

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    const useItems = () => {
        if (props.model) {
            return props.model.map((menuitem, index) => {
                return <SplitButtonItem menuitem={menuitem} key={index} onItemClick={onItemClick} />
            });
        }

        return null;
    }

    const className = classNames('p-splitbutton p-component', props.className, { 'p-disabled': props.disabled });
    const buttonClassName = classNames('p-splitbutton-defaultbutton', props.buttonClassName);
    const menuButtonClassName = classNames('p-splitbutton-menubutton', props.menuButtonClassName);
    const panelId = id + '_overlay';
    const items = useItems();
    const buttonContent = props.buttonTemplate ? ObjectUtils.getJSXElement(props.buttonTemplate, props) : null;

    return (
        <div id={id} className={className} style={props.style} ref={elementRef}>
            <Button ref={defaultButtonRef} type="button" className={buttonClassName} icon={props.icon} label={props.label} onClick={props.onClick} disabled={props.disabled} tabIndex={props.tabIndex}>
                {buttonContent}
            </Button>
            <Button type="button" className={menuButtonClassName} icon={props.dropdownIcon} onClick={onDropdownButtonClick} disabled={props.disabled}
                aria-expanded={overlayVisible} aria-haspopup aria-owns={panelId} />
            <SplitButtonPanel ref={overlayRef} appendTo={props.appendTo} id={panelId} menuStyle={props.menuStyle} menuClassName={props.menuClassName} onClick={onPanelClick}
                in={overlayVisible} onEnter={onOverlayEnter} onEntered={onOverlayEntered} onExit={onOverlayExit} onExited={onOverlayExited} transitionOptions={props.transitionOptions}>
                {items}
            </SplitButtonPanel>
        </div>
    )
}))

SplitButton.defaultProps = {
    id: null,
    label: null,
    icon: null,
    model: null,
    disabled: null,
    style: null,
    className: null,
    buttonClassName: null,
    menuStyle: null,
    menuClassName: null,
    menuButtonClassName: null,
    tabIndex: null,
    appendTo: null,
    tooltip: null,
    tooltipOptions: null,
    buttonTemplate: null,
    transitionOptions: null,
    dropdownIcon: 'pi pi-chevron-down',
    onClick: null,
    onShow: null,
    onHide: null
}

SplitButton.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.any,
    model: PropTypes.array,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    menuStyle: PropTypes.object,
    menuClassName: PropTypes.string,
    menuButtonClassName: PropTypes.string,
    tabIndex: PropTypes.number,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    buttonTemplate: PropTypes.any,
    transitionOptions: PropTypes.object,
    dropdownIcon: PropTypes.any,
    onClick: PropTypes.func,
    onShow: PropTypes.func,
    onHide: PropTypes.func
}
