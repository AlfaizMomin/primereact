import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils } from '../utils/Utils';
import { useEventListener, useMountEffect, useUnmountEffect, useUpdateEffect } from '../hooks/Hooks';

export const StyleClass = (props) => {
    const targetRef = useRef(null);
    const animating = useRef(false);
    const elementRef = useRef(null);

    const [bindTargetEnter, unbindTargetEnter] = useEventListener({
        type: 'animationend', listener: () => {
            DomHandler.removeClass(targetRef.current, props.enterActiveClassName);
            if (props.enterToClassName) {
                DomHandler.addClass(targetRef.current, props.enterToClassName);
            }
            unbindTargetEnter();

            if (props.enterActiveClassName === 'slidedown') {
                targetRef.current.style.maxHeight = '';
            }
            animating.current = false;
        }, when: false
    });

    const [bindTargetLeave, unbindTargetLeave] = useEventListener({
        type: 'animationend', listener: () => {
            DomHandler.removeClass(targetRef.current, props.leaveActiveClassName);
            if (props.leaveToClassName) {
                DomHandler.addClass(targetRef.current, props.leaveToClassName);
            }
            unbindTargetLeave();
            animating.current = false;
        }, when: false
    });

    const [bindDocumentClick, unbindDocumentClick] = useEventListener({
        type: 'animationend', listener: (event) => {
            if (getComputedStyle(targetRef.current).getPropertyValue('position') === 'static') {
                unbindDocumentClick();
            }
            else if (!elementRef.current.isSameNode(event.target) && !elementRef.current.contains(event.target) && !targetRef.current.contains(event.target)) {
                leave();
            }
        }, when: false
    });

    const [bindClick, unbindClick] = useEventListener({
        type: 'click', listener: () => {
            targetRef.current = resolveTarget();

            if (props.toggleClassName) {
                if (DomHandler.hasClass(targetRef.current, props.toggleClassName))
                    DomHandler.removeClass(targetRef.current, props.toggleClassName);
                else
                    DomHandler.addClass(targetRef.current, props.toggleClassName);
            }
            else {
                if (targetRef.current.offsetParent === null)
                    enter();
                else
                    leave();
            }
        }, when: false
    });

    const enter = () => {
        if (props.enterActiveClassName) {
            if (!animating.current) {
                animating.current = true;

                if (props.enterActiveClassName === 'slidedown') {
                    targetRef.current.style.height = '0px';
                    DomHandler.removeClass(targetRef.current, 'hidden');
                    targetRef.current.style.maxHeight = targetRef.current.scrollHeight + 'px';
                    DomHandler.addClass(targetRef.current, 'hidden');
                    targetRef.current.style.height = '';
                }

                DomHandler.addClass(targetRef.current, props.enterActiveClassName);
                if (props.enterClassName) {
                    DomHandler.removeClass(targetRef.current, props.enterClassName);
                }

                bindTargetEnter({ target: targetRef.current, when: true });
            }
        }
        else {
            if (props.enterClassName) {
                DomHandler.removeClass(targetRef.current, props.enterClassName);
            }

            if (props.enterToClassName) {
                DomHandler.addClass(targetRef.current, props.enterToClassName);
            }
        }

        bindDocumentClick({ target: elementRef.current && elementRef.current.ownerDocument, when: props.hideOnOutsideClick });
    }

    const leave = () => {
        if (props.leaveActiveClassName) {
            if (!animating.current) {
                animating.current = true;
                DomHandler.addClass(targetRef.current, props.leaveActiveClassName);
                if (props.leaveClassName) {
                    DomHandler.removeClass(targetRef.current, props.leaveClassName);
                }

                bindTargetLeave({ target: targetRef.current, when: true });
            }
        }
        else {
            if (props.leaveClassName) {
                DomHandler.removeClass(targetRef.current, props.leaveClassName);
            }

            if (props.leaveToClassName) {
                DomHandler.addClass(targetRef.current, props.leaveToClassName);
            }
        }

        unbindDocumentClick();
    }

    const resolveTarget = () => {
        if (targetRef.current) {
            return targetRef.current;
        }

        switch (props.selector) {
            case '@next':
                return elementRef.current.nextElementSibling;

            case '@prev':
                return elementRef.current.previousElementSibling;

            case '@parent':
                return elementRef.current.parentElement;

            case '@grandparent':
                return elementRef.current.parentElement.parentElement;

            default:
                return document.querySelector(props.selector);
        }
    }

    const init = () => {
        elementRef.current = ObjectUtils.getRefElement(props.nodeRef);
        bindClick({ target: elementRef.current, when: true });
    }

    const destroy = () => {
        unbindClick();
        unbindDocumentClick();
        targetRef.current = null;
    }

    useMountEffect(() => {
        init();
    });

    useUpdateEffect(() => {
        destroy();
        init();
    }, [props.nodeRef]);

    useUnmountEffect(() => {
        destroy();
    });

    return props.children;
}

StyleClass.defaultProps = {
    __TYPE: 'StyleClass',
    nodeRef: null,
    selector: null,
    enterClassName: null,
    enterActiveClassName: null,
    enterToClassName: null,
    leaveClassName: null,
    leaveActiveClassName: null,
    leaveToClassName: null,
    hideOnOutsideClick: false,
    toggleClassName: null
}

StyleClass.propTypes = {
    __TYPE: PropTypes.string,
    nodeRef: PropTypes.any,
    selector: PropTypes.string,
    enterClassName: PropTypes.string,
    enterActiveClassName: PropTypes.string,
    enterToClassName: PropTypes.string,
    leaveClassName: PropTypes.string,
    leaveActiveClassName: PropTypes.string,
    leaveToClassName: PropTypes.string,
    hideOnOutsideClick: PropTypes.bool,
    toggleClassName: PropTypes.string
}
