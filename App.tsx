
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flower, 
  PlusCircle, 
  Search, 
  History, 
  BarChart3, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  WifiOff,
  X
} from 'lucide-react';
import { Order, OrderFormData } from './types.ts';
import OrderForm from './components/OrderForm.tsx';
import OrderTable from './components/OrderTable.tsx';
import OrderDetailsModal from './components/OrderDetailsModal.tsx';
import StatisticsDashboard from './components/StatisticsDashboard.tsx';
import PrintTemplate from './components/PrintTemplate.tsx';
import DeleteModal from './components/DeleteModal.tsx';
import { orderService } from './orderService.ts';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'stats' | 'search'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);
    
    try {
      const data = await orderService.getOrders();
      if (data) {
        setOrders(data);
      } else {
        throw new Error('No data returned');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ (Failed to fetch)\nกรุณาตรวจสอบการตั้งค่า "Anyone" ในการ Deploy GAS');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.recipientName.toLowerCase().includes(term) || 
      o.id.toLowerCase().includes(term) ||
      o.phone.includes(term)
    );
  }, [orders, searchTerm]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFormSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingOrder) {
        result = await orderService.updateOrder(editingOrder.id, data);
        if (result.success) triggerToast('แก้ไขข้อมูลสำเร็จแล้ว!');
      } else {
        result = await orderService.createOrder(data);
        if (result.success) triggerToast('บันทึกคำสั่งซื้อใหม่เรียบร้อย!');
      }

      if (result && result.success) {
        setEditingOrder(null);
        setActiveTab('list');
        fetchOrders(false);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result?.error || 'ไม่สามารถบันทึกข้อมูลได้'));
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await orderService.deleteOrder(deleteTarget.id);
      if (result && result.success) {
        triggerToast('ลบรายการสั่งซื้อสำเร็จ');
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
      } else {
        alert('ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] pb-20 font-['Sarabun']">
      <PrintTemplate order={printingOrder} />

      {/* Modern Header with All Tabs */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white pt-12 pb-24 px-6 relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-900/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Flower className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">ระบบสั่งซื้อ<span className="text-pink-200">ดอกไม้</span></h1>
              </div>
              <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px]">Flower Ordering & Management Professional</p>
            </div>
            
            {/* Main Navigation - 4 Buttons */}
            <div className="flex flex-wrap justify-center bg-white/10 backdrop-blur-md p-2 rounded-[32px] border border-white/20 gap-2">
              <button 
                onClick={() => { setActiveTab('list'); setEditingOrder(null); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'list' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <History className="w-5 h-5" /> รายการสั่งซื้อ
              </button>
              <button 
                onClick={() => { setActiveTab('create'); setEditingOrder(null); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'create' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <PlusCircle className="w-5 h-5" /> สั่งซื้อใหม่
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'search' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <Search className="w-5 h-5" /> ค้นหา
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'stats' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <BarChart3 className="w-5 h-5" /> สถิติ
              </button>
            </div>
          </div>
        </div>
      </header>

      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 no-print">
          <div className="bg-white border-2 border-green-500 shadow-2xl px-8 py-4 rounded-[24px] flex items-center gap-3 text-green-600 font-black">
            <CheckCircle2 className="w-6 h-6" /> {toastMsg}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 -mt-12 no-print relative z-20">
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[48px] p-24 shadow-2xl flex flex-col items-center justify-center gap-6 border border-white">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
              <Flower className="w-8 h-8 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-black text-slate-400 text-lg">กำลังดึงข้อมูลจากระบบ...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-[48px] p-16 shadow-2xl text-center border-2 border-red-50">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 whitespace-pre-line">{fetchError}</h3>
            <p className="text-slate-500 font-bold mb-8">ตรวจสอบว่าคุณได้เลือก "Anyone" ในหน้า Deployment ของ Apps Script แล้วหรือยัง?</p>
            <button onClick={() => fetchOrders()} className="bg-rose-500 text-white px-10 py-5 rounded-[24px] font-black shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center gap-3 mx-auto">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} /> ลองเชื่อมต่อใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'create' || editingOrder ? (
              <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl border border-white max-w-4xl mx-auto">
                <OrderForm 
                  onSubmit={handleFormSubmit} 
                  isSubmitting={isSubmitting} 
                  editData={editingOrder || undefined}
                  onCancel={() => { setActiveTab('list'); setEditingOrder(null); }}
                />
              </div>
            ) : activeTab === 'stats' ? (
              <StatisticsDashboard orders={orders} />
            ) : (
              <div className="bg-white rounded-[48px] shadow-2xl border border-white overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">
                      {activeTab === 'search' ? 'ค้นหาข้อมูล' : 'รายการสั่งซื้อทั้งหมด'}
                    </h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Data Management Center</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {(activeTab === 'search' || searchTerm) && (
                      <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="text" 
                          autoFocus
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="ค้นหาชื่อผู้รับ หรือรหัส..."
                          className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:bg-white focus:border-rose-200 outline-none font-bold text-slate-600 shadow-inner transition-all"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                    <button 
                      onClick={() => fetchOrders(false)} 
                      title="รีเฟรชข้อมูล"
                      className="bg-slate-50 p-4 rounded-2xl text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 border border-slate-100"
                    >
                      <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <OrderTable 
                  orders={filteredOrders} 
                  onDelete={(o) => setDeleteTarget(o)} 
                  onEdit={(o) => { setEditingOrder(o); setActiveTab('create'); }} 
                  onView={(o) => setViewingOrder(o)}
                  onPrint={(o) => { setPrintingOrder(o); setTimeout(() => window.print(), 300); }}
                  isDeletingId={isDeleting ? deleteTarget?.id || null : null}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <OrderDetailsModal 
        isOpen={!!viewingOrder} 
        order={viewingOrder} 
        onClose={() => setViewingOrder(null)} 
      />
      
      <DeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="ยกเลิกคำสั่งซื้อ?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการสั่งซื้อของคุณ ${deleteTarget?.recipientName}? ข้อมูลนี้จะไม่สามารถกู้คืนได้`}
      />
    </div>
  );
};

export default App;
