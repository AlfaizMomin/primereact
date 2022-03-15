import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, ObjectUtils } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const Dock = memo((props) => {
    const [currentIndex, setCurrentIndex] = useState(-3);

    const onListMouseLeave = () => {
        setCurrentIndex(-3);
    }

    const onItemMouseEnter = (index) => {
        setCurrentIndex(index);
    }

    const onItemClick = (e, item) => {
        if (item.command) {
            item.command({ originalEvent: e, item });
        }

        e.preventDefault();
    }

    const useItem = (item, index) => {
        const { disabled, icon: _icon, label, template, url, target } = item;
        const className = classNames('p-dock-item', {
            'p-dock-item-second-prev': (currentIndex - 2) === index,
            'p-dock-item-prev': (currentIndex - 1) === index,
            'p-dock-item-current': currentIndex === index,
            'p-dock-item-next': (currentIndex + 1) === index,
            'p-dock-item-second-next': (currentIndex + 2) === index
        });
        const contentClassName = classNames('p-dock-action', { 'p-disabled': disabled });
        const iconClassName = classNames('p-dock-action-icon', _icon);
        const icon = typeof _icon === 'string' ? <span className={iconClassName}></span> : ObjectUtils.getJSXElement(_icon, props);

        let content = (
            <a href={url || '#'} role="menuitem" className={contentClassName} target={target} data-pr-tooltip={label} onClick={(e) => onItemClick(e, item)}>
                {icon}
                <Ripple />
            </a>
        );

        if (template) {
            const defaultContentOptions = {
                onClick: (e) => onItemClick(e, item),
                className: contentClassName,
                iconClassName,
                element: content,
                props,
                index
            };

            content = ObjectUtils.getJSXElement(template, item, defaultContentOptions);
        }

        return (
            <li key={index} className={className} role="none" onMouseEnter={() => onItemMouseEnter(index)}>
                {content}
            </li>
        )
    }

    const useItems = () => {
        if (props.model) {
            return props.model.map((item, index) => useItem(item, index));
        }

        return null;
    }

    const useHeader = () => {
        if (props.header) {
            return (
                <div className="p-dock-header">
                    {ObjectUtils.getJSXElement(props.header, { props })}
                </div>
            )
        }

        return null;
    }

    const useList = () => {
        const items = useItems();

        return (
            <ul className="p-dock-list" role="menu" onMouseLeave={onListMouseLeave}>
                {items}
            </ul>
        )
    }

    const useFooter = () => {
        if (props.footer) {
            return (
                <div className="p-dock-footer">
                    {ObjectUtils.getJSXElement(props.footer, { props })}
                </div>
            )
        }

        return null;
    }

    const className = classNames(`p-dock p-component p-dock-${props.position}`, {
        'p-dock-magnification': props.magnification
    }, props.className);
    const header = useHeader();
    const list = useList();
    const footer = useFooter();

    return (
        <div id={props.id} className={className} style={props.style}>
            <div className="p-dock-container">
                {header}
                {list}
                {footer}
            </div>
        </div>
    )
});

Dock.defaultProps = {
    id: null,
    style: null,
    className: null,
    model: null,
    position: 'bottom',
    magnification: true,
    header: null,
    footer: null
}

Dock.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    model: PropTypes.array,
    position: PropTypes.string,
    magnification: PropTypes.bool,
    header: PropTypes.any,
    footer: PropTypes.any
}
