import React, { forwardRef, memo, useEffect } from 'react';
import { classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const GalleriaItem = memo(forwardRef((props, ref) => {

    const next = () => {
        let nextItemIndex = props.activeItemIndex + 1;

        props.onActiveItemChange({
            index: props.circular && (props.value.length - 1) === props.activeItemIndex ? 0 : nextItemIndex
        });
    }

    const prev = () => {
        let prevItemIndex = props.activeItemIndex !== 0 ? props.activeItemIndex - 1 : 0;

        props.onActiveItemChange({
            index: props.circular && props.activeItemIndex === 0 ? props.value.length - 1 : prevItemIndex
        });
    }

    const stopSlideShow = () => {
        if (props.slideShowActive && props.stopSlideShow) {
            props.stopSlideShow();
        }
    }

    const navBackward = (e) => {
        stopSlideShow();
        prev();

        if (e && e.cancelable) {
            e.preventDefault();
        }
    }

    const navForward = (e) => {
        stopSlideShow();
        next();

        if (e && e.cancelable) {
            e.preventDefault();
        }
    }

    const onIndicatorClick = (index) => {
        stopSlideShow();
        props.onActiveItemChange({
            index
        });
    }

    const onIndicatorMouseEnter = (index) => {
        if (props.changeItemOnIndicatorHover) {
            stopSlideShow();

            props.onActiveItemChange({
                index
            });
        }
    }

    const onIndicatorKeyDown = (event, index) => {
        if (event.which === 13) {
            stopSlideShow();

            props.onActiveItemChange({
                index
            });
        }
    }

    useEffect(() => {
        if (props.autoPlay) {
            props.startSlideShow();
        }
    }, []);

    const useBackwardNavigator = () => {
        if (props.showItemNavigators) {
            let isDisabled = !props.circular && props.activeItemIndex === 0;
            let buttonClassName = classNames('p-galleria-item-prev p-galleria-item-nav p-link', {
                'p-disabled': isDisabled
            });

            return (
                <button type="button" className={buttonClassName} onClick={navBackward} disabled={isDisabled}>
                    <span className="p-galleria-item-prev-icon pi pi-chevron-left"></span>
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useForwardNavigator = () => {
        if (props.showItemNavigators) {
            let isDisabled = !props.circular && props.activeItemIndex === (props.value.length - 1);
            let buttonClassName = classNames('p-galleria-item-next p-galleria-item-nav p-link', {
                'p-disabled': isDisabled
            });

            return (
                <button type="button" className={buttonClassName} onClick={navForward} disabled={isDisabled}>
                    <span className="p-galleria-item-next-icon pi pi-chevron-right"></span>
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useCaption = () => {
        if (props.caption) {
            const content = props.caption(props.value[props.activeItemIndex]);
            return (
                <div className="p-galleria-caption">
                    {content}
                </div>
            );
        }

        return null;
    }

    const useIndicator = (index) => {
        let indicator = props.indicator && props.indicator(index);
        let isActive = props.activeItemIndex === index;
        let indicatorItemClassName = classNames('p-galleria-indicator', {
            'p-highlight': isActive
        });

        if (!indicator) {
            indicator = (
                <button type="button" tabIndex={-1} className="p-link">
                    <Ripple />
                </button>
            );
        }

        return (
            <li className={indicatorItemClassName} key={'p-galleria-indicator-' + index} tabIndex={0}
                onClick={() => onIndicatorClick(index)} onMouseEnter={() => onIndicatorMouseEnter(index)} onKeyDown={(e) => onIndicatorKeyDown(e, index)}>
                {indicator}
            </li>
        );
    }

    const useIndicators = () => {
        if (props.showIndicators) {
            const indicatorsContentClassName = classNames('p-galleria-indicators p-reset', props.indicatorsContentClassName);
            let indicators = [];

            for (let i = 0; i < props.value.length; i++) {
                indicators.push(useIndicator(i));
            }

            return (
                <ul className={indicatorsContentClassName}>
                    {indicators}
                </ul>
            );
        }

        return null;
    }

    const content = props.itemTemplate && props.itemTemplate(props.value[props.activeItemIndex]);
    const backwardNavigator = useBackwardNavigator();
    const forwardNavigator = useForwardNavigator();
    const caption = useCaption();
    const indicators = useIndicators();

    return (
        <div ref={ref} className="p-galleria-item-wrapper">
            <div className="p-galleria-item-container">
                {backwardNavigator}
                <div className="p-galleria-item">
                    {content}
                </div>
                {forwardNavigator}
                {caption}
            </div>

            {indicators}
        </div>
    )
}))
