import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy, inject, SecurityContext, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Column Configuration Interface
 * Defines how each column should be displayed and behave
 */
export interface TableColumn<T = any> {
  /** Unique identifier for the column */
  key: string;
  /** Display header text */
  label: string;
  /** Whether column is sortable (default: true) */
  sortable?: boolean;
  /** Whether column is searchable (default: true) */
  searchable?: boolean;
  /** Custom cell template function */
  cellTemplate?: (row: T) => string;
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (CSS value) */
  width?: string;
  /** Whether column is sticky (for actions) */
  sticky?: 'start' | 'end';
}

/**
 * Filter Configuration Interface
 */
export interface TableFilter {
  /** Filter label */
  label: string;
  /** Filter key matching data property */
  key: string;
  /** Filter type */
  type: 'text' | 'select' | 'date' | 'number';
  /** Options for select type */
  options?: { value: any; label: string }[];
}

/**
 * Reusable Data Table Component
 * 
 * Features:
 * - Sorting on all columns
 * - Global search across searchable columns
 * - Column-specific filters
 * - Pagination with configurable page sizes
 * - Row selection (single/multiple)
 * - Responsive design
 * - Custom cell templates
 * - Export functionality ready
 * 
 * Usage:
 * ```html
 * <app-data-table
 *   [data]="patients"
 *   [columns]="columns"
 *   [pageSize]="10"
 *   [showSearch]="true"
 *   [showSelection]="true"
 *   (rowClick)="onRowClick($event)"
 *   (selectionChange)="onSelectionChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-data-table',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = any> implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  // Input signals
  /** Source data array */
  readonly data = input.required<T[]>();
  
  /** Column definitions */
  readonly columns = input.required<TableColumn<T>[]>();
  
  /** Show global search bar */
  readonly showSearch = input<boolean>(true);
  
  /** Show row selection checkboxes */
  readonly showSelection = input<boolean>(false);
  
  /** Enable multi-select (default: true) */
  readonly multiSelect = input<boolean>(true);
  
  /** Show pagination */
  readonly showPagination = input<boolean>(true);
  
  /** Initial page size */
  readonly pageSize = input<number>(10);
  
  /** Available page size options */
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);
  
  /** Column filters */
  readonly filters = input<TableFilter[]>([]);
  
  /** Loading state */
  readonly loading = input<boolean>(false);
  
  /** Empty state message */
  readonly emptyMessage = input<string>('No data available');
  
  /** Table height (for virtual scrolling) */
  readonly height = input<string>('auto');
  
  // Output events
  /** Emitted when a row is clicked */
  readonly rowClick = output<T>();
  
  /** Emitted when selection changes */
  readonly selectionChange = output<T[]>();
  
  /** Emitted when sort changes */
  readonly sortChange = output<Sort>();
  
  /** Emitted when page changes */
  readonly pageChange = output<PageEvent>();

  // Internal state signals
  readonly searchTerm = signal<string>('');
  readonly activeFilters = signal<Record<string, any>>({});
  readonly sortState = signal<Sort>({ active: '', direction: '' });
  readonly currentPage = signal<number>(0);
  readonly currentPageSize = signal<number>(this.pageSize());
  
  // Search debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  // Selection model
  selection = new SelectionModel<T>(this.multiSelect(), []);

  // Regular properties for mat-table (required by Angular Material)
  displayedColumnsArray: string[] = [];
  dataSourceArray: T[] = [];

  // Computed signals
  /** Displayed columns including selection if enabled */
  readonly displayedColumns = computed(() => {
    const cols = this.columns().map(col => col.key);
    return this.showSelection() ? ['select', ...cols] : cols;
  });

  /** Filtered data based on search and filters */
  readonly filteredData = computed(() => {
    let result = [...this.data()];
    
    // Apply global search
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(item => 
        this.columns()
          .filter(col => col.searchable !== false)
          .some(col => {
            const value = this.getNestedValue(item, col.key);
            return value?.toString().toLowerCase().includes(search);
          })
      );
    }

    // Apply column filters
    const filters = this.activeFilters();
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const value = this.getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        });
      }
    });
    
    return result;
  });

  /** Sorted data */
  readonly sortedData = computed(() => {
    const data = [...this.filteredData()];
    const sort = this.sortState();
    
    if (!sort.active || sort.direction === '') {
      return data;
    }
    
    return data.sort((a, b) => {
      const aValue = this.getNestedValue(a, sort.active);
      const bValue = this.getNestedValue(b, sort.active);
      
      const comparison = this.compare(aValue, bValue);
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  });

  /** Paginated data */
  readonly paginatedData = computed(() => {
    if (!this.showPagination()) {
      return this.sortedData();
    }
    
    const startIndex = this.currentPage() * this.currentPageSize();
    const endIndex = startIndex + this.currentPageSize();
    return this.sortedData().slice(startIndex, endIndex);
  });

  /** Total records count */
  readonly totalRecords = computed(() => this.filteredData().length);

  /** Whether all rows are selected */
  readonly isAllSelected = computed(() => {
    const numSelected = this.selection.selected.length;
    const numRows = this.paginatedData().length;
    return numSelected === numRows && numRows > 0;
  });

  /** Whether some rows are selected (for indeterminate state) */
  readonly isIndeterminate = computed(() => {
    const numSelected = this.selection.selected.length;
    return numSelected > 0 && !this.isAllSelected();
  });

  constructor() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchTerm.set(value);
        this.currentPage.set(0);
      });

    // Sync dataSource array for mat-table
    effect(() => {
      this.dataSourceArray = this.paginatedData();
      console.log('DataTable - dataSourceArray updated:', this.dataSourceArray);
    });

    // Sync displayedColumns array for mat-table
    effect(() => {
      this.displayedColumnsArray = this.displayedColumns();
      console.log('DataTable - displayedColumns:', this.displayedColumnsArray);
    });

    // Debug logging
    effect(() => {
      console.log('DataTable - received data:', this.data());
      console.log('DataTable - filteredData:', this.filteredData());
      console.log('DataTable - paginatedData:', this.paginatedData());
    });

    // Update page size when input changes
    effect(() => {
      this.currentPageSize.set(this.pageSize());
    });

    // Emit selection changes
    effect(() => {
      if (this.showSelection()) {
        this.selectionChange.emit(this.selection.selected);
      }
    });
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: Sort): void {
    this.sortState.set(sort);
    this.sortChange.emit(sort);
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  /**
   * Handle row click
   */
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  /**
   * Toggle all rows selection
   */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.paginatedData());
    }
  }

  /**
   * Toggle single row selection
   */
  toggleRow(row: T): void {
    this.selection.toggle(row);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }

  /**
   * Apply column filter
   */
  applyFilter(key: string, value: any): void {
    this.activeFilters.update(filters => ({
      ...filters,
      [key]: value
    }));
    this.currentPage.set(0); // Reset to first page
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.activeFilters.set({});
    this.searchTerm.set('');
    this.currentPage.set(0);
  }

  /**
   * Get cell value with custom template support
   */
  getCellValue(row: T, column: TableColumn<T>): SafeHtml {
    const value = column.cellTemplate 
      ? column.cellTemplate(row)
      : this.getNestedValue(row, column.key)?.toString() || '-';
    
    return this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
  }

  /**
   * Get nested property value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Compare two values for sorting
   */
  private compare(a: any, b: any): number {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    
    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    
    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    // Handle strings
    return a.toString().localeCompare(b.toString());
  }

  /**
   * Export selected or all data
   * TODO: Implement export to CSV/Excel
   */
  exportData(): void {
    const dataToExport = this.selection.selected.length > 0 
      ? this.selection.selected 
      : this.filteredData();
    
    console.log('Exporting data:', dataToExport);
    // TODO: Implement actual export logic
  }

  /**
   * Template helper methods
   */

  /**
   * Check if there are active filters
   */
  hasActiveFilters(): boolean {
    return Object.keys(this.activeFilters()).length > 0;
  }

  /**
   * Get active filter entries for template iteration
   */
  getActiveFilterEntries(): Array<{ key: string; value: string }> {
    return Object.entries(this.activeFilters())
      .filter(([_, value]) => value)
      .map(([key, value]) => ({ key, value }));
  }

  /**
   * Get end record number for result summary
   */
  getEndRecord(): number {
    return Math.min((this.currentPage() + 1) * this.currentPageSize(), this.totalRecords());
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }
}
