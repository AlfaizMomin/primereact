import React from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames, IconUtils } from '../utils/Utils';

export const Avatar = (props) => {

    const useContent = () => {
        if (props.label) {
            return <span className="p-avatar-text">{props.label}</span>;
        }
        else if (props.icon) {
            return IconUtils.getJSXIcon(props.icon, { className: 'p-avatar-icon' }, { props });
        }
        else if (props.image) {
            const onError = (e) => {
                if (props.onImageError) {
                    props.onImageError(e);
                }
            };

            return <img src={props.image} alt={props.imageAlt} onError={onError}></img>
        }

        return null;
    }

    const containerClassName = classNames('p-avatar p-component', {
        'p-avatar-image': props.image != null,
        'p-avatar-circle': props.shape === 'circle',
        'p-avatar-lg': props.size === 'large',
        'p-avatar-xl': props.size === 'xlarge',
        'p-avatar-clickable': !!props.onClick
    }, props.className);

    const content = props.template ? ObjectUtils.getJSXElement(props.template, props) : useContent();

    return (
        <div className={containerClassName} style={props.style} onClick={props.onClick}>
            {content}
            {props.children}
        </div>
    );
}

Avatar.defaultProps = {
    label: null,
    icon: null,
    image: null,
    size: 'normal',
    shape: 'square',
    style: null,
    className: null,
    template: null,
    imageAlt: 'avatar',
    onImageError: null,
    onClick: null
}

Avatar.propTypes = {
    label: PropTypes.string,
    icon: PropTypes.any,
    image: PropTypes.string,
    size: PropTypes.string,
    shape: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    template: PropTypes.any,
    imageAlt: PropTypes.string,
    onImageError: PropTypes.func,
    onClick: PropTypes.func
}
