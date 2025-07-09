
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

@Component({
  selector: 'app-timesheet-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule], // ✅ Add CommonModule here
  templateUrl: './timesheet-navbar.component.html',
  styleUrl: './timesheet-navbar.component.scss'
})
export class TimesheetNavbarComponent {
  topNavbarVisible: boolean = true; // You can control this dynamically later
}

