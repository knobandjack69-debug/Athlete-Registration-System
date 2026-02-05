
export interface Order {
  id: string;
  recipientName: string;
  phone: string;
  details: string;
  cardMessage: string;
  address: string;
  deliveryTime: string;
  photoUrl: string;
  timestamp?: string;
}

export type OrderFormData = Omit<Order, 'id' | 'timestamp'>;

/**
 * Fix: Added Athlete and AthleteFormData to resolve import errors in:
 * - components/RegistrationForm.tsx
 * - components/AthleteTable.tsx
 * - athleteService.ts
 */
export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  number: string;
  photoUrl: string;
}

export type AthleteFormData = Omit<Athlete, 'id'>;
