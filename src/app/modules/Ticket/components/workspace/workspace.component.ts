import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent {
  showModal = false;
  newWorkspaceName = '';
  workspaces: { name: string }[] = [];

  selectedIndex: number | null = null;
  contextMenuVisible = false;
  contextMenuPosition = { top: '0px', left: '0px' };
  showDropdown = false;
  activeWorkspace: string | null = null;
  showFolderPopup = false;
  folderPopupPosition = { top: '0px', left: '0px' };
  switchMode = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newWorkspaceName = '';
  }

  createWorkspace() {
    const name = this.newWorkspaceName.trim();
    if (name) {
      this.workspaces.push({ name });
      this.newWorkspaceName = '';
      this.showModal = false;
    }
  }

  openContextMenu(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedIndex = index;
    this.contextMenuVisible = true;
    this.contextMenuPosition = {
      top: `${event.clientY}px`,
      left: `${event.clientX - 160}px`
    };
  }

  closeContextMenu() {
    this.contextMenuVisible = false;
    this.selectedIndex = null;
  }

  renameWorkspace(index: number) {
    const newName = prompt('Enter new name', this.workspaces[index].name);
    if (newName?.trim()) {
      this.workspaces[index].name = newName.trim();
    }
    this.closeContextMenu();
  }

  deleteWorkspace(index: number) {
    if (confirm('Are you sure you want to delete this workspace?')) {
      if (this.workspaces[index].name === this.activeWorkspace) {
        this.activeWorkspace = null;
        this.showFolderPopup = false;
      }
      this.workspaces.splice(index, 1);
    }
    this.closeContextMenu();
  }

  editWorkspace(index: number) {
    alert(`Edit workspace: ${this.workspaces[index].name}`);
    this.closeContextMenu();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.switchMode = true;
  }

  selectWorkspace(name: string) {
    this.activeWorkspace = name;
    this.showDropdown = false;
    this.showFolderPopup = true;
    this.switchMode = true;
  }

  clickWorkspace(event: MouseEvent, name: string) {
    this.activeWorkspace = name;
    this.showFolderPopup = true;
    this.switchMode = false;
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    this.folderPopupPosition = {
      top: `${rect.top + 30}px`,
      left: `${rect.left + 200}px`
    };
  }

  closeFolderPopup() {
    this.showFolderPopup = false;
  }

  isWorkspaceVisible(name: string): boolean {
    return !this.switchMode || this.activeWorkspace === name;
  }
}
