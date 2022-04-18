import { createPortal } from 'react-dom';
import './Modal.styles.scss';

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const modalRoot = document.getElementById('modal-root') as HTMLElement;

export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  setOpen,
  children,
}) => {
  return createPortal(
    <div className="modal-container" onClick={() => setOpen(false)}>
      <div className="modal">{children}</div>
    </div>,
    modalRoot
  );
};
