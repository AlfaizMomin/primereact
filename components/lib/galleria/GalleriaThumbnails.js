import React, { forwardRef, memo, useEffect, useRef, useState } from 'react';
import PrimeReact from '../api/Api';
import { DomHandler, classNames, UniqueComponentId } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import ObjectUtils from '../utils/ObjectUtils';
import { useUpdateEffect, usePrevious, useResizeListener } from '../hooks/Hooks';

const GalleriaThumbnailItem = memo((props) => {

    const onItemClick = (event) => {
        props.onItemClick({
            originalEvent: event,
            index: props.index
        });
    }

    const onItemKeyDown = (event) => {
        if (event.which === 13) {
            props.onItemClick({
                originalEvent: event,
                index: props.index
            });
        }
    }

    const content = props.template && props.template(props.item);
    const itemClassName = classNames(props.className, 'p-galleria-thumbnail-item', {
        'p-galleria-thumbnail-item-current': props.current,
        'p-galleria-thumbnail-item-active': props.active,
        'p-galleria-thumbnail-item-start': props.start,
        'p-galleria-thumbnail-item-end': props.end
    });

    return (
        <div className={itemClassName}>
            <div className="p-galleria-thumbnail-item-content" tabIndex={props.active ? 0 : null} onClick={onItemClick} onKeyDown={onItemKeyDown}>
                { content }
            </div>
        </div>
    )
})

