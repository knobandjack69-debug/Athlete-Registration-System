import { Athlete, AthleteFormData } from './types';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyEN3XyydeVltq3Y_PMidnI4o9cp49mUAYoUY22YjezKqIl9ethghYtavV4dzEmQa0jCg/exec';

export const athleteService = {
  async getAthletes(): Promise<Athlete[]> {
    try {
      const response = await fetch(`${WEB_APP_URL}?action=getAthletes`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('getAthletes failed:', error);
      return [];
    }
  },

  async registerAthlete(data: AthleteFormData) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'registerAthlete', 
          data 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  },

  async updateAthlete(id: string, data: AthleteFormData) {
    try {
      // บังคับ ID เป็น string และตัดช่องว่าง
      const safeId = String(id).trim();
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'updateAthlete', 
          id: safeId, 
          data 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  },

  async deleteAthlete(id: string) {
    try {
      // บังคับ ID เป็น string และตัดช่องว่าง เพื่อป้องกันเลขยกกำลัง
      const safeId = String(id).trim();
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'deleteAthlete', 
          id: safeId 
        }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
};