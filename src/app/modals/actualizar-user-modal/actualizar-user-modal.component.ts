import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-actualizar-user-modal',
  templateUrl: './actualizar-user-modal.component.html',
  styleUrls: ['./actualizar-user-modal.component.scss']
})
export class ActualizarUserModalComponent {

  constructor(
    private dialogRef: MatDialogRef<ActualizarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cerrar_modal() {
    this.dialogRef.close({ updated: false });
  }

  confirmarActualizar() {
    this.dialogRef.close({ updated: true });
  }

}
