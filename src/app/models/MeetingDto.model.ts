export interface MeetingDto {
  id?: number;
  meetingId?: string;
  title?: string;
  startTime?: string | Date; 
  endTime?: string | Date;
  hostId?: number;
  participantIds?: number[];
  locked?: boolean;
  started?: boolean;
  lobbyEnabled?: boolean;
}