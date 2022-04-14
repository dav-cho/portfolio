import { useState } from "react";
import "./Prompt.styles.scss";

interface PromptProps {
  input: string;
}

export const Prompt: React.FC<PromptProps> = ({ input }) => {
  const [left, setLeft] = useState<string>("");
  const [right, setRight] = useState<string>("");

  return (
    <div className="prompt">
      <span className="prompt-left">{input}</span>
      <span className="prompt-right">{input}</span>
    </div>
  );
};
