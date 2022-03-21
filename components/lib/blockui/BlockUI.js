import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, DomHandler, ObjectUtils, ZIndexUtils } from '../utils/Utils';
import { Portal } from '../portal/Portal';
import PrimeReact from '../api/Api';

export const BlockUI = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(props.blocked);
    const maskRef = useRef(null);

    const block = () => {
        setVisible(true);
    }

    const unblock = () => {
        const callback = () => {
            setVisible(false);

            props.fullScreen && DomHandler.removeClass(document.body, 'p-overflow-hidden');
            props.onUnblocked && props.onUnblocked();
        }

        if (maskRef.current) {
            DomHandler.addClass(maskRef.current, 'p-component-overlay-leave');
            maskRef.current.addEventListener('animationend', () => {
                ZIndexUtils.clear(maskRef.current);
                callback();
            });
        }
        else {
            callback();
        }
    }

    const onPortalMounted = () => {
        if (props.fullScreen) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
            document.activeElement.blur();
        }

        if (props.autoZIndex) {
            const key = props.fullScreen ? 'modal' : 'overlay';
            ZIndexUtils.set(key, maskRef.current, PrimeReact.autoZIndex, props.baseZIndex || PrimeReact.zIndex[key]);
        }

        props.onBlocked && props.onBlocked();
    }

    useEffect(() => {
        if (visible) {
            block();
        }

        return () => {
            if (props.fullScreen) {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }

            ZIndexUtils.clear(maskRef.current);
        }
    }, []);

    useEffect(() => {
        props.blocked ? block() : unblock();
    }, [props.blocked]);

    useImperativeHandle(ref, () => ({
        block,
        unblock
    }));

    const useMask = () => {
        if (visible) {
            const className = classNames('p-blockui p-component-overlay p-component-overlay-enter', {
                'p-blockui-document': props.fullScreen
            }, props.className);
            const content = props.template ? ObjectUtils.getJSXElement(props.template, props) : null;
            const mask = (
                <div ref={maskRef} className={className} style={props.style}>
                    {content}
                </div>
            );

            return (
                <Portal element={mask} appendTo={props.fullScreen ? document.body : 'self'} onMounted={onPortalMounted} />
            );
        }

        return null;
    }

    const mask = useMask();

    return (
        <div id={props.id} className="p-blockui-container">
            {props.children}
            {mask}
        </div>
    );
})

BlockUI.defaultProps = {
    __TYPE: 'BlockUI',
    id: null,
    blocked: false,
    fullScreen: false,
    baseZIndex: 0,
    autoZIndex: true,
    style: null,
    className: null,
    template: null,
    onBlocked: null,
    onUnblocked: null
}

BlockUI.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    blocked: PropTypes.bool,
    fullScreen: PropTypes.bool,
    baseZIndex: PropTypes.number,
    autoZIndex: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    template: PropTypes.any,
    onBlocked: PropTypes.func,
    onUnblocked: PropTypes.func
}
