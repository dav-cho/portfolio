import { useState, useEffect } from 'react';
import './Prompt.styles.scss';

interface PromptProps {
  input: string;
  pos: number;
}

export const Prompt: React.FC<PromptProps> = ({ input, pos }) => {
  const [left, setLeft] = useState<string>('');
  const [cursor, setCursor] = useState<JSX.Element | null>(<>&nbsp;</>);
  const [right, setRight] = useState<string | null>('');

  useEffect(() => {
    setLeft(input.slice(0, pos));
    setCursor(() => {
      if ((!input.length && pos === 0) || pos === input.length) {
        return <>&nbsp;</>;
      }

      return <>{input.slice(pos, pos + 1)}</>;
    });
    setRight(pos < input.length ? input.slice(pos + 1) : null);
  }, [input, pos]);

  return (
    <div className="prompt">
      <span className="prefix">{'>'}</span>
      <span className="prompt-left">{left}</span>
      <span className="cursor">{cursor}</span>
      <span className="prompt-right">{right}</span>
    </div>
  );
};
