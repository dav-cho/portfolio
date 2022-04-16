import { useState, useEffect, useRef } from 'react';
import { Prompt } from '../Prompt/Prompt.component';
import { Output, docHelp, docList, docOpen } from '../Output/Output.component';
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
  const [output, setOutput] = useState<string | JSX.Element>('');
  const [pos, setPos] = useState<number>(0);

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

  useEffect(() => {
    setPos(prev => {
      if (prevInput.length === input.length - 1) {
        console.log('~ prevInput.length + 1 === input.length');
        return ++prev;
      } else if (prevInput.length === input.length + 1) {
        for (let i = 0; i < input.length; i++) {
          if (prevInput[i] !== input[i]) {
            return i;
          }

          return --prev;
        }
      }

      return 0;
    });
  }, [input, prevInput]);

  const processOpen = (flag?: Flag) => {
    switch (flag) {
      case '-l':
      case '--linkedin':
        window.open('https://www.linkedin.com/in/davcho', '_blank');
        break;
      case '-g':
      case '--github':
        window.open('https://github.com/dav-cho', '_blank');
        break;
      case '-e':
      case '--email':
        window.open('mailto:dav@davcho.com', '_blank');
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
    switch (event.key) {
      case 'Enter':
        processCommand();
        setInput('');
        setPos(0);
        break;
      case 'Escape':
        setInput('');
        setOutput('');
        setPos(0);
        break;
      case 'ArrowLeft':
        setPos(prev => (prev - 1 < 0 ? 0 : --prev));
        break;
      case 'ArrowRight':
        setPos(prev => (prev + 1 > input.length ? input.length : ++prev));
        break;
      // case 'Backspace':
      //   console.log('~ backspace');
      //   break;
      case 'Delete':
        setPos(prev => ++prev);
        break;
    }
  };

  return (
    <>
      <div className="terminal">
        <Prompt input={input} pos={pos} />
        <Output output={output} />
      </div>

      <input
        className="hidden-input"
        ref={inputEl}
        value={input}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};
