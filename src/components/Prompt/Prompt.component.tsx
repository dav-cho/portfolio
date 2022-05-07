import { useState, useEffect } from 'react';
import './Prompt.styles.scss';

interface PromptProps {
  input: string;
  pos: number;
}

export const Prompt = ({ input, pos }: PromptProps) => {
  const [left, setLeft] = useState<string>('');
  const [cursor, setCursor] = useState<React.ReactNode>(<>&nbsp;</>);
  const [right, setRight] = useState<React.ReactNode>('');
  const [cursorStyle, setCursorStyle] = useState<string>('');

  // TODO: Fix delete with extra whitespace behavior
  useEffect(() => {
    setLeft(input.slice(0, pos));

    setCursor(() => {
      const checkPosZeroAndEmptyString = !input.length && pos === 0;
      const checkPosEnd = pos === input.length;

      if (checkPosZeroAndEmptyString || checkPosEnd) {
        return <>&nbsp;</>;
      }

      return <>{input.slice(pos, pos + 1)}</>;
    });

    setRight(pos === input.length ? null : <>{input.slice(pos + 1)}&nbsp;</>);
  }, [input, pos]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorStyle(prev => prev === '' ? 'inverted' : '');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="prompt">
      <span className="prompt-left">{left}</span>
      <span className={cursorStyle}>{cursor}</span>
      <span className="prompt-right">{right}</span>
    </div>
  );
};
