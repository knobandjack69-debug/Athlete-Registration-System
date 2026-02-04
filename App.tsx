import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserPlus, Printer, User, Edit3, CheckCircle2, Loader2, RefreshCw, AlertTriangle, X, ChevronLeft } from 'lucide-react';
import { Athlete, AthleteFormData } from './types';
import RegistrationForm from './components/RegistrationForm';
import AthleteTable from './components/AthleteTable';
import { athleteService } from './athleteService';

const App: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);

  const LOGO_URL = "https://img5.pic.in.th/file/secure-sv1/logo_small_index.png";

  const fetchAthletes = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await athleteService.getAthletes();
      setAthletes(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  const handleFormSubmit = useCallback(async (data: AthleteFormData) => {
    setIsSubmitting(true);
    const previousAthletes = [...athletes];
    
    if (!editingAthlete) {
      const tempId = `temp-${Date.now()}`;
      const optimisticNewAthlete: Athlete = { 
        ...data, 
        id: tempId, 
        createdAt: Date.now() 
      };
      setAthletes(prev => [optimisticNewAthlete, ...prev]);
    } else {
      const updatedAthletes = athletes.map(a => 
        a.id === editingAthlete.id ? { ...a, ...data } : a
      );
      setAthletes(updatedAthletes);
    }

    try {
      let result;
      if (editingAthlete) {
        result = await athleteService.updateAthlete(editingAthlete.id, data);
        setToastMessage('อัปเดตข้อมูลสำเร็จ');
      } else {
        result = await athleteService.registerAthlete(data);
        setToastMessage('ลงทะเบียนสำเร็จ');
      }

      if (result.success) {
        setShowSuccessToast(true);
        setEditingAthlete(null);
        setTimeout(() => setShowSuccessToast(false), 3000);
        await fetchAthletes(true); 
      } else {
        setAthletes(previousAthletes);
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'ไม่สามารถบันทึกได้'));
      }
    } catch (err) {
      setAthletes(previousAthletes);
      alert('การเชื่อมต่อล้มเหลว ระบบจะย้อนข้อมูลกลับ');
    } finally {
      setIsSubmitting(false);
    }
  }, [athletes, editingAthlete, fetchAthletes]);

  const confirmDelete = async () => {
    if (!athleteToDelete) return;
    
    const idToDelete = String(athleteToDelete.id).trim();
    const previousAthletes = [...athletes];
    
    // --- STEP 1: UI OPTIMISTIC REMOVE ---
    setAthletes(prev => prev.filter(a => String(a.id).trim() !== idToDelete));
    setIsDeletingId(idToDelete);
    setAthleteToDelete(null);

    try {
      // --- STEP 2: CALL SERVER ---
      const result = await athleteService.deleteAthlete(idToDelete);
      
      if (result.success) {
        setToastMessage('ลบข้อมูลเรียบร้อยแล้ว');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2000);
        // Sync check after successful deletion
        await fetchAthletes(true);
      } else {
        // --- STEP 3: ROLLBACK ON FAILURE ---
        setAthletes(previousAthletes);
        alert('ลบไม่สำเร็จ: ' + (result.error || 'ไม่พบข้อมูลในระบบ'));
      }
    } catch (err) {
      // --- STEP 4: ROLLBACK ON ERROR ---
      setAthletes(previousAthletes);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบ ข้อมูลถูกกู้คืน');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEditAthlete = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-slate-200 py-10 font-['Sarabun']">
        <div className="fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-50 no-print shadow-2xl">
          <button 
            onClick={() => setIsPrintPreview(false)}
            className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>กลับไปหน้าหลัก</span>
          </button>
          <div className="text-sm font-medium text-slate-400">ตัวอย่างก่อนพิมพ์ (A4 Portrait)</div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-all font-black shadow-lg shadow-blue-900/20"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>

        <div className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] p-[20mm] min-h-[297mm] mt-10">
          <div className="mb-10 text-center border-b-4 border-slate-900 pb-8">
            <div className="flex justify-between items-center mb-8">
              <img src={LOGO_URL} alt="Logo" className="h-24 w-auto" />
              <div className="text-right">
                <h1 className="text-3xl font-black text-slate-900 mb-1 leading-tight">รายงานรายชื่อนักกีฬา</h1>
                <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">Athlete Registration Report</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">รายละเอียดหน่วยงาน</p>
                <p className="text-sm font-bold text-slate-700">หน่วยงาน: ชมรมกรีฑาและกีฬา</p>
                <p className="text-sm text-slate-500">สถานะ: ข้อมูลสรุปปัจจุบัน</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">สรุปข้อมูล</p>
                <p className="text-sm font-bold text-slate-700">จำนวนทั้งหมด: {athletes.length} คน</p>
                <p className="text-[10px] text-slate-500 mt-1">วันที่พิมพ์: {new Date().toLocaleString('th-TH')}</p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <AthleteTable 
              athletes={athletes} 
              onDelete={() => {}} 
              onEdit={() => {}} 
              isDeletingId={null}
              hideActions={true} 
            />
          </div>

          <div className="mt-20">
             <div className="flex justify-between items-center text-sm border-t-2 border-slate-100 pt-10">
                <div className="text-center w-64">
                  <div className="h-20"></div>
                  <p className="font-bold">(....................................................)</p>
                  <p className="mt-2 text-slate-500 font-medium">ผู้จัดทำรายงาน / เจ้าหน้าที่</p>
                </div>
                <div className="text-center w-64">
                  <div className="h-20"></div>
                  <p className="font-bold">(....................................................)</p>
                  <p className="mt-2 text-slate-500 font-medium">ผู้ตรวจสอบ / ครูผู้ควบคุม</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Sarabun'] relative">
      {(isSubmitting || isDeletingId) && (
        <div className="fixed top-0 left-0 w-full h-1 z-[60] no-print">
          <div className="h-full bg-blue-500 animate-[shimmer_1.5s_infinite] w-full origin-left bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-[length:200%_100%]"></div>
        </div>
      )}

      {athleteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                คุณต้องการลบข้อมูลของ <span className="font-bold text-slate-800">{athleteToDelete.firstName} {athleteToDelete.lastName}</span> ใช่หรือไม่?
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setAthleteToDelete(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce no-print">
          <div className="bg-emerald-600 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 no-print mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800">Athlete Registration</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">ระบบบันทึกรายชื่อนักกีฬา</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAthletes()}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsPrintPreview(true)}
              disabled={athletes.length === 0}
              className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-md font-bold disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="no-print lg:col-span-4">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${editingAthlete ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {editingAthlete ? <Edit3 /> : <UserPlus />}
                  </div>
                  <h2 className="text-xl font-bold">{editingAthlete ? 'แก้ไขข้อมูล' : 'ลงทะเบียนใหม่'}</h2>
                </div>
                {editingAthlete && (
                  <button onClick={() => setEditingAthlete(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <RegistrationForm 
                onSubmit={handleFormSubmit} 
                isSubmitting={isSubmitting} 
                editData={editingAthlete || undefined}
                onCancel={editingAthlete ? () => setEditingAthlete(null) : undefined}
              />
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              <div className="no-print p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <User className="text-blue-600 w-5 h-5" />
                  <h2 className="font-bold text-slate-800">รายชื่อนักกีฬาทั้งหมด</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {athletes.length} Athletes
                  </span>
                </div>
              </div>
              <AthleteTable 
                athletes={athletes} 
                onDelete={(athlete) => setAthleteToDelete(athlete)} 
                onEdit={handleEditAthlete}
                isDeletingId={isDeletingId}
              />
            </div>
          </section>
        </div>
      </main>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default App;