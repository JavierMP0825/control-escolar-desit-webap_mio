import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { ActualizarMateriaModalComponent } from 'src/app/modals/actualizar-materia-modal/actualizar-materia-modal.component';


@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {

  @Input() datos_materia: any = {};
  @Input() editar: boolean = false;
  @Input() rol!: string;
  @Input() datos_user: any = null;

  public materia: any = {};
  public errors: any = {};

  public maestros: any[] = [];
  public programas: string[] = [
    "Ingeniería en Ciencias de la Computación",
    "Licenciatura en Ciencias de la Computación",
    "Ingeniería en Tecnologías de la Información"
  ];

  public diasSemana: string[] = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"
  ];

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Obtener el esquema vacío
    this.materia = this.materiasService.esquemaMateria();
    console.log("Materia inicial:", this.materia);

    if (!Array.isArray(this.materia.dias_json)) {
      this.materia.dias_json = [];
    }

    // Si viene en modo edición
    if (this.datos_user && this.datos_user.id) {
      this.editar = true;
      this.materia = this.datos_user;

      // Convertir días si vienen como string
      if (typeof this.materia.dias_json === "string") {
        try {
          this.materia.dias_json = JSON.parse(this.materia.dias_json);
        } catch {
          this.materia.dias_json = [];
        }
      }

      // Convertir horas a formato 12 horas para mostrar en el input
      this.materia.hora_inicio = this.convertirHora12(this.materia.hora_inicio);
      this.materia.hora_fin = this.convertirHora12(this.materia.hora_fin);

      console.log("Modo edición - Materia cargada:", this.materia);
    }

    // Cargar maestros desde BD
    this.cargarMaestros();
  }

  private convertirHora24(hora: string): string {
    if (!hora) return "";

    const [time, modifier] = hora.split(" ");
    let [hours, minutes] = time.split(":");

    let h = parseInt(hours, 10);

    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    // Formatear a HH:MM
    return `${h.toString().padStart(2, "0")}:${minutes}`;
  }

  private convertirHora12(hora24: string): string {
    if (!hora24) return '';

    let [horas, minutos] = hora24.split(':').map(Number);
    let modifier = 'AM';

    if (horas >= 12) {
      modifier = 'PM';
      if (horas > 12) horas -= 12;
    } else if (horas === 0) {
      horas = 12;
    }

    return `${horas}:${minutos.toString().padStart(2, '0')} ${modifier}`;
  }


  public cargarMaestros() {
  this.maestrosService.obtenerListaMaestros().subscribe({
    next: (response: any) => {

      // Normalizamos los datos igual que en MaestrosScreenComponent
      this.maestros = response.map((maestro: any) => {
        return {
          ...maestro,
          first_name: maestro.user?.first_name || "",
          last_name: maestro.user?.last_name || ""
        };
      });

      console.log("Maestros cargados:", this.maestros);
    },

    error: () => {
      alert("Error al cargar maestros");
    }
  });
}


  public regresar() {
    this.location.back();
  }


  public registrar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    this.materia.dias_json = JSON.stringify(this.materia.dias_json);

    this.materia.hora_inicio = this.convertirHora24(this.materia.hora_inicio);
    this.materia.hora_fin = this.convertirHora24(this.materia.hora_fin);

    this.materiasService.registrarMateria(this.materia).subscribe({
      next: (response: any) => {
        alert("Materia registrada con éxito");
        this.router.navigate(['/materias']);
      },
      error: (error: any) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          alert("Error al registrar materia");
        }
      }
    });
  }

  public abrirModalActualizarMateria() {
    const dialogRef = this.dialog.open(ActualizarMateriaModalComponent, {
      width: '320px',
      height: '260px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmar) {
        this.actualizar();
      } else {
        alert("Actualización cancelada.");
      }
    });
  }


  public actualizar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    this.materia.dias_json = JSON.stringify(this.materia.dias_json);

    this.materia.hora_inicio = this.convertirHora24(this.materia.hora_inicio);
    this.materia.hora_fin = this.convertirHora24(this.materia.hora_fin);

    this.materiasService.actualizarMateria(this.materia).subscribe({
      next: () => {
        alert("Materia actualizada correctamente");
        this.router.navigate(['/materias']);
      },
      error: () => {
        alert("Error al actualizar materia");
      }
    });
  }



  public checkboxDiasChange(event: any) {
    if (event.checked) {
      this.materia.dias_json.push(event.source.value);
    } else {
      this.materia.dias_json = this.materia.dias_json.filter((d: string) => d !== event.source.value);
    }
  }

  public diaSeleccionado(dia: string) {
    return this.materia.dias_json?.includes(dia);
  }

  public soloNumeros(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[0-9]$/;
    if (!regex.test(char)) event.preventDefault();
  }

  public soloLetrasEspacios(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }

  public soloAlfanumericoEspacios(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[A-Za-z0-9 ]$/;
    if (!regex.test(char)) event.preventDefault();
  }
}
