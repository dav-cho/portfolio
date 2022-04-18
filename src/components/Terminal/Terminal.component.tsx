import { useState, useEffect, useRef } from 'react';
import { Prompt } from '../Prompt/Prompt.component';
import { Output, docHelp, docList, docOpen } from '../Output/Output.component';
import { Modal } from '../Modal/Modal.component';
import './Terminal.styles.scss';

type Command = 'help' | 'list' | 'open';

type Flag =
  | '-h'
  | '--help'
  | '-l'
  | '--linkedin'
  | '-g'
  | '--github'
  | '-e'
  | '--email'
  | '-h'
  | '--help';

export const Terminal = () => {
  const inputEl = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>('');
  const [prevInput, setPrevInput] = useState<string>('');
  const [output, setOutput] = useState<React.ReactNode>('');
  const [pos, setPos] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const handleBlur = () => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  };

  useEffect(() => {
    handleBlur();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrevInput(input);
    setInput(event.target.value);
  };

  const moveCursor = () => {
    setPos(prev => {
      if (prevInput.length + 1 === input.length) {
        return ++prev;
      } else if (prevInput.length - 1 === input.length) {
        for (let i = 0; i < input.length; i++) {
          if (prevInput[i] !== input[i]) {
            return i;
          }
        }
      }

      return 0;
    });
  };

  const checkCursorBounds = () => {
    if (pos < 0) {
      setPos(0);
    }

    if (pos > input.length) {
      setPos(input.length);
    }
  };

  useEffect(moveCursor, [input, prevInput]);
  useEffect(checkCursorBounds, [input.length, pos]);

  const moveArrow = (dir: 'left' | 'right') => {
    if (dir === 'left') {
      setPos(prev => (prev - 1 < 0 ? 0 : --prev));
    }

    if (dir === 'right') {
      setPos(prev => (prev + 1 > input.length ? input.length : ++prev));
    }
  };

  const openURL = (url: 'linkedin' | 'github' | 'email') => {
    const URLs = {
      linkedin: 'https://www.linkedin.com/in/davcho',
      github: 'https://github.com/dav-cho',
      email: 'mailto:dav@davcho.com',
    };

    window.open(URLs[url], '_blank');
    setOpen(false);
  };

  const processOpen = (flag?: Flag) => {
    switch (flag) {
      case '-l':
      case '--linkedin':
        openURL('linkedin');
        break;
      case '-g':
      case '--github':
        openURL('github');
        break;
      case '-e':
      case '--email':
        openURL('email');
        break;
      case '-h':
      case '--help':
        setOutput(docOpen);
        break;
      case undefined:
        setOutput("'open' command requires a flag");
        break;
      default:
        setOutput(`Error: Could not find flag '${flag}'`);
    }
  };

  const processCommand = () => {
    setOpen(prev => !prev);
    setInput('');
    setPos(0);

    const commands: Command[] = ['help', 'list', 'open'];
    const [command, flag] = input.split(' ') as [Command, Flag];

    if (!commands.includes(command)) {
      setOutput(`Error: Could not find command '${command}'`);
      return;
    }
    if (command !== 'open' && flag) {
      setOutput(`Error: Invalid option '${flag}' for command '${command}'`);
      return;
    }

    switch (command) {
      case 'help':
        setOutput(docHelp);
        break;
      case 'list':
        setOutput(docList);
        break;
      case 'open':
        processOpen(flag);
        break;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: add q to quit?
    switch (event.key) {
      case 'Enter':
        processCommand();
        break;
      case 'Escape':
        setOpen(false);
        setInput('');
        setOutput('');
        setPos(0);
        break;
      case 'Delete':
        setPos(prev => ++prev);
        break;
      case 'ArrowLeft':
        if (event.altKey || event.metaKey) {
          event.preventDefault();
        }

        moveArrow('left');
        break;
      case 'ArrowRight':
        if (event.altKey || event.metaKey) {
          event.preventDefault();
        }

        moveArrow('right');
        break;
    }
  };

  return (
    <>
      <div className="terminal">
        <Prompt input={input} pos={pos} />
      </div>

      {open && (
        <Modal setOpen={setOpen}>
          <Output output={output} />
        </Modal>
      )}

      <input
        className="hidden-input"
        ref={inputEl}
        value={input}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck="false"
      />
    </>
  );
};
