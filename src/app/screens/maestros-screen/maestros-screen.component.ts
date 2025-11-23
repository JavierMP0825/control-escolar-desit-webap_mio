import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  displayedColumns: string[] = [
    'clave_maestro', 'nombre', 'email', 'fecha_nacimiento',
    'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'
  ];

  dataSource = new MatTableDataSource<DatosMaestro>(this.lista_maestros as DatosMaestro[]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if (this.token === "") {
      this.router.navigate(["/"]);
    }

    this.obtenerMaestros();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          this.lista_maestros.forEach(maestro => {
            maestro.first_name = maestro.user.first_name;
            maestro.last_name = maestro.user.last_name;
            maestro.email = maestro.user.email;
          });

          this.dataSource = new MatTableDataSource<DatosMaestro>(this.lista_maestros);

          //Conexión del paginador y el sort
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      },
      (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  //Método de filtrado
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/maestros/" + idUser]);
  }

  public delete(idUser: number) {
    console.log("Eliminar maestro con ID:", idUser);
  }
}

export interface DatosMaestro {
  id: number;
  clave_maestro: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  cubiculo: string;
  area_investigacion: string;
}
