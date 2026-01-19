import React from 'react';
import '../../styles/Modal.css';

const Modal = ({ friend, onClose }) => {
  return (
    <div className="modal-container">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>
          X
        </button>
        {friend.videoUrl ? (
          <video controls src={friend.videoUrl} />
        ) : (
          <p>Geen video.</p>
        )}
      </div>
    </div>
  );
};

export default Modal;