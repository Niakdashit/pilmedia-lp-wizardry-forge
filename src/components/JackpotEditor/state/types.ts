export type Prize = {
  id: string;
  name: string;
  attributionMethod: 'probability' | 'calendar';
  probability?: number;
  calendarDate?: string;
  calendarTime?: string;
};
