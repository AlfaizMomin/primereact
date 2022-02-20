import React, { memo } from 'react';
import { ObjectUtils, classNames } from '../utils/Utils';

export const SplitButtonItem = memo((props) => {

    const onClick = (e) => {
        if (props.menuitem.command) {
            props.menuitem.command({ originalEvent: e, item: props.menuitem });
        }

        if (props.onItemClick) {
            props.onItemClick(e);
        }

        e.preventDefault();
    }

    const useSeparator = () => {
        return (
            <li className="p-menu-separator" role="separator"></li>
        )
    }

    const useMenuitem = () => {
        let { disabled, icon, label, template, url, target } = props.menuitem;
        const className = classNames('p-menuitem-link', { 'p-disabled': disabled });
        const iconClassName = classNames('p-menuitem-icon', icon);
        icon = icon && <span className={iconClassName}></span>;
        label = label && <span className="p-menuitem-text">{label}</span>;
        let content = (
            <a href={url || '#'} role="menuitem" className={className} target={target} onClick={onClick}>
                {icon}
                {label}
            </a>
        );

        if (template) {
            const defaultContentOptions = {
                onClick,
                className,
                labelClassName: 'p-menuitem-text',
                iconClassName,
                element: content,
                props
            }

            content = ObjectUtils.getJSXElement(template, props.menuitem, defaultContentOptions);
        }

        return (
            <li className="p-menuitem" role="none">
                {content}
            </li>
        );
    }

    const useItem = () => {
        if (props.menuitem.separator) {
            return useSeparator();
        }

        return useMenuitem();
    }

    const item = useItem();

    return item;
})
