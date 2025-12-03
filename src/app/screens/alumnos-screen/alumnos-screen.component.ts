import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  displayedColumns: string[] = [
    'matricula', 'nombre', 'email', 'fecha_nacimiento',
    'curp', 'rfc', 'edad', 'telefono', 'editar', 'eliminar'
  ];

  dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token === "") {
      this.router.navigate(["/"]);
    }

    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;

        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(alumno => {
            alumno.first_name = alumno.user.first_name;
            alumno.last_name = alumno.user.last_name;
            alumno.email = alumno.user.email;
          });

          this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos);

          //Conecion del paginador y el sort
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      },
      (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  //Método de filtrado
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
  }

  public delete(idUser: number) {
      //Administrador puede eliminar cualquier alumno
      //Maestro puede eliminar cualquier alumno
      //Alumno solo puede eliminarse a sí mismo
      const userId = Number(this.facadeService.getUserId());
      if (this.rol === "administrador" || this.rol === "maestros" || (this.rol === "alumnos" && userId === idUser)) {
        //Si es administrador, maestro o es el mismo alumno, se puede eliminar
        const dialogRef = this.dialog.open(EliminarUserModalComponent,{
          data: {id: idUser, rol: 'alumnos'}, //Se pasan valores a través del componente modal
          height: '288px',
          width: '328px'
        });

        dialogRef.afterClosed().subscribe(result => {
          if(result.isDelete) {
            console.log("Alumno eliminado correctamente: ", idUser);
            alert("Alumno eliminado correctamente.");
            //Refrescar la pagina
            window.location.reload();
          } else {
            alert("Alumno no se a podido eliminar.");
            console.log("No se eliminó al alumno");
          }

        });
      }else {
        alert("No tienes permisos para eliminar a este alumno.");
      }
    }
}

export interface DatosAlumno {
  id: number;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  curp: string;
  rfc: string;
  edad: number;
  telefono: string;
}
