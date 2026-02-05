
import React from 'react';
import { Trash2, Edit2, User, ImageIcon, Printer } from 'lucide-react';
import { Athlete } from '../types.ts';

interface Props {
  athletes: Athlete[];
  onDelete: (athlete: Athlete) => void;
  onEdit: (athlete: Athlete) => void;
  onPrint: (athlete: Athlete) => void;
  isDeletingId: string | null;
  hideActions?: boolean;
}

const AthleteTable: React.FC<Props> = ({ athletes, onDelete, onEdit, onPrint, isDeletingId, hideActions = false }) => {
  if (athletes.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-slate-400 font-black text-lg">ไม่พบรายชื่อนักกีฬาในขณะนี้</p>
        <p className="text-slate-300 text-sm mt-1">เริ่มลงทะเบียนใหม่ได้ที่เมนู "ลงทะเบียนใหม่"</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-20">ลำดับ</th>
            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-24">รูปถ่าย</th>
            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล</th>
            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32">ระดับชั้น</th>
            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">เลขที่</th>
            {!hideActions && (
              <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">เครื่องมือ</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {athletes.map((athlete, index) => (
            <tr key={athlete.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-8 py-5 text-center">
                <span className="font-bold text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
              </td>
              <td className="px-8 py-5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md mx-auto group-hover:scale-110 transition-transform bg-slate-50">
                  {athlete.photoUrl ? (
                    <img 
                      src={athlete.photoUrl} 
                      className="w-full h-full object-cover" 
                      alt="Athlete"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><User className="w-6 h-6" /></div>
                  )}
                </div>
              </td>
              <td className="px-8 py-5">
                <div className="font-black text-slate-800">{athlete.firstName} {athlete.lastName}</div>
                <div className="text-[10px] font-mono text-slate-400">ID: {athlete.id.toUpperCase()}</div>
              </td>
              <td className="px-8 py-5">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-black">ชั้น {athlete.level}</span>
              </td>
              <td className="px-8 py-5 text-center">
                <span className="text-blue-600 font-black">{athlete.number}</span>
              </td>
              {!hideActions && (
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onPrint(athlete)} title="พิมพ์บัตร" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-90">
                      <Printer className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={() => onEdit(athlete)} title="แก้ไข" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all active:scale-90">
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <div className="w-px h-6 bg-slate-100 mx-1" />
                    <button onClick={() => onDelete(athlete)} disabled={isDeletingId === athlete.id} className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30">
                      {isDeletingId === athlete.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthleteTable;
