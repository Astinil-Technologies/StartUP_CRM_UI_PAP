import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Auth & User Access
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordPopupComponent } from './auth/forgot-password-popup/forgot-password-popup.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { LoginMainComponent } from './auth/login-main/login-main.component';

// Shared Components
import { LayoutComponent } from './shared/components/layout/layout.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterSectionComponent } from './shared/components/footer-section/footer-section.component';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { InstructorLayoutComponent } from './shared/components/instructor-layout/instructor-layout.component';

// Student Modules
import { HomeSectionComponent } from './modules/student/components/home-section/home-section.component';
import { CourseEnrollmentComponent } from './modules/student/components/course-enrollment/course-enrollment.component';
import { CourseContentComponent } from './modules/student/components/course-content/course-content.component';
import { MyLearningComponent } from './modules/student/components/my-learning/my-learning.component';
import { StudentsAllCoursesComponent } from './modules/student/components/my-learning/my-learning-sub-comonents/students-all-courses/students-all-courses.component';
import { StudentsMyListsComponent } from './modules/student/components/my-learning/my-learning-sub-comonents/students-my-lists/students-my-lists.component';
import { StudentsWishlistComponent } from './modules/student/components/my-learning/my-learning-sub-comonents/students-wishlist/students-wishlist.component';
import { StudentsArchivedComponent } from './modules/student/components/my-learning/my-learning-sub-comonents/students-archived/students-archived.component';
import { StudentsLearningToolsComponent } from './modules/student/components/my-learning/my-learning-sub-comonents/students-learning-tools/students-learning-tools.component';
import { MessagesComponent } from './modules/student/components/sidebar-component/messages/messages.component';

// Admin Modules
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { ManageCoursesComponent } from './modules/admin/components/manage-courses/manage-courses.component';
import { ManageUsersComponent } from './modules/admin/components/manage-users/manage-users.component';
import { AccountSettingsComponent } from './modules/admin/components/account-settings/account-settings.component';
import { PhotoComponent } from './modules/admin/components/account-settings/photo/photo.component';
import { AccountSecurityComponent } from './modules/admin/components/account-settings/account-security/account-security.component';
import { AdminSidebarComponent } from './modules/admin/components/admin-sidebar/admin-sidebar.component';

// Instructor Modules
import { InstructorDashboardComponent } from './modules/instructor/instructor-dashboard/instructor-dashboard.component';
import { CreateCourseComponent } from './modules/instructor/component/create-course/create-course.component';
import { CreateCourseModulesComponent } from './modules/instructor/component/create-course-modules/create-course-modules.component';
import { CreateLessonsComponent } from './modules/instructor/component/create-lessons/create-lessons.component';

// Timesheet Module
import { TimesheetNavbarComponent } from './modules/Ttimesheet/component/timesheet-navbar/timesheet-navbar.component';
import { HomepageComponent } from './modules/Ttimesheet/component/homepage/homepage.component';

// Ticketing Module
import { SideNavbarComponent } from './modules/Ticket/components/sideNavbar/sideNavbar.component';
import { RaiseTicketComponent } from './modules/Ticket/components/raise-ticket/raise-ticket.component';
import { MyticketComponent } from './modules/Ticket/components/myticket/myticket.component';
import { UpdateTicketComponent } from './modules/Ticket/components/update-ticket/update-ticket.component';
import { MyTaskNavbarComponent } from './modules/myTask/components/my-task-navbar/my-task-navbar.component';
import { OverViewComponent } from './modules/myTask/components/over-view/over-view.component';
import { TodayOverdueComponent } from './modules/myTask/components/today-overdue/today-overdue.component';
import { TaskAssignedComponent } from './modules/myTask/components/task-assigned/task-assigned.component';

