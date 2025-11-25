import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-budget-group',
  templateUrl: './budget-group.component.html',
  styleUrls: ['./budget-group.component.scss']
})
export class BudgetGroupComponent implements OnInit {
  groups = [
    {
      id: 1,
      name: 'Operations',
      categories: [
        { id: 1, name: 'Office Supplies' },
        { id: 2, name: 'Utilities' },
        { id: 3, name: 'Rent' }
      ]
    },
    {
      id: 2,
      name: 'Marketing',
      categories: [
        { id: 4, name: 'Digital Advertising' },
        { id: 5, name: 'Content Creation' },
        { id: 6, name: 'Events' }
      ]
    },
    {
      id: 3,
      name: 'Human Resources',
      categories: [
        { id: 7, name: 'Training' },
        { id: 8, name: 'Recruitment' },
        { id: 9, name: 'Employee Benefits' }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  onAddGroup(): void {
    // TODO: Implement add group functionality
    console.log('Add new group');
  }

  onEditGroup(groupId: number): void {
    // TODO: Implement edit group functionality
    console.log('Edit group:', groupId);
  }

  onDeleteGroup(groupId: number): void {
    // TODO: Implement delete group functionality
    console.log('Delete group:', groupId);
  }

  onAddCategory(groupId: number): void {
    // TODO: Implement add category functionality
    console.log('Add category to group:', groupId);
  }

  onEditCategory(groupId: number, categoryId: number): void {
    // TODO: Implement edit category functionality
    console.log('Edit category:', categoryId, 'in group:', groupId);
  }

  onDeleteCategory(groupId: number, categoryId: number): void {
    // TODO: Implement delete category functionality
    console.log('Delete category:', categoryId, 'from group:', groupId);
  }
}
