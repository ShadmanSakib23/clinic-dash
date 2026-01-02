import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Reusable modal component using Angular Material Dialog
 * Can be used for any modal content with consistent styling
 */
@Component({
  selector: 'app-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  title = input.required<string>();

  subtitle = input<string>('');
  icon = input<string>('');
  showClose = input<boolean>(true);
  loading = input<boolean>(false);
  primaryActionText = input<string>('Save');
  secondaryActionText = input<string>('Cancel');
  showPrimaryAction = input<boolean>(true);
  showSecondaryAction = input<boolean>(true);
  primaryActionDisabled = input<boolean>(false);
  primaryActionColor = input<'primary' | 'accent' | 'warn'>('primary');
  primaryAction = output<void>();
  secondaryAction = output<void>();
  closed = output<void>();

  onPrimaryAction(): void {
    if (!this.loading() && !this.primaryActionDisabled()) {
      this.primaryAction.emit();
    }
  }

  onSecondaryAction(): void {
    if (!this.loading()) {
      this.secondaryAction.emit();
    }
  }

  onClose(): void {
    if (!this.loading()) {
      this.closed.emit();
    }
  }
}
