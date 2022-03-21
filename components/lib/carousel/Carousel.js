import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, UniqueComponentId } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import PrimeReact from '../api/Api';
import { useResizeListener, useUpdateEffect, useUnmountEffect, usePrevious } from '../hooks/Hooks';

const CarouselItem = memo((props) => {
    const content = props.template(props.item);
    const itemClassName = classNames(props.className, 'p-carousel-item', {
        'p-carousel-item-active': props.active,
        'p-carousel-item-start': props.start,
        'p-carousel-item-end': props.end
    });

    return (
        <div className={itemClassName}>
            {content}
        </div>
    )
})

export const Carousel = memo((props) => {
    const [numVisible, setNumVisible] = useState(props.numVisible);
    const [numScroll, setNumScroll] = useState(props.numScroll);
    const [totalShiftedItems, setTotalShiftedItems] = useState((props.page * props.numScroll) * -1);
    const [page, setPage] = useState(props.page);
    const elementRef = useRef(null);
    const itemsContainerRef = useRef(null);
    const remainingItems = useRef(0);
    const allowAutoplay = useRef(!!props.autoplayInterval);
    const circular = useRef(props.circular || !!props.autoplayInterval);
    const attributeSelector = useRef('');
    const swipeThreshold = useRef(20);
    const startPos = useRef(null);
    const interval = useRef(null);
    const carouselStyle = useRef(null);
    const isRemainingItemsAdded = useRef(false);
    const responsiveOptions = useRef(null);
    const isVertical = props.orientation === 'vertical';
    const isCircular = circular && props.value.length >= numVisible;
    const isAutoplay = props.autoplayInterval && allowAutoplay.current;
    const currentPage = props.onPageChange ? props.page : page;
    const totalIndicators = props.value ? Math.ceil((props.value.length - numVisible) / numScroll) + 1 : 0;
    const prevNumScroll = usePrevious(numScroll);
    const prevNumVisible = usePrevious(numVisible);
    const prevValue = usePrevious(props.value);
    const prevPage = usePrevious(props.page);

    const [bindWindowResize, ] = useResizeListener({ listener: () => {
        calculatePosition();
    }, when: props.responsiveOptions });

    const step = (dir, _page) => {
        let _totalShiftedItems = totalShiftedItems;
        if (_page != null) {
            _totalShiftedItems = (numScroll * _page) * -1;

            if (isCircular) {
                _totalShiftedItems -= numVisible;
            }

            isRemainingItemsAdded.current = false;
        }
        else {
            _totalShiftedItems += (numScroll * dir);
            if (isRemainingItemsAdded.current) {
                _totalShiftedItems += remainingItems.current - (numScroll * dir);
                isRemainingItemsAdded.current = false;
            }

            let originalShiftedItems = isCircular ? (_totalShiftedItems + numVisible) : _totalShiftedItems;
            _page = Math.abs(Math.floor(originalShiftedItems / numScroll));
        }

        if (isCircular && page === (totalIndicators - 1) && dir === -1) {
            _totalShiftedItems = -1 * (props.value.length + numVisible);
            _page = 0;
        }
        else if (isCircular && page === 0 && dir === 1) {
            _totalShiftedItems = 0;
            _page = (_totalShiftedItems - 1);
        }
        else if (_page === (totalIndicators - 1) && remainingItems.current > 0) {
            _totalShiftedItems += ((remainingItems.current * -1) - (numScroll * dir));
            isRemainingItemsAdded.current = true;
        }

        if (itemsContainerRef.current) {
            DomHandler.removeClass(itemsContainerRef.current, 'p-items-hidden');
            changePosition(_totalShiftedItems);
            itemsContainerRef.current.style.transition = 'transform 500ms ease 0s';
        }

        if (props.onPageChange) {
            setTotalShiftedItems(_totalShiftedItems);
            props.onPageChange({
                page: _page
            })
        }
        else {
            setPage(_page);
            setTotalShiftedItems(_totalShiftedItems);
        }
    }

    const calculatePosition = () => {
        if (itemsContainerRef.current && responsiveOptions.current) {
            let windowWidth = window.innerWidth;
            let matchedResponsiveData = {
                numVisible: props.numVisible,
                numScroll: props.numScroll
            }

            for (let i = 0; i < responsiveOptions.current.length; i++) {
                let res = responsiveOptions.current[i];

                if (parseInt(res.breakpoint, 10) >= windowWidth) {
                    matchedResponsiveData = res;
                }
            }

            if (numScroll !== matchedResponsiveData.numScroll) {
                let _page = currentPage;
                _page = Math.floor((_page * numScroll) / matchedResponsiveData.numScroll);

                let _totalShiftedItems = (matchedResponsiveData.numScroll * _page) * -1;

                if (isCircular) {
                    _totalShiftedItems -= matchedResponsiveData.numVisible;
                }

                setTotalShiftedItems(_totalShiftedItems);
                setNumScroll(matchedResponsiveData.numScroll);

                if (props.onPageChange) {
                    props.onPageChange({
                        page: _page
                    })
                }
                else {
                    setPage(_page);
                }
            }

            if (numVisible !== matchedResponsiveData.numVisible) {
                setNumVisible(matchedResponsiveData.numVisible);
            }
        }
    }

    const navBackward = (e, _page) => {
        if (circular || currentPage !== 0) {
            step(1, _page);
        }

        allowAutoplay.current = false;
        if (e.cancelable) {
            e.preventDefault();
        }
    }

    const navForward = (e, _page) => {
        if (circular || currentPage < (totalIndicators - 1)) {
            step(-1, _page);
        }

        allowAutoplay.current = false;
        if (e.cancelable) {
            e.preventDefault();
        }
    }

   const onDotClick = (e, _page) => {
        if (_page > currentPage) {
            navForward(e, _page);
        }
        else if (_page < currentPage) {
            navBackward(e, _page);
        }
    }

    const onTransitionEnd = (e) => {
        if (itemsContainerRef.current && e.propertyName === 'transform') {
            DomHandler.addClass(itemsContainerRef.current, 'p-items-hidden');
            itemsContainerRef.current.style.transition = '';

            if ((page === 0 || page === (totalIndicators - 1)) && isCircular) {
                changePosition(totalShiftedItems);
            }
        }
    }

    const onTouchStart = (e) => {
        const touchobj = e.changedTouches[0];

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
        const touchobj = e.changedTouches[0];

        if (isVertical) {
            changePageOnTouch(e, (touchobj.pageY - startPos.current.y));
        }
        else {
            changePageOnTouch(e, (touchobj.pageX - startPos.current.x));
        }
    }

    const changePageOnTouch = (e, diff) => {
        if (Math.abs(diff) > swipeThreshold) {
            if (diff < 0) {           // left
                navForward(e);
            }
            else {                    // right
                navBackward(e);
            }
        }
    }

    const startAutoplay = () => {
        interval.current = setInterval(() => {
            if (page === (totalIndicators - 1)) {
                step(-1, 0);
            }
            else {
                step(-1, page + 1);
            }
        }, props.autoplayInterval);
    }

    const stopAutoplay = () => {
        if (interval.current) {
            clearInterval(interval.current);
        }
    }

    const createStyle = () => {
        if (!carouselStyle.current) {
            carouselStyle.current = DomHandler.createInlineStyle(PrimeReact.nonce);
        }

        let innerHTML = `
            .p-carousel[${attributeSelector.current}] .p-carousel-item {
                flex: 1 0 ${(100 / numVisible)}%
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
                        .p-carousel[${attributeSelector.current}] .p-carousel-item {
                            flex: 1 0 ${(100 / res.numVisible)}%
                        }
                    }
                `
            }
        }

        carouselStyle.current.innerHTML = innerHTML;
    }

    const changePosition = (_totalShiftedItems) => {
        if (itemsContainerRef.current) {
            itemsContainerRef.current.style.transform = isVertical ? `translate3d(0, ${_totalShiftedItems * (100 / numVisible)}%, 0)` : `translate3d(${_totalShiftedItems * (100 / numVisible)}%, 0, 0)`;
        }
    }

    useEffect(() => {
        if (elementRef.current) {
            attributeSelector.current = UniqueComponentId();
            elementRef.current.setAttribute(attributeSelector.current, '');
        }

        createStyle();
        calculatePosition();
        changePosition(totalShiftedItems);
        bindWindowResize();
    }, []);

    useUpdateEffect(() => {
        let stateChanged = false;
        let _totalShiftedItems = totalShiftedItems;

        if (props.autoplayInterval) {
            stopAutoplay();
        }

        if (prevNumScroll !== numScroll || prevNumVisible !== numVisible || (props.value && prevValue && prevValue.length !== props.value.length)) {
            remainingItems.current = (props.value.length - numVisible) % numScroll;

            let _page = currentPage;
            if (totalIndicators !== 0 && page >= totalIndicators) {
                _page = totalIndicators - 1;

                if (props.onPageChange) {
                    props.onPageChange({
                        page: _page
                    })
                }
                else {
                    setPage(_page);
                }

                stateChanged = true;
            }

            _totalShiftedItems = (page * numScroll) * -1;
            if (isCircular) {
                _totalShiftedItems -= numVisible;
            }

            if (page === (totalIndicators - 1) && remainingItems.current > 0) {
                _totalShiftedItems += (-1 * remainingItems.current) + numScroll;
                isRemainingItemsAdded.current = true;
            }
            else {
                isRemainingItemsAdded.current = false;
            }

            if (_totalShiftedItems !== totalShiftedItems) {
                setTotalShiftedItems(_totalShiftedItems);
                stateChanged = true;
            }

            changePosition(_totalShiftedItems);
        }

        if (isCircular) {
            if (page === 0) {
                _totalShiftedItems = -1 * numVisible;
            }
            else if (_totalShiftedItems === 0) {
                _totalShiftedItems = -1 * props.value.length;
                if (remainingItems.current > 0) {
                    isRemainingItemsAdded.current = true;
                }
            }

            if (_totalShiftedItems !== totalShiftedItems) {
                setTotalShiftedItems(_totalShiftedItems);
                stateChanged = true;
            }
        }

        if (prevPage !== props.page) {
            if (props.page > prevPage && props.page <= (totalIndicators - 1)) {
                step(-1, props.page);
            }
            else if (props.page < prevPage) {
                step(1, props.page);
            }
        }

        if (!stateChanged && isAutoplay) {
            startAutoplay();
        }
    });

    useUnmountEffect(() => {
        if (props.autoplayInterval) {
            stopAutoplay();
        }
    });

    const useItems = () => {
        if (props.value && props.value.length) {
            let clonedItemsForStarting = null;
            let clonedItemsForFinishing = null;

            if (isCircular) {
                let clonedElements = null;

                clonedElements = props.value.slice(-1 * numVisible);
                clonedItemsForStarting = clonedElements.map((item, index) => {
                    let isActive = (totalShiftedItems * -1) === (props.value.length + numVisible),
                        start = index === 0,
                        end = index === (clonedElements.length - 1);

                    return <CarouselItem key={index + '_scloned'} className="p-carousel-item-cloned" template={props.itemTemplate} item={item} active={isActive} start={start} end={end} />
                });

                clonedElements = props.value.slice(0, numVisible);
                clonedItemsForFinishing = clonedElements.map((item, index) => {
                    let isActive = totalShiftedItems === 0,
                        start = index === 0,
                        end = index === (clonedElements.length - 1);

                    return <CarouselItem key={index + '_fcloned'} className="p-carousel-item-cloned" template={props.itemTemplate} item={item} active={isActive} start={start} end={end} />
                });
            }

            let items = props.value.map((item, index) => {
                let firstIndex = isCircular ? (-1 * (totalShiftedItems + numVisible)) : (totalShiftedItems * -1),
                    lastIndex = firstIndex + numVisible - 1,
                    isActive = firstIndex <= index && lastIndex >= index,
                    start = firstIndex === index,
                    end = lastIndex === index;

                return <CarouselItem key={index} template={props.itemTemplate} item={item} active={isActive} start={start} end={end} />
            });

            return (
                <>
                    {clonedItemsForStarting}
                    {items}
                    {clonedItemsForFinishing}
                </>
            )
        }
    }

    const useHeader = () => {
        if (props.header) {
            return (
                <div className="p-carousel-header">
                    {props.header}
                </div>
            )
        }

        return null;
    }

    const useFooter = () => {
        if (props.footer) {
            return (
                <div className="p-carousel-footer">
                    {props.footer}
                </div>
            );
        }

        return null;
    }

    const useContent = () => {
        const items = useItems();
        const height = isVertical ? props.verticalViewPortHeight : 'auto';
        const backwardNavigator = useBackwardNavigator();
        const forwardNavigator = useForwardNavigator();
        const containerClassName = classNames('p-carousel-container', props.containerClassName);

        return (
            <div className={containerClassName}>
                {backwardNavigator}
                <div className="p-carousel-items-content" style={{ 'height': height }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <div ref={itemsContainerRef} className="p-carousel-items-container" onTransitionEnd={onTransitionEnd}>
                        {items}
                    </div>
                </div>
                {forwardNavigator}
            </div>
        )
    }

    const useBackwardNavigator = () => {
        let isDisabled = (!circular || (props.value && props.value.length < numVisible)) && currentPage === 0;
        let buttonClassName = classNames('p-carousel-prev p-link', {
            'p-disabled': isDisabled
        }),
        iconClassName = classNames('p-carousel-prev-icon pi', {
            'pi-chevron-left': !isVertical,
            'pi-chevron-up': isVertical
        });

        return (
            <button type="button" className={buttonClassName} onClick={navBackward} disabled={isDisabled}>
                <span className={iconClassName}></span>
                <Ripple />
            </button>
        )
    }

    const useForwardNavigator = () => {
        let isDisabled = (!circular || (props.value && props.value.length < numVisible)) && (currentPage === (totalIndicators - 1) || totalIndicators === 0);
        let buttonClassName = classNames('p-carousel-next p-link', {
            'p-disabled': isDisabled
        }),
        iconClassName = classNames('p-carousel-next-icon pi', {
            'pi-chevron-right': !isVertical,
            'pi-chevron-down': isVertical
        });

        return (
            <button type="button" className={buttonClassName} onClick={navForward} disabled={isDisabled}>
                <span className={iconClassName}></span>
                <Ripple />
            </button>
        )
    }

    const useIndicator = (index) => {
        let isActive = currentPage === index,
        indicatorItemClassName = classNames('p-carousel-indicator', {
            'p-highlight': isActive
        });

        return (
            <li className={indicatorItemClassName} key={'p-carousel-indicator-' + index}>
                <button type="button" className="p-link" onClick={(e) => onDotClick(e, index)}>
                    <Ripple />
                </button>
            </li>
        )
    }

    const useIndicators = () => {
        const indicatorsContentClassName = classNames('p-carousel-indicators p-reset', props.indicatorsContentClassName);
        let indicators = [];

        for (let i = 0; i < totalIndicators; i++) {
            indicators.push(useIndicator(i));
        }

        return (
            <ul className={indicatorsContentClassName}>
                {indicators}
            </ul>
        )
    }

    const className = classNames('p-carousel p-component', {
        'p-carousel-vertical': isVertical,
        'p-carousel-horizontal': !isVertical
    }, props.className);
    const contentClassName = classNames('p-carousel-content', props.contentClassName);

    const content = useContent();
    const indicators = useIndicators();
    const header = useHeader();
    const footer = useFooter();

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style}>
            {header}
            <div className={contentClassName}>
                {content}
                {indicators}
            </div>
            {footer}
        </div>
    )
})

Carousel.defaultProps = {
    __TYPE: 'Carousel',
    id: null,
    value: null,
    page: 0,
    header: null,
    footer: null,
    style: null,
    className: null,
    itemTemplate: null,
    circular: false,
    autoplayInterval: 0,
    numVisible: 1,
    numScroll: 1,
    responsiveOptions: null,
    orientation: "horizontal",
    verticalViewPortHeight: "300px",
    contentClassName: null,
    containerClassName: null,
    indicatorsContentClassName: null,
    onPageChange: null
}

Carousel.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    value: PropTypes.any,
    page: PropTypes.number,
    header: PropTypes.any,
    footer: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    itemTemplate: PropTypes.any,
    circular: PropTypes.bool,
    autoplayInterval: PropTypes.number,
    numVisible: PropTypes.number,
    numScroll: PropTypes.number,
    responsiveOptions: PropTypes.array,
    orientation: PropTypes.string,
    verticalViewPortHeight: PropTypes.string,
    contentClassName: PropTypes.string,
    containerClassName: PropTypes.string,
    indicatorsContentClassName: PropTypes.string,
    onPageChange: PropTypes.func
}
