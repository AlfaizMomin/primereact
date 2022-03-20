/*global google*/
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useMountEffect, useUpdateEffect } from '../hooks/Hooks';

export const GMap = forwardRef((props, ref) => {
    const map = useRef(null);
    const prevOverlays = useRef(null);
    const container = useRef(container);

    const initMap = () => {
        map.current = new google.maps.Map(container.current, props.options);

        if(props.onMapReady) {
            props.onMapReady({
                map: map.current
            });
        }

        initOverlays(props.overlays);

        bindMapEvent('click', props.onMapClick);
        bindMapEvent('dragend', props.onMapDragEnd);
        bindMapEvent('zoom_changed', props.onZoomChanged);
    }

    const initOverlays = (overlays) => {
        if(overlays) {
            for(let overlay of overlays) {
                overlay.setMap(map.current);
                bindOverlayEvents(overlay);
            }

            prevOverlays.current = overlays;
        }
    }

    const bindOverlayEvents = (overlay) => {
        overlay.addListener('click', (event) => {
            if(props.onOverlayClick) {
                props.onOverlayClick({
                    originalEvent: event,
                    overlay: overlay,
                    map: map.current
                });
            }
        });

        if(overlay.getDraggable()) {
            bindDragEvents(overlay);
        }
    }

    const bindDragEvents = (overlay) => {
        bindDragEvent(overlay, 'dragstart', props.onOverlayDragStart);
        bindDragEvent(overlay, 'drag', props.onOverlayDrag);
        bindDragEvent(overlay, 'dragend', props.onOverlayDragEnd);
    }

    const bindMapEvent = (eventName, callback) => {
        map.current.addListener(eventName, (event) => {
            if(callback) {
                callback(event);
            }
        });
    }

    const bindDragEvent = (overlay, eventName, callback) => {
        overlay.addListener(eventName, (event) => {
            if(callback) {
                callback({
                    originalEvent: event,
                    overlay: overlay,
                    map: map.current
                });
            }
        });
    }

    const getMap = () => {
        return map.current;
    }

    useUpdateEffect(() => {
        if(prevOverlays.current) {
            for(let overlay of prevOverlays.current) {
                google.maps.event.clearInstanceListeners(overlay);
                overlay.setMap(null);
            }
        }

        initOverlays(props.overlays);
    }, [props.overlays]);

    useMountEffect(() => {
        initMap();
    });

    useImperativeHandle(ref, () => ({
        getMap
    }));

    return (
        <div ref={container} style={props.style} className={props.className}></div>
    );
})



GMap.defaultProps = {
    options: null,
    overlays: null,
    style: null,
    className: null,
    onMapReady: null,
    onMapClick: null,
    onMapDragEnd: null,
    onZoomChanged: null,
    onOverlayDragStart: null,
    onOverlayDrag: null,
    onOverlayDragEnd: null,
    onOverlayClick: null
}

GMap.propTypes = {
    options: PropTypes.object,
    overlays: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    onMapReady: PropTypes.func,
    onMapClick: PropTypes.func,
    onMapDragEnd: PropTypes.func,
    onZoomChanged: PropTypes.func,
    onOverlayDragStart: PropTypes.func,
    onOverlayDrag: PropTypes.func,
    onOverlayDragEnd: PropTypes.func,
    onOverlayClick: PropTypes.func
}
