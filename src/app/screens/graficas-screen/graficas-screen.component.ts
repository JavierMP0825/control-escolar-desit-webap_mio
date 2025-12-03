import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Totales obtenidos del backend
  totalAdmins = 0;
  totalAlumnos = 0;
  totalMaestros = 0;

  // Totales de materias
  totalMaterias = 0;

  // Gráficas dinámicas
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
      }
    ]
  };

  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
      }
    ]
  };

  barChartData = {
    labels: [
      "Ing. Ciencias de la Computación",
      "Lic. Ciencias de la Computación",
      "Ing. Tecnologías de la Información"
    ],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Materias por Programa Educativo',
        backgroundColor: ['#4285F4', '#F4B400', '#0F9D58']
      }
    ]
  };

  radarChartData = {
    labels: [
      "Ing. Ciencias de la Computación",
      "Lic. Ciencias de la Computación",
      "Ing. Tecnologías de la Información"
    ],
    datasets: [
      {
        label: "Materias por Programa Educativo",
        data: [0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
      }
    ]
  };

  pieChartPlugins = [DatalabelsPlugin];
  doughnutChartPlugins = [DatalabelsPlugin];
  barChartPlugins = [DatalabelsPlugin];

  constructor(
    private adminService: AdministradoresService,
    private materiasService: MateriasService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.adminService.getTotalUsuarios().subscribe(
      (response) => {
        this.totalAdmins = response.admins;
        this.totalMaestros = response.maestros;
        this.totalAlumnos = response.alumnos;

        this.actualizarGraficas();
      },
      (error) => {
        console.log("Error al obtener total de usuarios", error);
        alert("No se pudo obtener el total de usuarios por rol");
      }
    );

    this.materiasService.obtenerListaMaterias().subscribe(
      materias => {

        this.totalMaterias = materias.length;

        let icc = 0;
        let lcc = 0;
        let iti = 0;

        materias.forEach(m => {
          const programa = (m.programa_educativo || "").toLowerCase();

          if (programa.includes("ingeniería en ciencias de la computación")) icc++;
          if (programa.includes("licenciatura en ciencias de la computación")) lcc++;
          if (programa.includes("ingeniería en tecnologías de la información")) iti++;
        });

        this.barChartData.datasets[0].data = [icc, lcc, iti];
        this.radarChartData.datasets[0].data = [icc, lcc, iti];

      },
      error => {
        console.log("Error al obtener lista de materias", error);
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  actualizarGraficas() {
    // Gráfica Pie
    this.pieChartData.datasets[0].data = [
      this.totalAdmins,
      this.totalMaestros,
      this.totalAlumnos
    ];

    // Gráfica Doughnut
    this.doughnutChartData.datasets[0].data = [
      this.totalAdmins,
      this.totalMaestros,
      this.totalAlumnos
    ];
  }

  radarChartOption = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: { beginAtZero: true }
    }
  };

  barChartOption = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };

  pieChartOption = {
    responsive: true,
    maintainAspectRatio: false
  };

  doughnutChartOption = {
    responsive: true,
    maintainAspectRatio: false
  };

}
