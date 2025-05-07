export interface Reminder {
 
    id?: number;
    title: string;
    dueDateTime: Date; // or Date if you prefer working with Date objects
    notifyBeforeMinutes: number;
    attachmentPath?: string;
  }
  