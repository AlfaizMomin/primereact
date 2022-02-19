import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, classNames } from '../utils/Utils';

export const ScrollPanel = forwardRef((props, ref) => {
    const className = classNames('p-scrollpanel p-component', props.className);
    const container = useRef(null);
    const content = useRef(null);
    const xBar = useRef(null);
    const yBar = useRef(null);
    const isXBarClicked = useRef(false);
    const isYBarClicked = useRef(false);
    const lastPageX = useRef(null);
    const lastPageY = useRef(null);
    const scrollXRatio = useRef(null);
    const scrollYRatio = useRef(null);
    const frame = useRef(null);
    const initialized = useRef(false);

    const calculateContainerHeight = () => {
        let containerStyles = getComputedStyle(container.current),
        xBarStyles = getComputedStyle(xBar.current),
        pureContainerHeight = DomHandler.getHeight(container.current) - parseInt(xBarStyles['height'], 10);

        if (containerStyles['max-height'] !== "none" && pureContainerHeight === 0) {
            if(content.current.offsetHeight + parseInt(xBarStyles['height'], 10) > parseInt(containerStyles['max-height'], 10)) {
                container.current.style.height = containerStyles['max-height'];
            }
            else {
                container.current.style.height = content.current.offsetHeight + parseFloat(containerStyles.paddingTop) + parseFloat(containerStyles.paddingBottom) + parseFloat(containerStyles.borderTopWidth) + parseFloat(containerStyles.borderBottomWidth) + "px";
            }
        }
    }

    const moveBar = () => {
        // horizontal scroll
        let totalWidth = content.current.scrollWidth;
        let ownWidth = content.current.clientWidth;
        let bottom = (container.current.clientHeight - xBar.current.clientHeight) * -1;
        scrollXRatio.current = ownWidth / totalWidth;

        // vertical scroll
        let totalHeight = content.current.scrollHeight;
        let ownHeight = content.current.clientHeight;
        let right = (container.current.clientWidth - yBar.current.clientWidth) * -1;
        scrollYRatio.current = ownHeight / totalHeight;

        frame.current =  window.requestAnimationFrame(() => {
            if (scrollXRatio.current >= 1) {
                DomHandler.addClass(xBar.current, 'p-scrollpanel-hidden');
            }
            else {
                DomHandler.removeClass(xBar.current, 'p-scrollpanel-hidden');
                xBar.current.style.cssText = 'width:' + Math.max(scrollXRatio.current * 100, 10) + '%; left:' + (content.current.scrollLeft / totalWidth) * 100 + '%;bottom:' + bottom + 'px;';
            }

            if (scrollYRatio.current >= 1) {
                DomHandler.addClass(yBar.current, 'p-scrollpanel-hidden');
            }
            else {
                DomHandler.removeClass(yBar.current, 'p-scrollpanel-hidden');
                yBar.current.style.cssText = 'height:' + Math.max(scrollYRatio.current * 100, 10) + '%; top: calc(' + (content.current.scrollTop / totalHeight) * 100 + '% - ' + xBar.current.clientHeight + 'px);right:' + right + 'px;';
            }
        });
    }

    const onYBarMouseDown = (event) => {
        isYBarClicked.current = true;
        lastPageY.current = event.pageY;
        DomHandler.addClass(yBar.current, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');

        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('mouseup', onDocumentMouseUp);
        event.preventDefault();
    }

    const onXBarMouseDown = (event) => {
        isXBarClicked.current = true;
        lastPageX.current = event.pageX;
        DomHandler.addClass(xBar.current, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');

        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('mouseup', onDocumentMouseUp);
        event.preventDefault();
    }

    const onDocumentMouseMove = (event) => {
        if(isXBarClicked) {
            onMouseMoveForXBar(event);
        }
        else if(isYBarClicked) {
            onMouseMoveForYBar(event);
        }
        else {
            onMouseMoveForXBar(event);
            onMouseMoveForYBar(event);
        }
    }

    const onMouseMoveForXBar = (event) => {
        let deltaX = event.pageX - lastPageX.current;
        lastPageX.current = event.pageX;

        frame.current =  window.requestAnimationFrame(() => {
            content.current.scrollLeft += deltaX / scrollXRatio.current;
        });
    }

    const onMouseMoveForYBar = (event) => {
        let deltaY = event.pageY - lastPageY.current;
        lastPageY.current = e.pageY;

        frame.current =  window.requestAnimationFrame(() => {
            content.current.scrollTop += deltaY / scrollYRatio.current;
        });
    }

    const onDocumentMouseUp = (event) => {
        DomHandler.removeClass(yBar.current, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(xBar.current, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(document.body, 'p-scrollpanel-grabbed');

        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);
        isXBarClicked.current = false;
        isYBarClicked.current = false;
    }

    const refresh = () => {
        moveBar();
    }

    useEffect(() => {
        moveBar();
        window.addEventListener('resize', moveBar);
        calculateContainerHeight();
        initialized = true;

        return () => {
            if (initialized) {
                window.removeEventListener('resize', moveBar);
            }

            if (frame.current) {
                window.cancelAnimationFrame(frame.current);
            }
        };
    }, []);

    useImperativeHandle(ref, () => ({
        refresh
    }));

    return (
        <div ref={container} id={props.id} className={className} style={props.style}>
            <div className="p-scrollpanel-wrapper">
                <div ref={content} className="p-scrollpanel-content" onScroll={moveBar} onMouseEnter={moveBar}>
                    {props.children}
                </div>
            </div>
            <div ref={xBar} className="p-scrollpanel-bar p-scrollpanel-bar-x" onMouseDown={onXBarMouseDown}></div>
            <div ref={yBar} className="p-scrollpanel-bar p-scrollpanel-bar-y" onMouseDown={onYBarMouseDown}></div>
        </div>
    );
})

ScrollPanel.defaultProps = {
    id: null,
    style: null,
    className: null
}

ScrollPanel.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string
}
