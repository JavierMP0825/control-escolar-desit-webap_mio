import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  // Para selects y checkboxes
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.maestro = this.maestrosService.esquemaMaestro();
    this.maestro.rol = this.rol;
    console.log("Datos maestro: ", this.maestro);

    if (this.datos_user && this.datos_user.id) {
      this.editar = true;
      this.maestro = this.datos_user;

      // Convertir materias si vienen como string
      if (typeof this.maestro.materias_json === "string") {
        try {
          this.maestro.materias_json = JSON.parse(this.maestro.materias_json);
        } catch {
          this.maestro.materias_json = [];
        }
      }
    }

  }

  // Mostrar/ocultar contraseñas
  public showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    if(this.maestro.password !== this.maestro.confirmar_password){
      alert('Las contraseñas no coinciden');
      this.maestro.password="";
      this.maestro.confirmar_password="";
      return false;
    }

    this.maestrosService.registrarMaestro(this.maestro).subscribe({
      next: (response:any) => {
        alert('Maestro registrado con éxito');
        console.log("Maestro registrado",response);

        if(this.token !== "" && this.token){
          this.router.navigate(['maestro']);
        }else{
          this.router.navigate(['/']);
        }
      },
      error: (error:any) => {
        if(error.status === 422){
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el maestro');
        }
      }
    });
  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Ejecutamos el servicio de actualización
    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Maestro actualizado exitosamente");
        console.log("Maestro actualizado: ", response);
        this.router.navigate(["maestros"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar maestro");
        console.error("Error al actualizar maestro: ", error);
      }
    );

  }

  public changeFecha(event: any){
    const date = event.value instanceof Date ? event.value : new Date(event.value);
    if (!isNaN(date.getTime())) {
      this.maestro.fecha_nacimiento = date.toISOString().split("T")[0];
      console.log("Fecha: ", this.maestro.fecha_nacimiento);
    } else {
      console.warn("Fecha inválida:", event.value);
    }
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      this.maestro.materias_json = this.maestro.materias_json.filter((m:string) => m != event.source.value);
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element)=>element==nombre);
      return busqueda != undefined;
    }else{
      return false;
    }
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

  public soloLetrasNumeros(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[A-Za-z0-9]$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }
}
