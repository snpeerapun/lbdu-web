import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  selectedFundType: string = 'all';
  searchText: string = '';
  
  fundTypes = [
    { value: 'all', label: 'กองทุนทั้งหมด' },
    { value: 'equity-th', label: 'กองทุนหุ้นในประเทศ' },
    { value: 'equity-foreign', label: 'กองทุนหุ้นต่างประเทศ' },
    { value: 'fixed-income-th', label: 'กองทุนตราสารหนี้ในประเทศ' },
    { value: 'fixed-income-foreign', label: 'กองทุนตราสารหนี้ต่างประเทศ' },
    { value: 'mixed', label: 'กองทุนผสม' },
    { value: 'feeder', label: 'กองทุน Feeder Fund' },
    { value: 'term-fund', label: 'กองทุนมีกำหนดอายุโครงการ' },
    { value: 'property-reit', label: 'กองทุนอสังหาริมทรัพย์และ REIT' },
    { value: 'ssf', label: 'กองทุน SSF' },
    { value: 'rmf', label: 'กองทุน RMF' }
  ];

  funds = [
    // กองทุนหุ้นในประเทศ
    {
      code: 'LHSELECT',
      name: 'กองทุนเปิด แอล เอช เลือกหุ้น',
      type: 'equity-th',
      nav: 12.3456,
      change: 0.15,
      date: '23/02/2567'
    },
    {
      code: 'LHESG',
      name: 'กองทุนเปิด แอล เอช หุ้นไทยยั่งยืน ESG',
      type: 'equity-th',
      nav: 15.8765,
      change: -0.25,
      date: '23/02/2567'
    },
    {
      code: 'LHSTRATEGY',
      name: 'กองทุนเปิด แอล เอช ยุทธศาสตร์หุ้นระยะยาว',
      type: 'equity-th',
      nav: 18.4532,
      change: 0.45,
      date: '23/02/2567'
    },
    
    // กองทุนหุ้นต่างประเทศ
    {
      code: 'LHGEM',
      name: 'กองทุนเปิด แอล เอช โกลบอล อิควิตี้',
      type: 'equity-foreign',
      nav: 11.8654,
      change: 0.32,
      date: '23/02/2567'
    },
    {
      code: 'LHCHINA',
      name: 'กองทุนเปิด แอล เอช หุ้นจีน',
      type: 'equity-foreign',
      nav: 9.8765,
      change: -0.45,
      date: '23/02/2567'
    },

    // กองทุนตราสารหนี้ในประเทศ
    {
      code: 'LHSTPLUS',
      name: 'กองทุนเปิด แอล เอช ตราสารหนี้ระยะสั้นพลัส',
      type: 'fixed-income-th',
      nav: 10.2345,
      change: 0.05,
      date: '23/02/2567'
    },
    {
      code: 'LHGOVT',
      name: 'กองทุนเปิด แอล เอช ตราสารหนี้ภาครัฐ',
      type: 'fixed-income-th',
      nav: 11.4567,
      change: 0.08,
      date: '23/02/2567'
    },

    // กองทุนตราสารหนี้ต่างประเทศ
    {
      code: 'LHGINFIN',
      name: 'กองทุนเปิด แอล เอช โกลบอล อินคัม',
      type: 'fixed-income-foreign',
      nav: 9.8765,
      change: -0.12,
      date: '23/02/2567'
    },

    // กองทุนผสม
    {
      code: 'LHIP',
      name: 'กองทุนเปิด แอล เอช อินคัม พลัส',
      type: 'mixed',
      nav: 11.5678,
      change: 0.25,
      date: '23/02/2567'
    },

    // กองทุน Feeder Fund
    {
      code: 'LHUSTECH',
      name: 'กองทุนเปิด แอล เอช ยูเอส เทคโนโลยี',
      type: 'feeder',
      nav: 13.6789,
      change: 0.65,
      date: '23/02/2567'
    },

    // กองทุนอสังหาริมทรัพย์และ REIT
    {
      code: 'LHPROP-INFRA',
      name: 'กองทุนเปิด แอล เอช พร็อพเพอร์ตี้ พลัส I',
      type: 'property-reit',
      nav: 10.8765,
      change: -0.15,
      date: '23/02/2567'
    },

    // กองทุน SSF
    {
      code: 'LHESGSSFX',
      name: 'กองทุนเปิด แอล เอช หุ้นไทย ESG SSF',
      type: 'ssf',
      nav: 12.3456,
      change: 0.28,
      date: '23/02/2567'
    },

    // กองทุน RMF
    {
      code: 'LHEQRMF',
      name: 'กองทุนเปิด แอล เอช หุ้นระยะยาว RMF',
      type: 'rmf',
      nav: 14.5678,
      change: 0.35,
      date: '23/02/2567'
    }
  ];

  get filteredFunds() {
    return this.funds.filter(fund => {
      const matchesType = this.selectedFundType === 'all' || fund.type === this.selectedFundType;
      const matchesSearch = this.searchText === '' || 
        fund.code.toLowerCase().includes(this.searchText.toLowerCase()) ||
        fund.name.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesType && matchesSearch;
    });
  }
}
