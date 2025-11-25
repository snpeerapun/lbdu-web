// fund-form.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ModalService } from 'src/app/shared/services/modal.service';
import { BalanceSheetItemComponent } from './balance-sheet-item.component';

@Component({
  selector: 'app-balance-sheet-form',
  styles:  [`
      /* กล่องไอคอนเขียวตามภาพตัวอย่าง */
    .tree-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: #0f6a63;          /* เขียวเข้ม */
      color: #fff;
      border-radius: 3px;
      cursor: pointer;
      line-height: 1;
      font-size: 11px;
    }
    .tree-toggle:hover { filter: brightness(1.05); }

    /* จุดหน้า leaf */
    .tree-dot {
      display: inline-block;
      width: 10px; height: 10px;
      border-radius: 2px;
      background:#bfc6c5;
      opacity: .65;
    }

    /* ระยะห่างในเซลล์ชื่อ */
    .tree-cell { white-space: nowrap; }

    /* พื้นหลังอ่อนสำหรับ level ลึก ๆ ให้ใกล้ภาพ */
    tr.level-1 td { background: #f7f9f9; }
    tr.level-2 td { background: #f1f5f5; }
    tr.level-3 td { background: #ecf2f2; }

    /* เลือกใช้ mr-2 (Bootstrap 4) หรือเปลี่ยนเป็น me-2 (Bootstrap 5) */

    `],
  template: `  <!-- fund-form.component.html -->
  <div class="container-fluid">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title">{{ isEditMode ? 'Edit' : 'Add' }} Balance Sheet Template</h5>
      </div>
      <div class="card-body">
        <form #form="ngForm" (ngSubmit)="onSubmit(form)">
          <div class="row">
            <div class="col-md-6">
              <!-- Code -->
              <div class="mb-3">
                <label class="form-label text-muted small mb-1">Template Name</label>
                <input type="text" name="templateName" class="form-control"
                  [(ngModel)]="obj.templateName"
                  #templateName="ngModel" required
                  [class.is-invalid]="templateName.invalid && templateName.touched" />
                <div class="invalid-feedback" *ngIf="templateName.invalid && templateName.touched">
                  Please enter a template name
                </div>
              </div>
  
              <!-- Name -->
              <div class="mb-3">
                <label class="form-label text-muted small mb-1">Description</label>
                <textarea class="form-control"
                  [(ngModel)]="obj.description"
                  #description="ngModel" required
                  >{{obj.description}}</textarea>
                 
              </div>
              <div class="row mt-3">
              <div class="col-sm-3">
                <label class="switch">
                      <input name="isActive"   type="checkbox" [(ngModel)]="obj.isActive">
                      <span class="slider round"></span>
                    </label>
                </div>
              </div>
  
              
            </div>
          </div>
          <h5>Balance Sheet Template Items</h5>
          <div class="d-flex align-items-center justify-content-between mb-2">
            <!-- ซ้าย -->
            <div>
              <button class="btn btn-sm btn-success mr-2" type="button" (click)="expandAll()">Expand All</button>
              <button class="btn btn-sm btn-secondary" type="button" (click)="collapseAll()">Collapse All</button>
            </div>

            <!-- ขวา -->
            <div>
              <button class="btn btn-sm btn-primary" type="button" (click)="onAddItem()"><i class="fas fa-plus me-2"></i> Add Item</button>
            </div>
          </div>

          <table class="table table-striped treetable">
            <thead>
              <tr>
                <th style="width:60px">#</th>
                
                <th>Name</th>
                <th style="width:160px">Type</th>
                <th style="width:220px">Calculate Method</th>
                <th style="width:160px">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr *ngFor="let item of flatRows; let i = index"
                  [ngClass]="['level-' + item.level]">
                <td>{{ i + 1 }}</td>
                 
                <!-- ชื่อ + ไอคอน -->
                <td class="tree-cell" [style.padding-left.px]="item.level * 20">
                  <span *ngIf="item.children?.length"
                        class="tree-toggle mr-2"
                        (click)="toggle(item)">
                    <i class="fas" [ngClass]="item.expanded ? 'fa-minus' : 'fa-plus'"></i>
                  </span>
                  <span *ngIf="!item.children?.length" class="tree-dot mr-2"></span>

                  <strong *ngIf="item.level === 0">{{ item.itemName }}</strong>
                  <span *ngIf="item.level !== 0">{{ item.itemName }}</span>
                </td>

                <td>{{ item.itemType }}</td>
                <td>{{ item.calculationMethod }}</td>
                <td>
                  <button type="button" class="btn btn-primary btn-sm me-2" type="button" (click)="onEditItem(item)">Edit</button>
                  <button type="button" class="btn btn-danger btn-sm" type="button" (click)="onDeleteItem(item)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>


          <!-- Submit/Cancel -->
          
        </form>
      </div>
      <div class="card-footer">
          <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">
            Submit
          </button>
          <button type="button" class="btn btn-secondary ms-2" (click)="onCancel()">
            Cancel
          </button>
          </div>
       </div>
    </div>
  </div>
  `
})
export class BalanceSheetFormComponent implements OnInit {
  isEditMode = false;
  treeRoots: any[] = [];
  flatRows: any[] = [];
  data:any;
  obj: any = {
    templateName: '',
    description: '',
    isActive: 1,
  };

  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getData();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.getRow(id);
    }

  }
  onAddItem() {
    this.modalService.show({
      component:  BalanceSheetItemComponent,
      title: 'Add Balance Sheet Item',
      size: 'lg',
      data: {}
    }).then(result => {
      console.log('result', result)
      if (result) {
        this.getRow(this.obj.id);
      }
    });
  }
  getData() {
    this.httpService.get("/balancesheettemplate/getdata" )
    .subscribe(response => {
      this.data = response;
    },
    error => {
      this.alertService.error(error.error.message, 'Error!');
    });
  }
  onEditItem(obj: any) {
  
    this.modalService.show({
      component:  BalanceSheetItemComponent,
      title: 'Add Balance Sheet Item',
      size: 'lg',
      data: {item: obj,data: this.data}
    }).then(result => {
      console.log('result', result)
      if (result) {
        this.getRow(this.obj.id);
      }
    });
  }
  async onDeleteItem(arg0: any) {
    var result = await this.alertService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
    });
    if (result) {
      this.httpService.get(`/budgetrequest/item/delete/${arg0}`).subscribe({
        next: () => {
          this.getRow(this.obj.id);
          this.alertService.success('Delete completed.', 'Success.');
        },
        error: (err) => {
          this.alertService.error(err?.message || 'Unexpected error', 'Error!');
        }
      });
    }
  }
  onDelete(item: any) {
    this.httpService.delete("/balancesheettemplate/delete/" + item.id).subscribe({
      next: () => {
        this.alertService.success('Item deleted successfully');
        this.getRow(this.obj.id);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }
  getRow(id: number) {
    this.httpService.get("/balancesheettemplate/get/" + id).subscribe({
      next: (response: any) => {
        this.obj = response;
        const items: any[] = this.obj.balanceSheetTemplateItems ?? [];
        this.treeRoots = this.buildTree(items);
        this.flatRows = this.flattenTree(this.treeRoots);
      },
      error: (error) => {
        this.alertService.error(error.error.message, 'Error!');
      }
    });
  }

  private buildTree(items: any[]): any[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    for (const it of items) {
      map.set(it.id, { ...it, children: [], level: 0, expanded: true });
    }

    for (const it of items) {
      const node = map.get(it.id)!;
      if (it.parentId == null) {
        roots.push(node);
      } else {
        const p = map.get(it.parentId);
        (p ? p.children : roots).push(node);
      }
    }

    const q: any[] = [];
    roots.forEach(r => { r.level = 0; q.push(r); });
    while (q.length) {
      const cur = q.shift()!;
      for (const c of cur.children) {
        c.level = cur.level + 1;
        q.push(c);
      }
    }

    return roots;
  }

  private flattenTree(nodes: any[]): any[] {
    const out: any[] = [];
    const dfs = (ns: any[]) => {
      for (const n of ns) {
        out.push(n);
        if (n.expanded && n.children?.length) {
          dfs(n.children);
        }
      }
    };
    dfs(nodes);
    return out;
  }

  toggle(node: any) {
    node.expanded = !node.expanded;
    this.flatRows = this.flattenTree(this.treeRoots);
  }

  expandAll() {
    const setExpand = (nodes: any[]) => {
      for (const n of nodes) {
        n.expanded = true;
        if (n.children?.length) setExpand(n.children);
      }
    };
    setExpand(this.treeRoots);
    this.flatRows = this.flattenTree(this.treeRoots);
  }

  collapseAll() {
    const setCollapse = (nodes: any[]) => {
      for (const n of nodes) {
        n.expanded = false;
        if (n.children?.length) setCollapse(n.children);
      }
    };
    setCollapse(this.treeRoots);
    this.flatRows = this.flattenTree(this.treeRoots);
  }
  onSubmit(form: any) {
    this.obj.isActive = this.obj.isActive ? 1 : 0;
    if (form.valid) {
      this.httpService.post("/balancesheettemplate/post", this.obj).subscribe({
        next: (response) => {
          this.alertService.success(
            `Fund successfully ${this.isEditMode ? 'updated' : 'created'}`
          );
          this.onCancel();
        },
        error: (error) => {
          this.alertService.error('Failed to save fund');
          console.error('Error saving fund:', error);
        }
      });
    } else {
      form.control.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/budget/balance-sheet/list']);
  }
}
