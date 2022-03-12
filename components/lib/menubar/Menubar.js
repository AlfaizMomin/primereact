import React, { useRef, forwardRef, useEffect, useState, useImperativeHandle, memo } from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, ZIndexUtils, classNames } from '../utils/Utils';
import { MenubarSub } from './MenubarSub';
import PrimeReact from '../api/Api';
import { useEventListener } from '../hooks/useEventListener';

export const Menubar = memo(forwardRef((props, ref) => {
    const [mobileActive, setMobileActive] = useState(false);
    const rootMenuRef = useRef(null);
    const menuButtonRef = useRef(null);

    const [bindDocumentClickListener, unbindDocumentClickListener] = useEventListener({
        type: 'click', listener: event => {
            if (mobileActive && isOutsideClicked(event)) {
                setMobileActive(false);
            }
        }
    });

    const toggle = (event) => {
        event.preventDefault();

        setMobileActive(prevState => !prevState)
    }

    useEffect(() => {
        if (mobileActive) {
            ZIndexUtils.set('menu', rootMenuRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['menu']);
            bindDocumentClickListener();
        }
        else {
            unbindDocumentClickListener();
            ZIndexUtils.clear(rootMenuRef.current);
        }
    }, [mobileActive])


    const isOutsideClicked = (event) => {
        return rootMenuRef.current !== event.target && !rootMenuRef.current.contains(event.target)
            && menuButtonRef.current !== event.target && !menuButtonRef.current.contains(event.target)
    }

    const onLeafClick = () => {
        setMobileActive(false);
    }

    useEffect(() => {
        return () => {
            ZIndexUtils.clear(rootMenuRef.current);
        }
    }, [])

    const useCustomContent = () => {
        if (props.children) {
            return (
                <div className="p-menubar-custom">
                    {props.children}
                </div>
            );
        }

        return null;
    }

    const useStartContent = () => {
        if (props.start) {
            const start = ObjectUtils.getJSXElement(props.start, props);

            return (
                <div className="p-menubar-start">
                    {start}
                </div>
            );
        }

        return null;
    }

    const useEndContent = () => {
        if (props.end) {
            const end = ObjectUtils.getJSXElement(props.end, props);

            return (
                <div className="p-menubar-end">
                    {end}
                </div>
            );
        }

        return null;
    }

    const useMenuButton = () => {
        /* eslint-disable */
        const button = (
            <a ref={menuButtonRef} href={'#'} role="button" tabIndex={0} className="p-menubar-button" onClick={toggle}>
                <i className="pi pi-bars" />
            </a>
        );
        /* eslint-enable */

        return button;
    }

    useImperativeHandle(ref, () => ({
        toggle,
        useCustomContent
    }));

    const className = classNames('p-menubar p-component', { 'p-menubar-mobile-active': mobileActive }, props.className);
    const start = useStartContent();
    const end = useEndContent();
    const menuButton = useMenuButton();

    return (
        <div id={props.id} className={className} style={props.style}>
            {start}
            {menuButton}
            <MenubarSub ref={rootMenuRef} model={props.model} root mobileActive={mobileActive} onLeafClick={onLeafClick} />
            {end}
        </div>
    );
}))

Menubar.defaultProps = {
    id: null,
    model: null,
    style: null,
    className: null,
    start: null,
    end: null
}

Menubar.propTypes = {
    id: PropTypes.string,
    model: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    start: PropTypes.any,
    end: PropTypes.any
}
