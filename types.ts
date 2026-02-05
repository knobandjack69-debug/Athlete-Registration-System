
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

// Fix: Add Athlete and AthleteFormData types which were missing but referenced by athlete registration components
export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  number: string;
  photoUrl: string;
}

export type AthleteFormData = Omit<Athlete, 'id'>;
