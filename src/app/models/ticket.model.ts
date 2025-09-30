export interface Ticket {
  id?: number;
  ticketId: string;
  username: string;
  title: string;
  subject: string;
  status: string;
  description: string;
  fileName?: string;
  audioName?: string;
  videoName?: string;
  createdDate: string;     // ISO format e.g., "2025-07-18"
  createdTime: string;     // e.g., "10:42:00"
}
