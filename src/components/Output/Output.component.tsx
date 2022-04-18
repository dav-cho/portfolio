import { ReactComponent as LinkedInIcon } from '../../assets/linkedin.svg';
import { ReactComponent as GithubIcon } from '../../assets/github.svg';
import { ReactComponent as EmailIcon } from '../../assets/email.svg';
import './Output.styles.scss';

export const docHelp = `available commands:
    help
    list
    open [OPTIONS] [-h, --help]

usage:
    confirm <enter>
    clear <escape>
`;

export const docList = (
  <ul className="doclist">
    <li>
      <a
        href="https://www.linkedin.com/in/davcho"
        target="_blank"
        rel="noreferrer"
      >
        <LinkedInIcon className="linkedin" /> linkedin.com/in/davcho
      </a>
    </li>
    <li>
      <a href="https://github.com/dav-cho" target="_blank" rel="noreferrer">
        <GithubIcon className="github" /> github.com/dav-cho
      </a>
    </li>
    <li>
      <a href="mailto:dav@davcho.com" target="_blank" rel="noreferrer">
        <EmailIcon className="email" /> dav@davcho.com
      </a>
    </li>
  </ul>
);

export const docOpen = `usage: open [OPTIONS]

OPTIONS
    -l, --linkedin
    -g, --github
    -e, --email
`;

interface OutputProps {
  output: React.ReactNode;
}

export const Output = ({ output }: OutputProps) => {
  return (
    <div className="output">
      <pre>{output}</pre>
    </div>
  );
};
