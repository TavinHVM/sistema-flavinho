import React from "react";

interface ToastProps {
  toast: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`fixed top-6 left-1/2 z-50 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      style={{ minWidth: 220 }}
    >
      <span>{toast.message}</span>
      <button className="ml-4 text-white font-bold" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
