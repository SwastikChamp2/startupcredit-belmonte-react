import React from 'react';

const SubmissionModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="submission-modal-overlay">
      <div className="submission-modal-content fade-in">
        <div className={`submission-modal-icon ${type}`}>
          {type === 'success' ? (
            <i className="fa-solid fa-circle-check"></i>
          ) : (
            <i className="fa-solid fa-circle-exclamation"></i>
          )}
        </div>
        <h3 className="submission-modal-title">{title}</h3>
        <p className="submission-modal-message">{message}</p>
        <button className="submission-modal-btn" onClick={onClose}>
          CONTINUE
        </button>
      </div>
      <style>{`
        .submission-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
        }
        .submission-modal-content {
          background: white;
          padding: 40px;
          border-radius: 24px;
          max-width: 440px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .submission-modal-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .submission-modal-icon.success {
          color: #1769e8;
        }
        .submission-modal-icon.error {
          color: #ef4444;
        }
        .submission-modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .submission-modal-message {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .submission-modal-btn {
          background: #1769e8;
          color: white;
          border: none;
          padding: 14px 40px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .submission-modal-btn:hover {
          background: #1254ba;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(23, 105, 232, 0.3);
        }
        .submission-modal-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default SubmissionModal;
