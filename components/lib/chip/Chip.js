import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, ObjectUtils, IconUtils } from '../utils/Utils';

export const Chip = memo((props) => {
    const [visible, setVisible] = useState(true);

    const onKeyDown = (event) => {
        if (event.keyCode === 13) { // enter
            close(event);
        }
    }

    const close = (event) => {
        setVisible(false);

        if (props.onRemove) {
            props.onRemove(event);
        }
    }

    const useContent = () => {
        let content = [];

        if (props.image) {
            const onError = (e) => {
                if (props.onImageError) {
                    props.onImageError(e);
                }
            }

            content.push(<img key="image" src={props.image} alt={props.imageAlt} onError={onError}></img>);
        }
        else if (props.icon) {
            content.push(IconUtils.getJSXIcon(props.icon, { key: 'icon', className: 'p-chip-icon' }, { props }));
        }

        if (props.label) {
            content.push(<span key="label" className="p-chip-text">{props.label}</span>);
        }

        if (props.removable) {
            content.push(IconUtils.getJSXIcon(props.removeIcon, { key: 'removeIcon', tabIndex: 0, className: 'p-chip-remove-icon', onClick: close, onKeyDown }, { props }));
        }

        return content;
    }

    const useElement = () => {
        const containerClassName = classNames('p-chip p-component', {
            'p-chip-image': props.image != null
        }, props.className);

        const content = props.template ? ObjectUtils.getJSXElement(props.template, props) : useContent();

        return (
            <div className={containerClassName} style={props.style}>
                {content}
            </div>
        )
    }

    return visible && useElement();
});

Chip.defaultProps = {
    label: null,
    icon: null,
    image: null,
    removable: false,
    removeIcon: 'pi pi-times-circle',
    className: null,
    style: null,
    template: null,
    imageAlt: 'chip',
    onImageError: null,
    onRemove: null
}

Chip.propTypes = {
    label: PropTypes.string,
    icon: PropTypes.any,
    image: PropTypes.string,
    removable: PropTypes.bool,
    removeIcon: PropTypes.any,
    className: PropTypes.string,
    style: PropTypes.object,
    template: PropTypes.any,
    imageAlt: PropTypes.string,
    onImageError: PropTypes.func,
    onRemove: PropTypes.func
}
