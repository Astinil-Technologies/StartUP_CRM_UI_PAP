import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TicketService } from 'src/app/core/services/Help-Desk/helpdesk.service';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';

interface Ticket {
    id?: number; 
  title: string;
  subject: string;
  status: string;
  description: string;
  createdDate: string;
  createdTime: string;
  ticketId: string;
  fullDateTime?: Date;
  username?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-help-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css']
})

export class  HelpDeskComponent implements OnInit {
  ticket: Ticket = {
    ticketId: '', // or generate a random string if neededs
    title: '',
    subject: '',
    status: 'Open',
    description: '',
    createdDate: '',
    createdTime: ''
  };

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  showEditForm: boolean = false;
    toggleCreateTicket() {
    this.showForm = !this.showForm;
    this.ticketCreated = false;
    this.showTickets = false;
    this.showWelcome = !this.showForm; 
  }


  username: string = 'nagamani';
  ticketCreated = false;
  ticketResponse: any;
  showForm = false;
  showTickets = false;
  formInvalid = false;
  successBlast = false;
  showWelcome: boolean = true;

  selectedImage?: File;
  selectedFile?: File;
  selectedVideo?: File;

  imageError: string | null = null;
  fileError: string | null = null;
  videoError: string | null = null;


  constructor(
  private ticketService: TicketService,
  private tokenService: TokenService
) {}

ngOnInit(): void {
  const token = localStorage.getItem('jwtToken');
  console.log('JWT Token in localStorage:', token);

  if (token) {
    const decoded = this.decodeToken(token);
    console.log("Decoded JWT:", decoded);

    // Try from token payload, then localStorage, else guest
    this.username =
      decoded?.sub ||
      decoded?.username ||
      localStorage.getItem('username') ||
      'guest';

    this.getAllTickets();
  } else {
    this.username = localStorage.getItem('username') || 'guest';
    console.error('No JWT token found! You need to login first.');
  }
}

// helper function to decode JWT payload
decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Failed to decode token', e);
    return null;
  }
}



