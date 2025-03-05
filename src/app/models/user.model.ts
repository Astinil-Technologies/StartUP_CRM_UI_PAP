import { Role } from "./role.model";

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string; 
    roles: Role[];
  }