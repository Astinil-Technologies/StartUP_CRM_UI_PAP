export enum LeaveTypeEnum {
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  EARNED = 'EARNED',
  WFH = 'WFH',
  LOP = 'LOP',
  OPTIONAL_HOLIDAY = 'OPTIONAL_HOLIDAY',
  COMP_OFF = 'COMP_OFF',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY'
}

export interface LeaveTypeResponse {
  id: number;
  name: LeaveTypeEnum;
  description: string;
  yearlyQuota: number;
  carryForward: boolean;
  maxPerMonth: number;
  active: boolean;
}

export interface LeaveTypeRequest {
  name: LeaveTypeEnum;
  description?: string;
  yearlyQuota: number;
  carryForward: boolean;
  maxPerMonth?: number;
}
