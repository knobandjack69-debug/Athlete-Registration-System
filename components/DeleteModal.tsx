
import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting: boolean;
}

const DeleteModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, description, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-red-50 p-3 rounded-2xl text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
        
        <div className="bg-slate-50 p-6 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
