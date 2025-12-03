import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaMateria(){
    return {
      nrc: '',
      nombre_materia: '',
      section: '',
      dias_json: [],
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa_educativo: '',
      maestro: '',
      creditos: ''
    }
  }
  public validarMateria(data: any, editar: boolean) {
    console.log("Validando materia... ", data);

    let error: any = {};

    // NRC
    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    }

    // Nombre materia
    if (!this.validatorService.required(data["nombre_materia"])) {
      error["nombre_materia"] = this.errorService.required;
    }

    // Section
    if (!this.validatorService.required(data["section"])) {
      error["section"] = this.errorService.required;
    }

    // Días
    if (!data["dias_json"] || data["dias_json"].length === 0) {
      error["dias_json"] = "Debes seleccionar dias para poder dar clases.";
    }

    // Hora inicio
    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    // Hora fin
    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    // Comparación de horas si ambas existen
    if (data["hora_inicio"] && data["hora_fin"]) {
      const inicio = data["hora_inicio"];
      const fin = data["hora_fin"];

      if (inicio >= fin) {
        error["hora_fin"] = "La hora final no puede ser menor o igual que la hora de inicio.";
      }
    }

    // Salón
    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    }

    // Programa educativo
    if (!this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    // Maestro
    if (!this.validatorService.required(data["maestro"])) {
      error["maestro"] = this.errorService.required;
    }

    // Créditos
    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    }

    return error;
  }


 // Registrar una nueva materia
  public registrarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  // Obtener lista de materias
  public obtenerListaMaterias(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  // Obtener materia por ID
  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  // Actualizar materia
  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  // Eliminar materia
  public eliminarMateria(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }
}
