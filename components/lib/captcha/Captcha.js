import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';

export const Captcha = memo(forwardRef((props, ref) => {
    const elementRef = useRef(null);
    const instance = useRef(null);
    const recaptchaScript = useRef(null);

    const init = () => {
        instance.current = (window).grecaptcha.render(elementRef.current, {
            'sitekey': props.siteKey,
            'theme': props.theme,
            'type': props.type,
            'size': props.size,
            'tabindex': props.tabIndex,
            'hl': props.language,
            'callback': recaptchaCallback,
            'expired-callback': recaptchaExpiredCallback
        });
    }

    const reset = () => {
        if (instance.current === null)
            return;

        (window).grecaptcha.reset(instance.current);
    }

    const getResponse = () => {
        if (instance.current === null)
            return null;

        return (window).grecaptcha.getResponse(instance.current);
    }

    const recaptchaCallback = (response) => {
        if (props.onResponse) {
            props.onResponse({
                response
            });
        }
    }

    const recaptchaExpiredCallback = () => {
        if (props.onExpire) {
            props.onExpire();
        }
    }

    const addRecaptchaScript = () => {
        recaptchaScript.current = null;
        if (!(window).grecaptcha) {
            let head = document.head || document.getElementsByTagName('head')[0];
            let script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (!(window).grecaptcha) {
                    console.warn('Recaptcha is not loaded');
                    return;
                }

                window.grecaptcha.ready(() => {
                    init();
                });
            }
            recaptchaScript.current = script;

            head.appendChild(recaptchaScript.current);
        }
    }

    useEffect(() => {
        addRecaptchaScript();

        if ((window).grecaptcha) {
            init();
        }

        return () => {
            if (recaptchaScript.current) {
                recaptchaScript.current.parentNode.removeChild(recaptchaScript.current);
            }
        }
    }, []);

    useImperativeHandle(ref, () => ({
        reset,
        getResponse
    }));

    return <div ref={elementRef} id={props.id}></div>
}));

Captcha.defaultProps = {
    id: null,
    siteKey: null,
    theme: 'light',
    type: 'image',
    size: 'normal',
    tabIndex: 0,
    language: 'en',
    onResponse: null,
    onExpire: null
}

Captcha.propTypes = {
    id: PropTypes.string,
    sitekey: PropTypes.string,
    theme: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.string,
    tabIndex: PropTypes.number,
    language: PropTypes.string,
    onResponse: PropTypes.func,
    onExpire: PropTypes.func
}
