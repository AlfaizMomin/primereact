import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, classNames, ObjectUtils } from '../utils/Utils';
import { useEventListener } from '../hooks/useEventListener';

export const SplitterPanel = () => {}

export const Splitter = (props) => {
    const className = classNames(`p-splitter p-component p-splitter-${props.layout}`, props.className);
    const container = useRef(null);
    const gutterEl = useRef(null);
    const size = useRef(null);
    const dragging = useRef(null);
    const startPos = useRef(null);
    const prevPanelElement = useRef(null);
    const nextPanelElement = useRef(null);
    const prevPanelSize = useRef(null);
    const nextPanelSize = useRef(null);
    const prevPanelIndex = useRef(null);
    const panelSizes = useRef(null);
    const isStateful = props.stateKey != null;
    const [bindMouseMove, unbindMouseMove] = useEventListener('mousemove', event => onResize(event));
    const [bindMouseUp, unbindMouseUp] = useEventListener('mouseup', event => {
        onResizeEnd(event);
        unbindMouseListeners();
    });

    const bindMouseListeners = () => {
        bindMouseMove();
        bindMouseUp();
    }

    const unbindMouseListeners = () => {
        unbindMouseMove();
        unbindMouseUp();
    }

    const validateResize = (newPrevPanelSize, newNextPanelSize) => {
        if (props.children[prevPanelIndex.current].props && props.children[prevPanelIndex.current].props.minSize && props.children[prevPanelIndex.current].props.minSize > newPrevPanelSize) {
            return false;
        }

        if (props.children[prevPanelIndex.current + 1].props && props.children[prevPanelIndex.current + 1].props.minSize && props.children[prevPanelIndex.current + 1].props.minSize > newNextPanelSize) {
            return false;
        }

        return true;
    }

    const clear = () => {
        dragging.current = false;
        size.current = null;
        startPos.current = null;
        prevPanelElement.current = null;
        nextPanelElement.current = null;
        prevPanelSize.current = null;
        nextPanelSize.current = null;
        prevPanelIndex.current = null;
    }

    const getStorage = () => {
        switch (props.stateStorage) {
            case 'local':
                return window.localStorage;

            case 'session':
                return window.sessionStorage;

            default:
                throw new Error(props.stateStorage + ' is not a valid value for the state storage, supported values are "local" and "session".');
        }
    }

    const saveState = () => {
        getStorage().setItem(props.stateKey, JSON.stringify(panelSizes));
    }

    const restoreState = () => {
        const storage = getStorage();
        const stateString = storage.getItem(props.stateKey);

        if (stateString) {
            panelSizes.current = JSON.parse(stateString);
            let children = [...container.current.children].filter(child => DomHandler.hasClass(child, 'p-splitter-panel'));
            children.forEach((child, i) => {
                child.style.flexBasis = 'calc(' + panelSizes[i] + '% - ' + ((props.children.length - 1) * props.gutterSize) + 'px)';
            });

            return true;
        }

        return false;
    }

    const onResizeStart = (event, index) => {
        let pageX = event.type === 'touchstart' ? event.touches[0].pageX : event.pageX;
        let pageY = event.type === 'touchstart' ? event.touches[0].pageY : event.pageY;
        size.current = props.layout === 'horizontal' ? DomHandler.getWidth(container.current) : DomHandler.getHeight(container.current);
        dragging.current = true;
        startPos.current = props.layout === 'horizontal' ? pageX : pageY;
        prevPanelElement.current = gutterEl.current.previousElementSibling;
        nextPanelElement.current = gutterEl.current.nextElementSibling;
        prevPanelSize.current = 100 * (props.layout === 'horizontal' ? DomHandler.getOuterWidth(prevPanelElement.current, true) : DomHandler.getOuterHeight(prevPanelElement.current, true)) / size.current;
        nextPanelSize.current = 100 * (props.layout === 'horizontal' ? DomHandler.getOuterWidth(nextPanelElement.current, true) : DomHandler.getOuterHeight(nextPanelElement.current, true)) / size.current;
        prevPanelIndex.current = index;
        DomHandler.addClass(gutterEl.current, 'p-splitter-gutter-resizing');
        DomHandler.addClass(container.current, 'p-splitter-resizing');
    }

    const onResize = (event) => {
        let newPos;
        let pageX = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX;
        let pageY = event.type === 'touchmove' ? event.touches[0].pageY : event.pageY;

        if (props.layout === 'horizontal')
            newPos = (pageX * 100 / size.current) - (startPos.current * 100 / size.current);
        else
            newPos = (pageY * 100 / size.current) - (startPos.current * 100 / size.current);

        let newPrevPanelSize = prevPanelSize.current + newPos;
        let newNextPanelSize = nextPanelSize.current - newPos;

        if (validateResize(newPrevPanelSize, newNextPanelSize)) {
            prevPanelElement.current.style.flexBasis = 'calc(' + newPrevPanelSize + '% - ' + ((props.children.length - 1) * props.gutterSize) + 'px)';
            nextPanelElement.current.style.flexBasis = 'calc(' + newNextPanelSize + '% - ' + ((props.children.length - 1) * props.gutterSize) + 'px)';
            panelSizes.current[prevPanelIndex.current] = newPrevPanelSize;
            panelSizes.current[prevPanelIndex.current + 1] = newNextPanelSize;
        }
    }

    const onResizeEnd = (event) => {
        if (isStateful) {
            saveState();
        }

        if (props.onResizeEnd) {
            props.onResizeEnd({
                originalEvent: event,
                sizes: panelSizes
            })
        }

        DomHandler.removeClass(gutterEl.current, 'p-splitter-gutter-resizing');
        DomHandler.removeClass(container.current, 'p-splitter-resizing');
        clear();
    }

    const onGutterMouseDown = (event, index) => {
        onResizeStart(event, index);
        bindMouseListeners();
    }

    const onGutterTouchStart = (event, index) => {
        onResizeStart(event, index);

        window.addEventListener('touchmove', onGutterTouchMove, { passive: false, cancelable: false });
        window.addEventListener('touchend', onGutterTouchEnd);
    }

    const onGutterTouchMove = (event) => {
        onResize(event);
    }

    const onGutterTouchEnd = (event) => {
        onResizeEnd(event);
        window.removeEventListener('touchmove', onGutterTouchMove);
        window.removeEventListener('touchend', onGutterTouchEnd);
    }

    const usePanel = (panel, index) => {
        const panelClassName = classNames('p-splitter-panel', panel.props.className);
        const gutterStyle = props.layout === 'horizontal' ? { width: props.gutterSize + 'px' } : { height: props.gutterSize + 'px' }
        const gutter = (index !== props.children.length - 1) && (
            <div ref={gutterEl} className="p-splitter-gutter" style={gutterStyle} onMouseDown={event => onGutterMouseDown(event, index)}
                onTouchStart={event => onGutterTouchStart(event, index)} onTouchMove={event => onGutterTouchMove(event)} onTouchEnd={event => onGutterTouchEnd(event)}>
                <div className="p-splitter-gutter-handle"></div>
            </div>
        );

        return (
            <React.Fragment>
                <div key={index} className={panelClassName} style={panel.props.style}>
                    {panel.props.children}
                </div>
                {gutter}
            </React.Fragment>
        );
    }


    const usePanels = () => {
        return (
            React.Children.map(props.children, (panel, index) => {
                return usePanel(panel, index);
            })
        )
    }

    useEffect(() => {
        let panelElements = [...container.current.children].filter(child => DomHandler.hasClass(child, 'p-splitter-panel'));
        panelElements.map(panelElement => {
            if (panelElement.childNodes && ObjectUtils.isNotEmpty(DomHandler.find(panelElement, '.p-splitter'))) {
                DomHandler.addClass(panelElement, 'p-splitter-panel-nested');
            }
        });

        if (props.children && props.children.length) {
            let initialized = false;
            if (isStateful) {
                initialized = restoreState();
            }

            if (!initialized) {
                let _panelSizes = [];

                props.children.map((panel, i) => {
                    let panelInitialSize = panel.props && panel.props.size ? panel.props.size : null;
                    let panelSize = panelInitialSize || (100 / props.children.length);
                    _panelSizes[i] = panelSize;
                    panelElements[i].style.flexBasis = 'calc(' + panelSize + '% - ' + ((props.children.length - 1) * props.gutterSize) + 'px)';
                    return _panelSizes;
                });

                panelSizes.current = _panelSizes;
            }
        }
    }, []);

    const panels = usePanels();

    return (
        <div ref={container} id={props.id} className={className} style={props.style}>
            {panels}
        </div>
    );
}

SplitterPanel.defaultProps = {
    size: null,
    minSize: null,
    style: null,
    className: null
}

SplitterPanel.propTypes = {
    header: PropTypes.number,
    minSize: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string
}

Splitter.defaultProps = {
    id: null,
    className: null,
    style: null,
    layout: 'horizontal',
    gutterSize: 4,
    stateKey: null,
    stateStorage: 'session',
    onResizeEnd: null
}

Splitter.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    layout: PropTypes.string,
    gutterSize: PropTypes.number,
    stateKey: PropTypes.string,
    stateStorage: PropTypes.string,
    onResizeEnd: PropTypes.func
};
