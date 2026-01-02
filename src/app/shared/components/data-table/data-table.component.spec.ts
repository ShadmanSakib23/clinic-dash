import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data in table', () => {
    const testData = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' }
    ];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    expect(component.data()).toEqual(testData);
    expect(component.columns()).toEqual(testColumns);
  });

  it('should filter data based on search term', () => {
    const testData = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    component.onSearchChange('John');
    fixture.detectChanges();

    expect(component.filteredData().length).toBe(1);
    expect(component.filteredData()[0].name).toBe('John Doe');
  });

  it('should sort data', () => {
    const testData = [
      { id: 2, name: 'Beta' },
      { id: 1, name: 'Alpha' }
    ];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    component.onSortChange({ active: 'name', direction: 'asc' });
    fixture.detectChanges();

    expect(component.sortedData()[0].name).toBe('Alpha');
  });

  it('should paginate data', () => {
    const testData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`
    }));
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();

    expect(component.paginatedData().length).toBe(10);
    expect(component.totalRecords()).toBe(25);
  });

  it('should handle row selection', () => {
    const testData = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' }
    ];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('showSelection', true);
    fixture.detectChanges();

    component.toggleRow(testData[0]);
    expect(component.selection.isSelected(testData[0])).toBe(true);

    component.toggleRow(testData[0]);
    expect(component.selection.isSelected(testData[0])).toBe(false);
  });

  it('should emit row click event', () => {
    const testData = [{ id: 1, name: 'Test 1' }];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    let emittedRow: any = null;
    component.rowClick.subscribe((row) => {
      emittedRow = row;
    });

    component.onRowClick(testData[0]);
    
    expect(emittedRow).toEqual(testData[0]);
  });

  it('should clear filters', () => {
    const testData = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    component.onSearchChange('John');
    component.applyFilter('status', 'active');
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('John');
    expect(component.hasActiveFilters()).toBe(true);

    component.clearFilters();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should display empty message when no data', () => {
    const testColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];

    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const emptyMessage = compiled.querySelector('.no-data-content p');
    expect(emptyMessage.textContent).toContain('No records found');
  });
});
