
export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  number: string;
  photoUrl: string;
  createdAt: number;
}

export type AthleteFormData = Omit<Athlete, 'id' | 'createdAt'>;
