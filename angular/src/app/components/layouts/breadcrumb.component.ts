import { Component, Input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/dashboard">หน้าหลัก</a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ currentPage }}
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      margin-bottom: 1rem;
      background-color: transparent;
      padding: 0;
    }
    .breadcrumb-item + .breadcrumb-item::before {
      content: ">";
    }
  `]
})
export class BreadcrumbComponent {
  @Input() currentPage: string = '';
}