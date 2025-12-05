import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TicketService } from 'src/app/core/services/Help-Desk/helpdesk.service';
import { TokenService } from 'src/app/core/services/tokenservice/token.service';
import { ChatbotComponent } from 'src/app/modules/Help-Desk/chatbot/chatbot.component';
 

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
  priority: string;
  comments?: { user: string; text: string; date: Date }[]; //  Add here
  [key: string]: any;

  
}

@Component({
  selector: 'app-help-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule,ChatbotComponent],
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css'],

})

export class  HelpDeskComponent implements OnInit {
  ticket: Ticket = {
    ticketId: '', // or generate a random string if neededs
    title: '',
    subject: '',
    status: 'Open',
    description: '',
    createdDate: '',
    createdTime: '',

      priority: 'Medium'
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

  // 🔹 Feature Options (Search, Filter, Export)
  searchTerm: string = '';
  filterStatus: string = '';
  allTickets: Ticket[] = []; // keep unfiltered master list

  selectedImage?: File;
  selectedFile?: File;
  selectedVideo?: File;

  imageError: string | null = null;
  fileError: string | null = null;
  videoError: string | null = null;

  //  Added for Priority filter
  filterPriority: string = '';
  
  sortOption: string = '';

  // 💬 Comment section variables
  newComment: string = '';
  showCommentsFor: string | null = null;

  isChatVisible = false;



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
    this.showTickets = false;
    this.showWelcome = true;
    return;
  }

  this.ticketService.getAllTickets().subscribe({
    next: (response) => {
      this.tickets = response.map((ticket: any) => {
        const fullDateTime = new Date(`${ticket.createdDate}T${ticket.createdTime}`);
        return { ...ticket, fullDateTime };
      });
      this.allTickets = [...this.tickets]; // master copy for filtering
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

  const payload = {
    title: this.ticket.title,
    subject: this.ticket.subject,
    status: this.ticket.status,
    description: this.ticket.description,

    priority: this.ticket.priority
  };

  // Send JSON instead of FormData
  this.ticketService.createTicket(payload).subscribe({
    next: (response) => {
      this.ticketResponse = response;
      this.successBlast = true;
      this.showForm = false;
      form.resetForm();

      // Clear local state
      this.ticket = {
        ticketId: '',
        title: '',
        subject: '',
        status: 'Open',
        description: '',
        createdDate: '',
        createdTime: '',
        priority: 'Medium' //  added default value
      };
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
      createdTime: '',

      priority: 'Medium'
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
    username: this.selectedTicket.username || localStorage.getItem('username') || 'JohnDoe',
    priority: this.selectedTicket.priority || 'Medium', //  added here with default fallback
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


// 🔹 Refresh ticket list
refreshTickets(): void {
  this.getAllTickets();
}

// 🔹 Export visible tickets to CSV
exportToCSV(): void {
  if (!this.tickets || this.tickets.length === 0) {
    alert('No tickets available to export!');
    return;
  }

  const headers = Object.keys(this.tickets[0]);
  const csv = [
    headers.join(','),
    ...this.tickets.map(t =>
      headers.map(h => `"${(t[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tickets.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}
filterTickets(): void {
  let filtered = [...this.allTickets];

  // 🔹 Search
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      (t.title?.toLowerCase().includes(term)) ||
      (t.subject?.toLowerCase().includes(term)) ||
      (t.ticketId?.toString().includes(term)) ||
      (t.username?.toLowerCase().includes(term))
    );
  }

  // 🔹 Filter
  if (this.filterStatus) {
    filtered = filtered.filter(t =>
      t.status?.toLowerCase() === this.filterStatus.toLowerCase()
    );
  }

  //  Priority Filter
if (this.filterPriority) {
  filtered = filtered.filter(
    (t) => t.priority?.toLowerCase() === this.filterPriority.toLowerCase()
  );
}


  // 🔹 Sort
  switch (this.sortOption) {
    case 'newest':
      filtered.sort((a, b) => (b.fullDateTime?.getTime() || 0) - (a.fullDateTime?.getTime() || 0));
      break;
    case 'oldest':
      filtered.sort((a, b) => (a.fullDateTime?.getTime() || 0) - (b.fullDateTime?.getTime() || 0));
      break;
    case 'status-az':
      filtered.sort((a, b) => a.status.localeCompare(b.status));
      break;
    case 'status-za':
      filtered.sort((a, b) => b.status.localeCompare(a.status));
      break;
  }

  this.tickets = filtered;
}


// 💬 Toggle comments section for a ticket
toggleComments(ticketId: string): void {
  this.showCommentsFor = this.showCommentsFor === ticketId ? null : ticketId;
}

// 💬 Add new comment
addComment(ticket: Ticket): void {
  if (!this.newComment.trim()) return;

  const newEntry = {
    user: this.username,
    text: this.newComment.trim(),
    date: new Date()
  };

  if (!ticket.comments) {
    ticket.comments = [];
  }

  ticket.comments.push(newEntry);
  this.newComment = '';
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
  
toggleChatbot() {
  this.isChatVisible = !this.isChatVisible;
}
}
