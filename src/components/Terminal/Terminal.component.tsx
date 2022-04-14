import { useState, useEffect, useRef } from "react";
import { Prompt } from "../Prompt/Prompt.component";
import { docHelp, docList, docOpen } from "./outputs";
import "./Terminal.styles.scss";

type Command = "help" | "list" | "open";

type Flag =
  | "-h"
  | "--help"
  | "-l"
  | "--linkedin"
  | "-g"
  | "--github"
  | "-e"
  | "--email";

const commandList = () => {
  //
};

const commandOpen = (flag?: Flag) => {
  //
};

export const Terminal = () => {
  const inputEl = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string | Command>("");
  const [output, setOutput] = useState<string | any[]>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleBlur = () => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  };

  useEffect(() => {
    handleBlur();
  }, []);

  const errorCommand = (command: Command) => {
    setOutput(`Error: Could not find command ${command}`);
  };

  const processCommand = () => {
    const commands: Command[] = ["help", "list", "open"];
    const flags: Flag[] = [
      "-l",
      "--linkedin",
      "-g",
      "--github",
      "-e",
      "--email",
    ];

    const [command, flag] = input.split(" ") as [Command, Flag];
    console.log("~ command:", command);
    console.log("~ flag:", flag);

    if (!commands.includes(command)) {
      errorCommand(command);
      return;
    }
    if (flag && !flags.includes(flag)) {
      setOutput(`Error: Invalid flag ${flag}`);
    }

    switch (command) {
      case "help":
        setOutput(docHelp);
        break;
      case "list":
        break;
      case "open":
        if (flag) {
          switch (flag) {
            case "-l" || "--linkedin":
              break;
            case "-g" || "--github":
              break;
            case "-e" || "--email":
              break;
            default:
              console.log("~ open command needs flag");
          }
        } else {
        }
        break;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
        // setInput('');
        processCommand();
        break;
      case "Escape":
        setInput("");
        setOutput("");
        break;
    }
  };

  return (
    <>
      <div className="terminal">
        <Prompt input={input} />
        <div className="output">
          <pre>{output}</pre>
        </div>
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
