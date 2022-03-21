import React from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';

export const BreadCrumb = (props) => {

    const itemClick = (event, item) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if (!item.url) {
            event.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: event,
                item
            });
        }
    }

    const useHome = () => {
        const home = props.home;

        if (home) {
            const { icon, target, url, disabled, style, className: _className } = home;
            const className = classNames('p-breadcrumb-home', { 'p-disabled': disabled }, _className);
            const iconClassName = classNames('p-menuitem-icon', icon);

            return (
                <li className={className} style={style}>
                    <a href={url || '#'} className="p-menuitem-link" aria-disabled={disabled} target={target} onClick={(event) => itemClick(event, home)}>
                        <span className={iconClassName}></span>
                    </a>
                </li>
            )
        }

        return null;
    }

    const useSeparator = () => {
        return (
            <li className="p-breadcrumb-chevron pi pi-chevron-right"></li>
        )
    }

    const useMenuitem = (item) => {
        const className = classNames(item.className, { 'p-disabled': item.disabled });
        const label = item.label && <span className="p-menuitem-text">{item.label}</span>;
        let content = (
            <a href={item.url || '#'} className="p-menuitem-link" target={item.target} onClick={(event) => itemClick(event, item)} aria-disabled={item.disabled}>
                {label}
            </a>
        );

        if (item.template) {
            const defaultContentOptions = {
                onClick: (event) => itemClick(event, item),
                className: 'p-menuitem-link',
                labelClassName: 'p-menuitem-text',
                element: content,
                props
            }

            content = ObjectUtils.getJSXElement(item.template, item, defaultContentOptions);
        }

        return (
            <li className={className} style={item.style}>
                {content}
            </li>
        )
    }

    const useMenuitems = () => {
        if (props.model) {
            const items = props.model.map((item, index) => {
                const menuitem = useMenuitem(item);
                const separator = (index === props.model.length - 1) ? null : useSeparator();

                return (
                    <React.Fragment key={item.label + '_' + index}>
                        {menuitem}
                        {separator}
                    </React.Fragment>
                );
            });

            return items;
        }

        return null;
    }

    const className = classNames('p-breadcrumb p-component', props.className);
    const home = useHome();
    const items = useMenuitems();
    const separator = useSeparator();

    return (
        <nav id={props.id} className={className} style={props.style} aria-label="Breadcrumb">
            <ul>
                {home}
                {separator}
                {items}
            </ul>
        </nav>
    )
}

BreadCrumb.defaultProps = {
    __TYPE: 'BreadCrumb',
    id: null,
    model: null,
    home: null,
    style: null,
    className: null
}

BreadCrumb.propTypes = {
    __TYPE: PropTypes.string,
    id: PropTypes.string,
    model: PropTypes.array,
    home: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string
}
