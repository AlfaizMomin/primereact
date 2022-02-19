import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export const DeferredContent = (props) => {
    const [loaded,setLoaded] = useState(false);
    const container = useRef(null);
    const documentScrollListener = useRef(null);

    const shouldLoad = () => {
        if (loaded) {
            return false;
        }
        else {
            let rect = container.current.getBoundingClientRect();
            let docElement = document.documentElement;
            let winHeight = docElement.clientHeight;

            return (winHeight >= rect.top);
        }
    }

    const load = () => {
        setLoaded(true);

        if (props.onLoad) {
            props.onLoad();
        }
    }

    const bindScrollListener = () => {
        documentScrollListener.current = () => {
            if (shouldLoad()) {
                load();
                unbindScrollListener();
            }
        };

        window.addEventListener('scroll', documentScrollListener.current);
    }

    const unbindScrollListener = () => {
        if (documentScrollListener.current) {
            window.removeEventListener('scroll', documentScrollListener.current);
            documentScrollListener.current = null;
        }
    }

    useEffect(() => {
        if (!loaded) {
            if (shouldLoad())
                load();
            else
                bindScrollListener();
        }

        return () => unbindScrollListener();
    }, []);    

    return (
        <div ref={container}>
            {loaded ? props.children : null}
        </div>
    );
}

DeferredContent.defaultProps = {
    onload: null
}

DeferredContent.propTypes = {
    onLoad: PropTypes.func
}