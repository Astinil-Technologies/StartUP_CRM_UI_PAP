import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterSectionComponent } from '../footer-section/footer-section.component';
import { AdminNavbarComponent } from 'src/app/modules/admin/components/admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from 'src/app/modules/admin/components/admin-sidebar/admin-sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { globalsearchservice } from 'src/app/core/services/global-search-service';


import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [FooterSectionComponent,RouterModule,AdminNavbarComponent, AdminSidebarComponent, NavbarComponent,CommonModule],
 templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
  
})

export class AdminLayoutComponent {

  isSidebarOpen = false;
  searchResults: any = null;
  overlayVisible: boolean = false;
  showOverlay: boolean=false;

  constructor(private searchService: globalsearchservice) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  

  
}

/*export class AdminLayoutComponent {

  isSidebarOpen = false;
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  searchResults: any = null;
//overlayVisible = false;
overlayVisible: boolean = false;

constructor(private searchService: globalsearchservice) {}

handleSearchResults(results: any) {
  console.log("ADMIN LAYOUT RECEIVED:", results);   // <-- Test whether keyword is received
  this.overlayVisible = true;
  if (!results || !results.trim()) return;
  this.searchService.globalSearch(results).subscribe({
    next: (res) => {
      console.log("API Response: ", res);
      this.searchResults = res;
      this.overlayVisible = true;
    },
    error: (err) => {
      console.error('Search failed', err);
      this.searchResults = null;
      this.overlayVisible = true;
    }
  });

}
openOverlay() {
  this.overlayVisible = true;
}
} */