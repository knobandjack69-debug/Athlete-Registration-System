
import { Athlete, AthleteFormData } from './types.ts';

/**
 * ลิงก์ Web App จาก Google Apps Script
 */
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyaTxayXjk3T4Lu5hlD0D9j86vPwfDJKZNOTTTNEOrPv-myEbrBJTpJ1CdwwZAJ-H8n/exec';

export const athleteService = {
  /**
   * ดึงข้อมูลนักกีฬาทั้งหมด
   */
  async getAthletes(): Promise<Athlete[]> {
    try {
      const url = `${WEB_APP_URL}?action=getAthletes&_=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching athletes:', error);
      throw error;
    }
  },

  /**
   * ลงทะเบียนนักกีฬาใหม่
   */
  async registerAthlete(data: AthleteFormData) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'registerAthlete', 
          data 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * แก้ไขข้อมูลนักกีฬา
   */
  async updateAthlete(id: string, data: AthleteFormData) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'updateAthlete', 
          id, 
          data 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * ลบข้อมูลนักกีฬา
   */
  async deleteAthlete(id: string) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'deleteAthlete', 
          id 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
};
