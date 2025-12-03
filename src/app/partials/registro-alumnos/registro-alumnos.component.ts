import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatDialog } from '@angular/material/dialog';
import { ActualizarUserModalComponent } from 'src/app/modals/actualizar-user-modal/actualizar-user-modal.component';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public alumno: any = {};
  public token: string = "";
  public errors: any = {};
  public editar: boolean = false;
  public idUser: Number = 0;

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {

    // Igual que maestros: cargar esquema
    this.alumno = this.alumnosService.esquemaAlumno();

    // Asignar el rol
    this.alumno.rol = this.rol;

    // MODO EDICIÓN (MISMA LÓGICA QUE MAESTROS)
    if (this.datos_user && this.datos_user.id) {
      this.editar = true;

      // Rellenar alumno con los datos existentes (exactamente como maestros)
      this.alumno = this.datos_user;

      // Convertir fecha si viene como string
      if (this.alumno.fecha_nacimiento) {
        this.alumno.fecha_nacimiento = new Date(this.alumno.fecha_nacimiento);
      }
    }

    console.log("Alumno cargado:", this.alumno);
  }

  public regresar() {
    this.location.back();
  }

  // Registrar alumno (idéntico a maestros)
  public registrar() {

    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    if (this.alumno.password == this.alumno.confirmar_password) {

      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado:", response);

          if (this.token && this.token !== "") {
            this.router.navigate(["alumnos"]);
          } else {
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno:", error);
        }
      );

    } else {
      alert("Las contraseñas no coinciden");
      this.alumno.password = "";
      this.alumno.confirmar_password = "";
    }
  }

  public abrirModalActualizar() {
    const dialogRef = this.dialog.open(ActualizarUserModalComponent, {
      data: {
        id: this.idUser,
        usuario: this.alumno,
        rol: 'alumno'
      },
      width: '328px',
      height: '288px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result?.updated) {
        this.actualizar();
      }
    });
  }


  // Actualizar alumno (igual que actualizarMaestro)
  public actualizar() {
    // Validación de los datos
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Ejecutamos el servicio de actualización
    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response) => {
        alert("Alumno actualizado exitosamente");
        console.log("Alumno actualizado: ", response);
        this.router.navigate(["alumnos"]);
      },
      (error) => {
        alert("Error al actualizar alumno");
        console.error("Error al actualizar alumno: ", error);
      }
    );
  }


  // Mostrar contraseña
  showPassword() {
    if (this.inputType_1 == 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar() {
    if (this.inputType_2 == 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public changeFecha(event: any) {
    if (!event || !event.value) return;

    const date = event.value instanceof Date ? event.value : new Date(event.value);
    this.alumno.fecha_nacimiento = date.toISOString().split("T")[0];
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

}
