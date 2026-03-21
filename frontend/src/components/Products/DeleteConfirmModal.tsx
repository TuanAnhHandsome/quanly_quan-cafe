import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import './DeleteConfirmModal.css';

interface Props {
  productName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<Props> = ({ productName, onCancel, onConfirm }) => (
  <div className="dc-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
    <div className="dc-modal">
      <button className="dc-close" onClick={onCancel}>
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <div className="dc-icon-wrap">
        <FontAwesomeIcon icon={faTriangleExclamation} className="dc-icon" />
      </div>

      <h3 className="dc-title">Xác nhận xoá</h3>
      <p className="dc-desc">
        Bạn có chắc muốn xoá sản phẩm <strong>"{productName}"</strong>?<br />
        Hành động này không thể hoàn tác.
      </p>

      <div className="dc-actions">
        <button className="dc-btn-cancel" onClick={onCancel}>Huỷ bỏ</button>
        <button className="dc-btn-confirm" onClick={onConfirm}>Xoá</button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;
