export interface NgTableColumn {
    type?: 'checkbox';
    title?: string;
    name?: string;
    template?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sort?: boolean;
    format?: NgTableFormat;
    
  }
  
 
  export enum NgTableFormat {
    Date = 1,
    DateTime =2,
    Number=3,
    Masking=4,
  }
