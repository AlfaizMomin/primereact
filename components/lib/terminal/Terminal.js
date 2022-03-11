import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { TerminalService } from '../terminalservice/TerminalService';
import { classNames } from '../utils/Utils';

export const Terminal = memo((props) => {
    const [commandText, setCommandText] = useState('');
    const [commands, setCommands] = useState([]);
    const [index, setIndex] = useState(0);
    const [emittedText, setEmittedText] = useState('');
    const elementRef = useRef(null);
    const inputRef = useRef(null);
    const isEmitted = useRef(false);

    const onClick = () => {
        inputRef.current.focus();
    }

    const onInputChange = (e) => {
        setCommandText(e.target.value);
    }

    const onInputKeyDown = (e) => {
        const code = e.which || e.keyCode;
        switch (code) {
            //up
            case 38:
                if (commands && commands.length) {
                    const prevIndex = index - 1 < 0 ? commands.length - 1 : index - 1;
                    const command = commands[prevIndex];

                    setIndex(prevIndex);
                    setCommandText(command.text);
                }
                break;

            //enter
            case 13:
                if (!!commandText) {
                    let newCommands = [...commands];

                    newCommands.push({ text: commandText });

                    setIndex((prevIndex) => prevIndex + 1);
                    setCommandText('');
                    setCommands(newCommands);
                    setEmittedText(commandText);
                    isEmitted.current = true;
                }

                break;

            default:
                break;
        }
    }

    useEffect(() => {
        const response = (res) => {
            if (commands && commands.length > 0) {
                let _commands = [...commands];
                _commands[_commands.length - 1].response = res;

                setCommands(_commands);
            }
        }

        const clear = () => {
            setCommands([]);
            setIndex(0);
        }

        TerminalService.on('response', response);
        TerminalService.on('clear', clear);

        return () => {
            TerminalService.off('response', response);
            TerminalService.off('clear', clear);
        }
    }, [commands]);

    useEffect(() => {
        if (isEmitted.current) {
            TerminalService.emit('command', emittedText);
            isEmitted.current = false;
        }

        elementRef.current.scrollTop = elementRef.current.scrollHeight;
    });

    const useWelcomeMessage = () => {
        if (props.welcomeMessage) {
            return <div>{props.welcomeMessage}</div>;
        }

        return null;
    }

    const useCommand = (command, index) => {
        const { text, response } = command;

        return (
            <div key={`${text}${index}`}>
                <span className="p-terminal-prompt">{props.prompt}&nbsp;</span>
                <span className="p-terminal-command">{text}</span>
                <div className="p-terminal-response">{response}</div>
            </div>
        )
    }

    const useContent = () => {
        const content = commands.map(useCommand);

        return (
            <div className="p-terminal-content">
                {content}
            </div>
        )
    }

    const usePromptContainer = () => {
        return (
            <div className="p-terminal-prompt-container">
                <span className="p-terminal-prompt">{props.prompt}&nbsp;</span>
                <input ref={inputRef} type="text" value={commandText} className="p-terminal-input"
                    autoComplete="off" onChange={onInputChange} onKeyDown={onInputKeyDown} />
            </div>
        )
    }

    const className = classNames('p-terminal p-component', props.className);
    const welcomeMessage = useWelcomeMessage();
    const content = useContent();
    const prompt = usePromptContainer();

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style} onClick={onClick}>
            {welcomeMessage}
            {content}
            {prompt}
        </div>
    )
})

Terminal.defaultProps = {
    id: null,
    style: null,
    className: null,
    welcomeMessage: null,
    prompt: null
}

Terminal.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    welcomeMessage: PropTypes.string,
    prompt: PropTypes.string
}
