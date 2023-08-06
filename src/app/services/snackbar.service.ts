import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showSnackbar(message: string, action: string = 'Close', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}