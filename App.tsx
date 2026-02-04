
import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Printer, User, Edit3, CheckCircle2, Loader2, RefreshCw, AlertTriangle, X, ChevronLeft, FileText } from 'lucide-react';
import { Athlete, AthleteFormData } from './types';
import RegistrationForm from './components/RegistrationForm';
import AthleteTable from './components/AthleteTable';
import { athleteService } from './athleteService';

const App: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  
  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);

  const LOGO_URL = "https://img5.pic.in.th/file/secure-sv1/logo_small_index.png";

  const fetchAthletes = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await athleteService.getAthletes();
      setAthletes(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  const handleFormSubmit = useCallback(async (data: AthleteFormData) => {
    setIsSubmitting(true);
    
    const originalAthletes = [...athletes];
    if (editingAthlete) {
      setAthletes(prev => prev.map(a => a.id === editingAthlete.id ? { ...a, ...data } : a));
    }

    try {
      let result;
      if (editingAthlete) {
        result = await athleteService.updateAthlete(editingAthlete.id, data);
        setToastMessage('อัปเดตข้อมูลสำเร็จ');
      } else {
        result = await athleteService.registerAthlete(data);
        setToastMessage('ลงทะเบียนสำเร็จ');
        if (result.success && result.id) {
           const newAthlete: Athlete = {
             ...data,
             id: result.id,
             createdAt: Date.now()
           };
           setAthletes(prev => [newAthlete, ...prev]);
        }
      }

      if (result.success) {
        setShowSuccessToast(true);
        setEditingAthlete(null);
        setTimeout(() => setShowSuccessToast(false), 3000);
        fetchAthletes(false); 
      } else {
        setAthletes(originalAthletes);
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'ไม่สามารถบันทึกได้'));
      }
    } catch (err) {
      setAthletes(originalAthletes);
      alert('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsSubmitting(false);
    }
  }, [athletes, editingAthlete, fetchAthletes]);

  const confirmDelete = async () => {
    if (!athleteToDelete) return;
    
    const id = String(athleteToDelete.id);
    const originalAthletes = [...athletes];
    
    setAthletes(prev => prev.filter(a => a.id !== id));
    setIsDeletingId(id);
    setAthleteToDelete(null);

    try {
      const result = await athleteService.deleteAthlete(id);
      if (result.success) {
        setToastMessage('ลบข้อมูลเรียบร้อยแล้ว');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setAthletes(originalAthletes);
        alert('ลบไม่สำเร็จ: ' + (result.error || 'ไม่พบข้อมูลในระบบ'));
      }
    } catch (err) {
      setAthletes(originalAthletes);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบ');
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
      <div className="min-h-screen bg-slate-200 py-10 font-['Sarabun'] no-print-bg">
        <div className="fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-50 no-print shadow-2xl">
          <button 
            onClick={() => setIsPrintPreview(false)}
            className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>กลับไปหน้าหลัก</span>
          </button>
          <div className="text-sm font-medium text-slate-400">ตัวอย่างเอกสารฉบับทางการ (Official Form)</div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-all font-black shadow-lg shadow-blue-900/20"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เอกสาร</span>
          </button>
        </div>

        <div className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] p-[25mm] min-h-[297mm] mt-10 formal-document">
          {/* Document Header */}
          <div className="relative mb-12 text-center">
            <div className="absolute top-0 left-0 text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1">
              แบบฟอร์ม กีฬา-01
            </div>
            <div className="absolute top-0 right-0 text-[10px] font-medium text-slate-400">
              เลขที่อ้างอิง: ...........................
            </div>
            
            <img src={LOGO_URL} alt="Logo" className="h-20 w-auto mx-auto mb-6" />
            
            <h1 className="text-2xl font-black text-slate-900 mb-2">บัญชีรายชื่อนักกีฬาและผู้เข้าร่วมกิจกรรม</h1>
            <p className="text-md font-bold text-slate-700">ชมรมกรีฑาและกีฬา | ประจำปีการศึกษา {new Date().getFullYear() + 543}</p>
            
            <div className="w-40 h-1 bg-slate-900 mx-auto mt-6"></div>
          </div>

          {/* Document Info Bar */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-1">
              <p><span className="font-bold">หน่วยงาน:</span> โรงเรียนและสถาบันกีฬาพันธมิตร</p>
              <p><span className="font-bold">ประเภท:</span> ทะเบียนคุมข้อมูลนักกีฬา (Master List)</p>
            </div>
            <div className="text-right space-y-1">
              <p><span className="font-bold">วันที่ออกเอกสาร:</span> {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><span className="font-bold">จำนวนนักกีฬาทั้งสิ้น:</span> {athletes.length} ราย</p>
            </div>
          </div>

          {/* Main Content Table */}
          <div className="w-full">
            <AthleteTable 
              athletes={athletes} 
              onDelete={() => {}} 
              onEdit={() => {}} 
              isDeletingId={null}
              hideActions={true} 
            />
          </div>

          {/* Signature Sections */}
          <div className="mt-20 grid grid-cols-3 gap-8 signature-box">
            <div className="text-center">
              <div className="h-16 mb-2"></div>
              <p className="font-bold text-sm">(....................................................)</p>
              <p className="mt-1 text-xs font-bold text-slate-600">ลงชื่อ ผู้จัดทำข้อมูล</p>
              <p className="text-[10px] text-slate-400">ตำแหน่ง เจ้าหน้าที่ประสานงาน</p>
            </div>
            <div className="text-center">
              <div className="h-16 mb-2"></div>
              <p className="font-bold text-sm">(....................................................)</p>
              <p className="mt-1 text-xs font-bold text-slate-600">ลงชื่อ ผู้ตรวจสอบ</p>
              <p className="text-[10px] text-slate-400">ตำแหน่ง ครู/อาจารย์ที่ปรึกษา</p>
            </div>
            <div className="text-center">
              <div className="h-16 mb-2"></div>
              <p className="font-bold text-sm">(....................................................)</p>
              <p className="mt-1 text-xs font-bold text-slate-600">ลงชื่อ ผู้อนุมัติ</p>
              <p className="text-[10px] text-slate-400">ตำแหน่ง หัวหน้างานกิจกรรม</p>
            </div>
          </div>

          {/* Footer Page Number */}
          <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
             <div>* เอกสารนี้ใช้เพื่อการภายในชมรมกีฬาเท่านั้น</div>
             <div>หน้าที่ 1 / 1</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Sarabun'] relative">
      {athleteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print delete-modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                คุณต้องการลบข้อมูลของ <span className="font-bold text-slate-800">{athleteToDelete.firstName} {athleteToDelete.lastName}</span> ใช่หรือไม่? <br/>
                <span className="text-sm text-red-400">การกระทำนี้ไม่สามารถย้อนกลับได้</span>
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setAthleteToDelete(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce no-print success-toast">
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
              onClick={() => fetchAthletes(false)}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              title="โหลดข้อมูลใหม่"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
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
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="font-bold text-slate-400 animate-pulse">กำลังดึงข้อมูลนักกีฬา...</p>
           </div>
        ) : (
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
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 table-container">
                <div className="no-print p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <User className="text-blue-600 w-5 h-5" />
                    <h2 className="font-bold text-slate-800">รายชื่อนักกีฬาทั้งหมด</h2>
                    {isRefreshing && <Loader2 className="w-4 h-4 animate-spin text-blue-400 ml-2" />}
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
        )}
      </main>
    </div>
  );
};

export default App;