// Video Meeting Module
import VideoCallComponent from './modules/video-meet/components/video-call/video-call.component';
import { ChatComponent } from './modules/video-meet/components/chat/chat.component';
import { ScheduleMeetingDialogComponent } from './modules/video-meet/components/schedule-meeting-dialog/schedule-meeting-dialog.component';
import { HomeComponent as VideoMeetHomeComponent } from './modules/video-meet/components/home/home.component';
import { ReminderListComponent } from './reminders/reminder-list/reminder-list.component';
import { ReminderFormComponent } from './reminders/reminder-form/reminder-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login-main', pathMatch: 'full' },

  // Auth Routes
  { path: 'login-main', component: LoginMainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordPopupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Static Component Testing
  { path: 'cyber', component: FooterSectionComponent },

  // Student Layout
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ROLE_USER'] },
    children: [
      { path: 'dashboard', component: HomeSectionComponent },
      { path: 'navbar', component: NavbarComponent },

      {
        path: 'timesheet',
        component: TimesheetNavbarComponent,
        canActivate: [authGuard],
        children: [{ path: '', component: HomepageComponent }]
      },

      {
        path: 'meet',
        component: VideoMeetHomeComponent,
        canActivate: [authGuard],
        children: [
          { path: '', component: VideoCallComponent },
          { path: 'chat', component: ChatComponent },
          { path: 'schedule', component: ScheduleMeetingDialogComponent }
        ]
      },
      {
        path:'ticket',
        component:SideNavbarComponent,
        canActivate: [authGuard],
        children:[
          {path:'',component:RaiseTicketComponent},
          {path:'myticket', component:MyticketComponent},
          {path:'update-ticket/:id', component:UpdateTicketComponent},
        ]
      },
      {
        path:'mytask',
        component:MyTaskNavbarComponent,
        canActivate: [authGuard],
        children:[
          {path:'',component:OverViewComponent},
          {path:'task-today', component:TodayOverdueComponent},
          {path:'task-assigned', component:TaskAssignedComponent},
        ]
      },

      { path: 'courses', component: CourseEnrollmentComponent },
      { path: 'courses/:id', component: CourseContentComponent },

      {
        path: 'my-learning',
        component: MyLearningComponent,
        canActivate: [authGuard],
        children: [
          { path: '', component: StudentsAllCoursesComponent },
          { path: 'my-lists', component: StudentsMyListsComponent },
          { path: 'wishlist', component: StudentsWishlistComponent },
          { path: 'archived', component: StudentsArchivedComponent },
          { path: 'learning-tools', component: StudentsLearningToolsComponent }
        ]
      },

      { path: 'messages', component: MessagesComponent },

      {
        path: 'reminders',
        children: [
          { path: '', loadComponent: () => import('./reminders/reminder-list/reminder-list.component').then(m => m.ReminderListComponent) },
          { path: 'new', loadComponent: () => import('./reminders/reminder-form/reminder-form.component').then(m => m.ReminderFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./reminders/reminder-form/reminder-form.component').then(m => m.ReminderFormComponent) }
        ]
      }
    ]
  },

  // Admin Layout
  {
    path: 'admin-layout',
    component: AdminLayoutComponent,
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'manage-courses', component: ManageCoursesComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      {
        path: 'account-settings',
        component: AccountSettingsComponent,
        children: [
          { path: 'photo', component: PhotoComponent },
          { path: 'account-security', component: AccountSecurityComponent }
        ]
      },
      { path: 'account-side', component: AdminSidebarComponent }
    ]
  },

  // Instructor Layout
  {
    path: 'instructor-layout',
    component: InstructorLayoutComponent,
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ROLE_INSTRUCTOR'] },
    children: [
      { path: '', component: InstructorDashboardComponent },
      { path: 'create-courses', component: CreateCourseComponent },
      { path: 'create-module', component: CreateCourseModulesComponent },
      { path: 'create-course-lesson', component: CreateLessonsComponent }
    ]
  },

  // Standalone Lazy-Loaded Video Call
  {
    path: 'meet/:id',
    loadComponent: () =>
      import('./modules/video-meet/components/video-call/video-call.component').then(
        (m) => m.default
      )
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