export const GalleriaThumbnails = memo(forwardRef((props, ref) => {
    const [numVisible, setNumVisible] = useState(props.numVisible);
    const [totalShiftedItems, setTotalShiftedItems] = useState(0);
    const [page, setPage] = useState(0);
    const itemsContainerRef = useRef(null);
    const startPos = useRef(null);
    const attributeSelector = useRef(''); // TODO UniqueComponentId();
    const thumbnailsStyle = useRef(null);
    const responsiveOptions = useRef(null);

    const [bindWindowResize, ] = useResizeListener({ listener: () => {
        calculatePosition();
    }, when: props.responsiveOptions });

    const step = (dir) => {
        let _totalShiftedItems = totalShiftedItems + dir;

        if (dir < 0 && (-1 * _totalShiftedItems) + numVisible > (props.value.length - 1)) {
            _totalShiftedItems = numVisible - props.value.length;
        }
        else if (dir > 0 && _totalShiftedItems > 0) {
            _totalShiftedItems = 0;
        }

        if (props.circular) {
            if (dir < 0 && props.value.length - 1 === props.activeItemIndex) {
                _totalShiftedItems = 0;
            }
            else if (dir > 0 && props.activeItemIndex === 0) {
                _totalShiftedItems = numVisible - props.value.length;
            }
        }

        if (itemsContainerRef.current) {
            DomHandler.removeClass(itemsContainerRef.current, 'p-items-hidden');
            itemsContainerRef.current.style.transform = props.isVertical ? `translate3d(0, ${_totalShiftedItems * (100/ numVisible)}%, 0)` : `translate3d(${_totalShiftedItems * (100/ numVisible)}%, 0, 0)`;
            itemsContainerRef.current.style.transition = 'transform 500ms ease 0s';
        }

        setTotalShiftedItems(_totalShiftedItems);
    }

    const stopSlideShow = () => {
        if (props.slideShowActive && props.stopSlideShow) {
            props.stopSlideShow();
        }
    }

    const getMedianItemIndex = () => {
        let index = Math.floor(numVisible / 2);

        return (numVisible % 2) ? index : index - 1;
    }

    const navBackward = (e) => {
        stopSlideShow();

        let prevItemIndex = props.activeItemIndex !== 0 ? props.activeItemIndex - 1 : 0;
        let diff = prevItemIndex + totalShiftedItems;
        if ((numVisible - diff - 1) > getMedianItemIndex() && ((-1 * totalShiftedItems) !== 0 || props.circular)) {
            step(1);
        }

        props.onActiveItemChange({
            index: props.circular && props.activeItemIndex === 0 ? props.value.length - 1 : prevItemIndex
        });

        if (e.cancelable) {
            e.preventDefault();
        }
    }

    const navForward = (e) => {
        stopSlideShow();

        let nextItemIndex = props.activeItemIndex + 1;
        if (nextItemIndex + totalShiftedItems > getMedianItemIndex() && ((-1 * totalShiftedItems) < getTotalPageNumber() - 1 || props.circular)) {
            step(-1);
        }

        props.onActiveItemChange({
            index: props.circular && (props.value.length - 1) === props.activeItemIndex ? 0 : nextItemIndex
        });

        if (e.cancelable) {
            e.preventDefault();
        }
    }

    const onItemClick = (event) => {
        stopSlideShow();

        let selectedItemIndex = event.index;
        if (selectedItemIndex !== props.activeItemIndex) {
            const diff = selectedItemIndex + totalShiftedItems;
            let dir = 0;
            if (selectedItemIndex < props.activeItemIndex) {
                dir = (numVisible - diff - 1) - getMedianItemIndex();
                if (dir > 0 && (-1 * totalShiftedItems) !== 0) {
                    step(dir);
                }
            }
            else {
                dir = getMedianItemIndex() - diff;
                if (dir < 0 && (-1 * totalShiftedItems) < getTotalPageNumber() - 1) {
                    step(dir);
                }
            }

            props.onActiveItemChange({
                index: selectedItemIndex
            });
        }
    }

    const onTransitionEnd = (e) => {
        if (itemsContainerRef.current && e.propertyName === 'transform') {
            DomHandler.addClass(itemsContainerRef.current, 'p-items-hidden');
            itemsContainerRef.current.style.transition = '';
        }
    }

    const onTouchStart = (e) => {
        let touchobj = e.changedTouches[0];

        startPos.current = {
            x: touchobj.pageX,
            y: touchobj.pageY
        };
    }

    const onTouchMove = (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
    }

    const onTouchEnd = (e) => {
        let touchobj = e.changedTouches[0];

        if (props.isVertical) {
            changePageOnTouch(e, (touchobj.pageY - startPos.current.y));
        }
        else {
            changePageOnTouch(e, (touchobj.pageX - startPos.current.x));
        }
    }

    const changePageOnTouch = (e, diff) => {
        if (diff < 0) {           // left
            navForward(e);
        }
        else {                    // right
            navBackward(e);
        }
    }

    const getTotalPageNumber = () => {
        return props.value.length > numVisible ? (props.value.length - numVisible) + 1 : 0;
    }

    const createStyle = () => {
        if (!thumbnailsStyle.current) {
            thumbnailsStyle.current = DomHandler.createInlineStyle(PrimeReact.nonce);
        }

        let innerHTML = `
            .p-galleria-thumbnail-items[${attributeSelector.current}] .p-galleria-thumbnail-item {
                flex: 1 0 ${ (100/ numVisible) }%
            }
        `;

        if (props.responsiveOptions) {
            responsiveOptions.current = [...props.responsiveOptions];
            responsiveOptions.current.sort((data1, data2) => {
                const value1 = data1.breakpoint;
                const value2 = data2.breakpoint;
                return ObjectUtils.sort(value1, value2, -1, PrimeReact.locale);
            });

            for (let i = 0; i < responsiveOptions.current.length; i++) {
                let res = responsiveOptions.current[i];

                innerHTML += `
                    @media screen and (max-width: ${res.breakpoint}) {
                        .p-galleria-thumbnail-items[${attributeSelector.current}] .p-galleria-thumbnail-item {
                            flex: 1 0 ${ (100/ res.numVisible) }%
                        }
                    }
                `
            }
        }

        thumbnailsStyle.current.innerHTML = innerHTML;
    }

    const calculatePosition = () => {
        if (itemsContainerRef.current && responsiveOptions.current) {
            let windowWidth = window.innerWidth;
            let matchedResponsiveData = {
                numVisible: props.numVisible
            };

            for (let i = 0; i < responsiveOptions.current.length; i++) {
                let res = responsiveOptions.current[i];

                if (parseInt(res.breakpoint, 10) >= windowWidth) {
                    matchedResponsiveData = res;
                }
            }

            if (numVisible !== matchedResponsiveData.numVisible) {
                setNumVisible(matchedResponsiveData.numVisible);
            }
        }
    }

    useEffect(() => {
        if (itemsContainerRef.current) {
            attributeSelector.current = UniqueComponentId();
            itemsContainerRef.current.setAttribute(attributeSelector.current, '');
        }

        createStyle();
        calculatePosition();
        bindWindowResize();
    }, []);

    const prevNumVisible = usePrevious(numVisible);
    const prevActiveItemIndex = usePrevious(props.activeItemIndex);

    useUpdateEffect(() => {
        let _totalShiftedItems = totalShiftedItems;

        if (prevNumVisible !== numVisible || prevActiveItemIndex !== props.activeItemIndex) {
            if (props.activeItemIndex <= getMedianItemIndex()) {
                _totalShiftedItems = 0;
            }
            else if (props.value.length - numVisible + getMedianItemIndex() < props.activeItemIndex) {
                _totalShiftedItems = numVisible - props.value.length;
            }
            else if (props.value.length - numVisible < props.activeItemIndex && numVisible % 2 === 0) {
                _totalShiftedItems = (props.activeItemIndex * -1) + getMedianItemIndex() + 1;
            }
            else {
                _totalShiftedItems = (props.activeItemIndex * -1) + getMedianItemIndex();
            }

            if (_totalShiftedItems !== totalShiftedItems) {
                setTotalShiftedItems(_totalShiftedItems);
            }

            itemsContainerRef.current.style.transform = props.isVertical ? `translate3d(0, ${_totalShiftedItems * (100/ numVisible)}%, 0)` : `translate3d(${_totalShiftedItems * (100/ numVisible)}%, 0, 0)`;

            if (prevActiveItemIndex !== props.activeItemIndex) {
                DomHandler.removeClass(itemsContainerRef.current, 'p-items-hidden');
                itemsContainerRef.current.style.transition = 'transform 500ms ease 0s';
            }
        }
    });

    const useItems = () => {
        return props.value.map((item, index) => {
                let firstIndex = totalShiftedItems * -1,
                lastIndex = firstIndex + numVisible - 1,
                isActive = firstIndex <= index && lastIndex >= index,
                start = firstIndex === index,
                end = lastIndex === index,
                current = props.activeItemIndex === index;

                return <GalleriaThumbnailItem key={index} index={index} template={props.itemTemplate} item={item} active={isActive} start={start} end={end}
                    onItemClick={onItemClick} current={current}/>
            });
    }

    const useBackwardNavigator = () => {
        if (props.showThumbnailNavigators) {
            let isDisabled = (!props.circular && props.activeItemIndex === 0) || (props.value.length <= numVisible);
            let buttonClassName = classNames('p-galleria-thumbnail-prev p-link', {
                'p-disabled': isDisabled
            }),
            iconClassName = classNames('p-galleria-thumbnail-prev-icon pi', {
                'pi-chevron-left': !props.isVertical,
                'pi-chevron-up': props.isVertical
            });

            return (
                <button className={buttonClassName} onClick={navBackward} disabled={isDisabled}>
                    <span className={iconClassName}></span>
                    <Ripple />
                </button>
            )
        }

        return null;
    }

    const useForwardNavigator = () => {
        if (props.showThumbnailNavigators) {
            let isDisabled = (!props.circular && props.activeItemIndex === (props.value.length - 1)) || (props.value.length <= numVisible);
            let buttonClassName = classNames('p-galleria-thumbnail-next p-link', {
                'p-disabled': isDisabled
            }),
            iconClassName = classNames('p-galleria-thumbnail-next-icon pi', {
                'pi-chevron-right': !props.isVertical,
                'pi-chevron-down': props.isVertical
            });

            return (
                <button className={buttonClassName} onClick={navForward} disabled={isDisabled}>
                    <span className={iconClassName}></span>
                    <Ripple />
                </button>
            )
        }

        return null;
    }

    const useContent = () => {
        const items = useItems();
        const height = props.isVertical ? props.contentHeight : '';
        const backwardNavigator = useBackwardNavigator();
        const forwardNavigator = useForwardNavigator();

        return (
            <div className="p-galleria-thumbnail-container">
                { backwardNavigator }
                <div className="p-galleria-thumbnail-items-container" style={{'height': height}}>
                    <div ref={itemsContainerRef} className="p-galleria-thumbnail-items" onTransitionEnd={onTransitionEnd}
                        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                        { items }
                    </div>
                </div>
                { forwardNavigator }
            </div>
        );
    }

    const content = useContent();

    return (
        <div className="p-galleria-thumbnail-wrapper">
            { content }
        </div>
    )
}))
