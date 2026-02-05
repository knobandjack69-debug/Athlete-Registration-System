
import { Order, OrderFormData } from './types';

/**
 * ลิงก์ Web App จาก Google Apps Script (อัปเดตล่าสุด)
 */
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyaTxayXjk3T4Lu5hlD0D9j86vPwfDJKZNOTTTNEOrPv-myEbrBJTpJ1CdwwZAJ-H8n/exec';

export const orderService = {
  /**
   * ดึงข้อมูลคำสั่งซื้อทั้งหมด
   */
  async getOrders(): Promise<Order[]> {
    try {
      const url = `${WEB_APP_URL}?action=getOrders&_=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * สร้างคำสั่งซื้อใหม่
   */
  async createOrder(data: OrderFormData) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'createOrder', data }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * แก้ไขคำสั่งซื้อ
   */
  async updateOrder(id: string, data: OrderFormData) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateOrder', id, data }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * ลบคำสั่งซื้อ
   */
  async deleteOrder(id: string) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteOrder', id }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
};
