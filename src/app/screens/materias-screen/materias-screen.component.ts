import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EliminarMateriaModalComponent } from 'src/app/modals/eliminar-materia-modal/eliminar-materia-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";

  public lista_materias: any[] = [];

  displayedColumns: string[] = [
    'nrc', 'nombre_materia', 'section', 'programa_educativo',
    'maestro', 'hora_inicio', 'hora_fin', 'salon', 'dias_json'
  ];

  // Si el usuario es administrador, agregamos botones de acción
  dataSource = new MatTableDataSource<any>(this.lista_materias);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private maestrosService: MaestrosService,
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

    // Agregar columnas de edición SOLO para admin
    if (this.rol === "administrador") {
      this.displayedColumns.push("editar", "eliminar");
    }

    this.obtenerMaterias();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (materias) => {
        // Convertir dias_json a array si viene como string
        this.lista_materias = materias.map((materia: any) => {
          if (typeof materia.dias_json === 'string') {
            try {
              materia.dias_json = JSON.parse(materia.dias_json);
            } catch {
              materia.dias_json = [];
            }
          }

          // Inicializar nombre de maestro para mostrar en tabla
          materia.maestro_nombre = "";

          return materia;
        });

        console.log("Lista materias: ", this.lista_materias);

        this.dataSource = new MatTableDataSource<any>(this.lista_materias);

        // Obtener nombre del maestro por ID
        this.lista_materias.forEach((materia) => {
          this.maestrosService.obtenerMaestroPorID(materia.maestro).subscribe(
            (maestro) => {
              materia.maestro_nombre = maestro.user.first_name + ' ' + maestro.user.last_name;
              this.dataSource.data = [...this.lista_materias]; // refrescar tabla
            },
            (error) => {
              console.error(`Error al obtener maestro con ID ${materia.maestro}:`, error);
              materia.maestro_nombre = "Desconocido";
            }
          );
        });

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      (error) => {
        console.error("Error al obtener la lista de materias: ", error);
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public goEditar(idMateria: number) {
    if (this.rol !== "administrador") {
      return alert("No tienes permisos para editar materias.");
    }
    this.router.navigate(["registro-usuarios/materias/" + idMateria]);
  }

  public delete(idMateria: number) {
    if (this.rol !== "administrador") {
      return alert("No tienes permisos para eliminar materias.");
    }

    const dialogRef = this.dialog.open(EliminarMateriaModalComponent, {
      data: { id: idMateria },
      height: '280px',
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isDelete) {
        alert("Materia eliminada correctamente");
        window.location.reload();
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }
}
