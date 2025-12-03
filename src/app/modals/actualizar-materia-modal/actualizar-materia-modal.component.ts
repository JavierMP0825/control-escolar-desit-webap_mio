import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-actualizar-materia-modal',
  templateUrl: './actualizar-materia-modal.component.html',
  styleUrls: ['./actualizar-materia-modal.component.scss']
})
export class ActualizarMateriaModalComponent {

  constructor(
    private dialogRef: MatDialogRef<ActualizarMateriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cerrar_modal() {
    this.dialogRef.close({ confirmar: false });
  }

  confirmarActualizar() {
    this.dialogRef.close({ confirmar: true });
  }

}