getUsername(): void {
  this.ticketService.getUsername().subscribe({
    next: (response: any) => {
      console.log("Backend response for username:", response);
      this.username = response;
    },
    error: () => {
      console.error('Error fetching username, using fallback');
      this.username = 'guest';
    }
  });
}


  getAllTickets(): void {
  if (this.showTickets) {
    // If already showing, hide the ticket list
    this.showTickets = false;
    this.showWelcome = true;
    
    return;
  }

  // Otherwise, fetch and display tickets
  this.ticketService.getAllTickets().subscribe({
    next: (response) => {
      this.tickets = response.map((ticket: any) => {
        const fullDateTime = new Date(`${ticket.createdDate}T${ticket.createdTime}`);
        return { ...ticket, fullDateTime };
      });
      this.showTickets = true;
      this.showForm = false;
      this.ticketCreated = false;
      this.showWelcome = false;
      
    },
    error: (error) => console.error('Error fetching tickets:', error)
  });
}


 submitTicket(form: NgForm): void {
  if (form.invalid || this.imageError || this.fileError || this.videoError) {
    this.formInvalid = true;
    return;
  }

  const formData = new FormData();
  formData.append('title', this.ticket.title);
  formData.append('subject', this.ticket.subject);
  formData.append('status', this.ticket.status);
  formData.append('description', this.ticket.description);

  if (this.selectedImage) formData.append('image', this.selectedImage);
  if (this.selectedFile) formData.append('file', this.selectedFile);
  if (this.selectedVideo) formData.append('video', this.selectedVideo);

  // ✅ Use TokenService to get JWT
  const token = this.tokenService.getAccessToken();
  if (!token) {
    console.error('No JWT token found! Please login first.');
    return;
  }

  // ✅ Only pass formData, token is already handled in TicketService
  this.ticketService.createTicket(formData).subscribe({
    next: (response) => {
      if (response.createdDate && response.createdTime) {
        response.fullDateTime = new Date(`${response.createdDate}T${response.createdTime}`);
      }
      this.ticketResponse = response;
      this.ticketCreated = true;
      this.successBlast = true;
      this.showForm = false;

      form.resetForm();
      this.ticket = {
        title: '',
        ticketId: '',
        subject: '',
        status: 'Open',
        description: '',
        createdDate: '',
        createdTime: ''
      };
      this.selectedImage = this.selectedFile = this.selectedVideo = undefined;
      this.imageError = this.fileError = this.videoError = null;
      this.formInvalid = false;

      setTimeout(() => this.successBlast = false, 10000);
    },
    error: (error) => console.error('Ticket creation failed', error)
  });
}


  resetForm(form: NgForm, goBack: boolean = false): void {
    form.resetForm();
    this.ticket = {
      title: '',
      ticketId: '', // or generate a random string if needed
      subject: '',
      status: 'Open',
      description: '',
      createdDate: '',
      createdTime: ''
    };
    this.selectedImage = this.selectedFile = this.selectedVideo = undefined;
    this.imageError = this.fileError = this.videoError = null;
    this.ticketCreated = false;
    this.formInvalid = false;

    if (goBack) {
      this.showForm = false;
      this.showTickets = false;
    }
  }


 updateTicket(): void {
  if (!this.selectedTicket) return;

  // Fix: Ensure all required fields are present (fallbacks added)
  const updatedTicket = {
    ticketId: this.selectedTicket.ticketId || '',
    title: this.selectedTicket.title || '',
    subject: this.selectedTicket.subject || '',
    status: this.selectedTicket.status || '',
    description: this.selectedTicket.description || '',
    createdDate: this.selectedTicket.createdDate || '',
    createdTime: this.selectedTicket.createdTime || '',
    fullDateTime: this.selectedTicket.fullDateTime || new Date(),
    username: this.selectedTicket.username || localStorage.getItem('username') || 'JohnDoe'
  };

  this.ticketService.updateTicket(updatedTicket).subscribe({
    next: () => {
      const index = this.tickets.findIndex(t => t.ticketId === updatedTicket.ticketId);
      if (index !== -1) {
        this.tickets[index] = updatedTicket;
      }
      this.showEditForm = false;
      this.selectedTicket = null;
      alert('Ticket updated successfully!');
    },
    error: (err) => {
      console.error('Error updating ticket', err);
    }
  });
}

editTicket(ticket: Ticket) {
  console.log("Edit clicked:", ticket);
  this.ticket = {
    ...ticket,
    subject: this.cleanQuotes(ticket.subject),
    status: this.cleanQuotes(ticket.status),
    description: this.cleanQuotes(ticket.description)
  };
  this.showForm = true;
  this.showTickets = false;
}
deleteTicket(ticketId: string) {
  this.ticketService.deleteTicket(ticketId).subscribe({
    next: () => {
      // Remove the deleted ticket from the list
      this.tickets = this.tickets.filter(t => t.ticketId !== ticketId);
    },
    error: (err) => {
      console.error('Error deleting ticket:', err);
    }
  });
}







  onImageChange(event: any): void {
    const file = event.target.files?.[0];
    this.imageError = null;
    if (file && file.size > 5 * 1024 * 1024) {
      this.imageError = 'Image size must be 5MB or less.';
      this.selectedImage = undefined;
      event.target.value = '';
    } else {
      this.selectedImage = file;
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    this.fileError = null;
    if (file && file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size must be 5MB or less.';
      this.selectedFile = undefined;
      event.target.value = '';
    } else {
      this.selectedFile = file;
    }
  }

  onVideoChange(event: any): void {
    const file = event.target.files?.[0];
    this.videoError = null;
    if (file && file.size > 10 * 1024 * 1024) {
      this.videoError = 'Video size must be 10MB or less.';
      this.selectedVideo = undefined;
      event.target.value = '';
    } else {
      this.selectedVideo = file;
    }
  }

  onSubjectChange(): void {
    if (this.ticket.subject !== 'Other') {
      this.ticket.description = '';
    }
  }

  cleanQuotes(text: string): string {
    return text ? text.replace(/"/g, '') : '';
  }

  formatStatus(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    return s.includes('inprogress') || s.includes('in progress') ? 'In Progress' : status;
  }
}
