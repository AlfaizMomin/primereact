import React, { useRef, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, classNames, ZIndexUtils, IconUtils } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';
import PrimeReact from '../api/Api';
import { useMountEffect, useUnmountEffect } from '../hooks/Hooks';

export const ScrollTop = forwardRef((props, ref) => {

    const [visible, setVisible] = useState(false);
    const scrollElementRef = useRef(null);
    const helper = useRef(null);
    const scrollListener = useRef(null);

    const onClick = () => {
        let scrollElement = props.target === 'window' ? window : helper.current.parentElement;
        scrollElement.scroll({
            top: 0,
            behavior: props.behavior
        });
    }

    const checkVisibility = (scrollY) => {
        setVisible(scrollY > props.threshold)
    }

    const onEnter = () => {
        ZIndexUtils.set('overlay', scrollElementRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
    }

    const onEntered = () => {
        props.onShow && props.onShow();
    }

    const onExited = () => {
        ZIndexUtils.clear(scrollElementRef.current);

        props.onHide && props.onHide();
    }

    useMountEffect(() => {
        if (props.target === 'window')
        bindDocumentScrollListener();
        else if (props.target === 'parent')
            bindParentScrollListener();
    })

    useUnmountEffect(() => {
        if (props.target === 'window')
            unbindDocumentScrollListener();
        else if (props.target === 'parent')
            unbindParentScrollListener();

        ZIndexUtils.clear(scrollElementRef.current);
    });

    const bindParentScrollListener = () => {
        scrollListener.current = () => {
            checkVisibility(helper.current.parentElement.scrollTop);
        };

        helper.current.parentElement.addEventListener('scroll', scrollListener.current);
    }

    const bindDocumentScrollListener = () => {
        scrollListener.current = () => {
            checkVisibility(DomHandler.getWindowScrollTop());
        };

        window.addEventListener('scroll', scrollListener.current);
    }

    const unbindDocumentScrollListener = () => {
        if (scrollListener.current) {
            window.removeEventListener('scroll', scrollListener.current);
            scrollListener.current = null;
        }
    }

    const unbindParentScrollListener = () => {
        if (scrollListener.current) {
            helper.current && helper.current.parentElement.removeEventListener('scroll', scrollListener.current);
            scrollListener.current = null;
        }
    }

    const className = classNames('p-scrolltop p-link p-component', {
        'p-scrolltop-sticky': props.target !== 'window'
    }, props.className);
    const isTargetParent = props.target === 'parent';

    return (
        <>
            <CSSTransition nodeRef={scrollElementRef} classNames="p-scrolltop" in={visible} timeout={{ enter: 150, exit: 150 }} options={props.transitionOptions}
                unmountOnExit onEnter={onEnter} onEntered={onEntered} onExited={onExited}>
                <button ref={scrollElementRef} type="button" className={className} style={props.style} onClick={onClick}>
                    {IconUtils.getJSXIcon(props.icon, { className: 'p-scrolltop-icon' }, { props: props })}
                    <Ripple />
                </button>
            </CSSTransition>
            {isTargetParent && <span ref={helper} className="p-scrolltop-helper"></span>}
        </>
    );
})

ScrollTop.defaultProps = {
    __TYPE: 'ScrollTop',
    target: 'window',
    threshold: 400,
    icon: 'pi pi-chevron-up',
    behavior: 'smooth',
    className: null,
    style: null,
    transitionOptions: null,
    onShow: null,
    onHide: null
};

ScrollTop.propTypes = {
    __TYPE: PropTypes.string,
    target: PropTypes.string,
    threshold: PropTypes.number,
    icon: PropTypes.any,
    behavior: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    transitionOptions: PropTypes.object,
    onShow: PropTypes.func,
    onHide: PropTypes.func
};
