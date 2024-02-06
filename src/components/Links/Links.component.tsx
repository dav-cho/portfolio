import { ReactComponent as LinkedInIcon } from '../../assets/linkedin.svg';
import { ReactComponent as GithubIcon } from '../../assets/github.svg';
// import { ReactComponent as EmailIcon } from '../../assets/email.svg';
import './Links.styles.scss';

export const Links = () => {
  return (
    <div className="links">
      <div className="link">
        <a
          href="https://www.linkedin.com/in/davcho"
          title="linkedin"
          target="_blank"
          rel="noreferrer"
        >
          <LinkedInIcon className="linkedin" />
        </a>
      </div>
      <div className="link">
        <a
          href="https://github.com/dav-cho"
          title="github"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon className="github" />
        </a>
      </div>
      {/*
      <div className="link">
        <a
          href="mailto:dav@davcho.com"
          title="email"
          target="_blank"
          rel="noreferrer"
        >
          <EmailIcon className="email" />
        </a>
      </div>
      */}
    </div>
  );
};
