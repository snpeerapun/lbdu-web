import { Component } from '@angular/core';

@Component({
  selector: 'app-right-sidebar',
  template: `
    <div class="right-sidebar" >
      
      <!-- New IPO Widget -->
      <div class="widget">
        <h5 class="widget-title">กองทุนเปิดใหม่</h5>
        <div class="card">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="card-title mb-0">LHSTPLUS-SSF</h6>
              <span class="badge bg-success">IPO</span>
            </div>
            <p class="card-text small mb-2">กองทุนเปิด แอล เอช ตราสารหนี้ระยะสั้นพลัส</p>
            <small class="text-muted d-block mb-2">15 - 28 ก.พ. 2567</small>
            <a href="#" class="btn btn-outline-primary btn-sm w-100">รายละเอียดกองทุน</a>
          </div>
        </div>
      </div>

      
      <!-- Promotions Widget -->
      <div class="widget">
        <h5 class="widget-title">โปรโมชั่น</h5>
        <div class="card">
          <img src="https://www.lhfund.co.th/Upload/400x250_787_1705380836_89799.jpg" 
               class="card-img-top" 
               alt="LH Fund Promotion">
          <div class="card-body p-2">
            <h6 class="card-title">ลงทุนกองทุนรวมกับ LHFUND</h6>
            <p class="card-text small">รับสิทธิประโยชน์และโปรโมชั่นพิเศษมากมาย</p>
            <a href="#" class="btn btn-primary btn-sm w-100">ดูรายละเอียด</a>
          </div>
        </div>
      </div>

      <!-- News Widget -->
      <div class="widget">
        <h5 class="widget-title">ข่าวสารและประกาศ</h5>
        <div class="card">
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action">
              <small class="text-muted d-block">24 ก.พ. 2567</small>
              <span class="news-title">ประกาศจ่ายปันผล LHPROP-INFRA</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <small class="text-muted d-block">23 ก.พ. 2567</small>
              <span class="news-title">แจ้งเปลี่ยนแปลงอัตราค่าธรรมเนียม</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <small class="text-muted d-block">22 ก.พ. 2567</small>
              <span class="news-title">ประกาศมูลค่าทรัพย์สินสุทธิ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .right-sidebar {
      padding: 1rem;
    }
    .widget {
      margin-bottom: 1rem;
    }
    .widget-title {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.75rem;
    }
    .card {
      border: 1px solid rgba(0,0,0,.125);
      box-shadow: none;
    }
    .card:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .badge {
      font-weight: 500;
      font-size: 0.75rem;
    }
    .list-group-item {
      padding: 0.5rem 1rem;
      border-left: none;
      border-right: none;
    }
    .list-group-item:hover {
      background-color: #f8f9fa;
    }
    .news-title {
      font-size: 0.875rem;
      color: #333;
    }
    .btn-sm {
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class RightSidebarComponent {}