import { forwardRef, memo, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames } from '../utils/Utils';
import { tip } from '../tooltip/Tooltip';

export const InputTextarea = memo(forwardRef((props, ref) => {
    const elementRef = useRef(ref);
    const tooltipRef = useRef(null);
    const cachedScrollHeight = useRef(0);

    const onFocus = (event) => {
        if (props.autoResize) {
            resize();
        }

        if (props.onFocus) {
            props.onFocus(event);
        }
    }

    const onBlur = (event) => {
        if (props.autoResize) {
            resize();
        }

        if (props.onBlur) {
            props.onBlur(event);
        }
    }

    const onKeyUp = (event) => {
        if (props.autoResize) {
            resize();
        }

        if (props.onKeyUp) {
            props.onKeyUp(event);
        }
    }

    const onInput = (event) => {
        if (props.autoResize) {
            resize();
        }

        if (event.target.value.length > 0)
            DomHandler.addClass(event.target, 'p-filled');
        else
            DomHandler.removeClass(event.target, 'p-filled');

        if (props.onInput) {
            props.onInput(event);
        }
    }

    const resize = (initial) => {
        const inputEl = elementRef.current;

        if (inputEl && DomHandler.isVisible(inputEl)) {
            if (!cachedScrollHeight.current) {
                cachedScrollHeight.current = inputEl.scrollHeight;
                inputEl.style.overflow = 'hidden';
            }

            if (cachedScrollHeight.current !== inputEl.scrollHeight || initial) {
                inputEl.style.height = '';
                inputEl.style.height = inputEl.scrollHeight + 'px';

                if (parseFloat(inputEl.style.height) >= parseFloat(inputEl.style.maxHeight)) {
                    inputEl.style.overflowY = 'scroll';
                    inputEl.style.height = inputEl.style.maxHeight;
                }
                else {
                    inputEl.style.overflow = 'hidden';
                }

                cachedScrollHeight.current = inputEl.scrollHeight;
            }
        }
    }

    const isFilled = useMemo(() => (
        ObjectUtils.isNotEmpty(props.value) || ObjectUtils.isNotEmpty(props.defaultValue) || (elementRef.current && ObjectUtils.isNotEmpty(elementRef.current.value))
    ), [props.value, props.defaultValue]);

    useEffect(() => {
        ObjectUtils.combinedRefs(elementRef, ref);
    }, [elementRef]);

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

    useEffect(() => {
        if (props.autoResize) {
            resize(true);
        }
    }, [props.autoResize]);

    const textareaProps = ObjectUtils.findDiffKeys(props, InputTextarea.defaultProps);
    const className = classNames('p-inputtextarea p-inputtext p-component', {
        'p-disabled': props.disabled,
        'p-filled': isFilled,
        'p-inputtextarea-resizable': props.autoResize
    }, props.className);

    return (
        <textarea ref={elementRef} {...textareaProps} className={className} onFocus={onFocus} onBlur={onBlur} onKeyUp={onKeyUp} onInput={onInput}></textarea>
    );
}))

InputTextarea.defaultProps = {
    autoResize: false,
    tooltip: null,
    tooltipOptions: null,
    onInput: null
}

InputTextarea.propTypes = {
    autoResize: PropTypes.bool,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    onInput: PropTypes.func
}
