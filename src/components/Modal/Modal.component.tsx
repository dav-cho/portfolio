import { createPortal } from 'react-dom';
import './Modal.styles.scss';

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalClasses: string;
  handleClose: () => void;
}

const modalRoot = document.getElementById('modal-root') as HTMLElement;

export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  modalClasses,
  handleClose,
  children,
}) => {
  return createPortal(
    <div className={modalClasses} onClick={handleClose}>
      <div className="modal">{children}</div>
    </div>,
    modalRoot
  );
};
