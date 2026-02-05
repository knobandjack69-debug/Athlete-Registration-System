
import React from 'react';
import { Trash2, Edit2, User, ImageIcon } from 'lucide-react';
import { Athlete } from '../types.ts';

interface Props {
  athletes: Athlete[];
  onDelete: (athlete: Athlete) => void;
  onEdit: (athlete: Athlete) => void;
  isDeletingId: string | null;
  hideActions?: boolean;
}

const AthleteTable: React.FC<Props> = ({ athletes, onDelete, onEdit, isDeletingId, hideActions = false }) => {
  if (athletes.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400">
        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>ยังไม่พบข้อมูลนักกีฬาในระบบ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">No.</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">รูปภาพ</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อ - นามสกุล</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">ชั้น/เลขที่</th>
            {!hideActions && (
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">จัดการ</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {athletes.map((athlete, index) => (
            <tr key={athlete.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 text-center font-medium text-slate-400 text-sm">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mx-auto shadow-sm">
                  {athlete.photoUrl ? (
                    <img src={athlete.photoUrl} alt="Athlete" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=Ath&background=eee')} />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-300" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{athlete.firstName} {athlete.lastName}</div>
                <div className="text-[9px] text-slate-400 uppercase font-mono tracking-tighter">ID: {athlete.id}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded w-fit">ชั้น {athlete.level}</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-fit">เลขที่ {athlete.number}</span>
                </div>
              </td>
              {!hideActions && (
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(athlete)}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(athlete)}
                      disabled={isDeletingId === athlete.id}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      {isDeletingId === athlete.id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent animate-spin rounded-full" /> : <Trash2 className="w-4 h-4" />}
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
