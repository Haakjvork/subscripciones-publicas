const form = document.querySelector("#tax-form");
const resultPanel = document.querySelector("#result-panel");
const kpisEl = document.querySelector(".kpis");
const resultSubtitleEl = document.querySelector("#result-subtitle");
const breakdownTableEl = document.querySelector("#breakdown-table");

// 1. Tramos oficiales de la escala general estatal del IRPF
const TRAMOS = [
    { limite: 12450, tipo: 0.19 },
    { limite: 20200, tipo: 0.24 },
    { limite: 35200, tipo: 0.30 },
    { limite: 60000, tipo: 0.35 },
    { limite: 300000, tipo: 0.45 },
    { limite: Infinity, tipo: 0.47 }
];

// Mínimo personal exento general
const MINIMO_PERSONAL = 5550;

//Los porcentajes se aplican de forma proporcional sobre el Gasto Público Consolidado total de España según la clasificación COFOG de la IGAE
const ARRAY_CATEGORIAS = [
  { "nombre": "Pensiones de Jubilación", "porcentaje": 24.8 },
  { "nombre": "Resto de Pensiones (Viudedad, Invalidez...)", "porcentaje": 9.7 },
  { "nombre": "Sanidad: Hospitales y Urgencias", "porcentaje": 7.8 },
  { "nombre": "Intereses de la Deuda Pública", "porcentaje": 5.8 },
  { "nombre": "El Paro (Subsidios por Desempleo)", "porcentaje": 6.2 },
  { "nombre": "Educación Secundaria, Bachiller y FP", "porcentaje": 4.1 },
  { "nombre": "Educación Primaria e Infantil", "porcentaje": 3.6 },
  { "nombre": "Sanidad: Recetas y Medicamentos", "porcentaje": 2.9 },
  { "nombre": "Defensa y Ejército", "porcentaje": 2.9 },
  { "nombre": "Universidades y Mecanismos de Becas", "porcentaje": 2.6 },
  { "nombre": "Sanidad: Médicos de Cabecera (Atención Primaria)", "porcentaje": 2.3 },
  { "nombre": "Policía Nacional y Guardia Civil", "porcentaje": 2.2 },
  { "nombre": "Sanidad: Médicos Especialistas y Consultas", "porcentaje": 2.1 },
  { "nombre": "Policías Locales y Autonómicas", "porcentaje": 2.1 },
  { "nombre": "Ayudas a Industria, Energía e I+D+i", "porcentaje": 1.8 },
  { "nombre": "Vías de Tren y Cercanías (ADIF/Renfe)", "porcentaje": 1.7 },
  { "nombre": "Mantenimiento de Carreteras y Autovías", "porcentaje": 1.6 },
  { "nombre": "Justicia y Prisiones", "porcentaje": 1.4 },
  { "nombre": "Limpieza Viaria, Basuras y Alcantarillado", "porcentaje": 1.4 },
  { "nombre": "Cultura, Deportes y Conservación de Patrimonio", "porcentaje": 1.3 },
  { "nombre": "Gastos Administrativos (Estado Central)", "porcentaje": 1.1 },
  { "nombre": "Gastos Administrativos (Comunidades Autónomas)", "porcentaje": 1.0 },
  { "nombre": "Vivienda Pública y Ayudas al Alquiler", "porcentaje": 0.9 },
  { "nombre": "Bomberos, Protección Civil y Emergencias", "porcentaje": 0.8 },
  { "nombre": "Ayudas directas al Transporte Público", "porcentaje": 0.8 },
  { "nombre": "Gastos Administrativos (Diputaciones y Ayuntamientos)", "porcentaje": 0.6 },
  { "nombre": "Televisión y Radios Públicas (RTVE y Autonómicas)", "porcentaje": 0.5 },
  { "nombre": "Puertos y Aeropuertos", "porcentaje": 0.3 },
  { "nombre": "Sueldos de Políticos, Concejales y Asesores", "porcentaje": 0.29 },
  { "nombre": "Otros (Fondos de Contingencia e Imprevistos)", "porcentaje": 0.2 },
  { "nombre": "Casa Real", "porcentaje": 0.01 }
]

function toEuro(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 2
	}).format(value);
}


function calcularCuotaTramo(base) {
    let cuota = 0;
    let anteriorLimite = 0;

    for (const tramo of TRAMOS) {
        if (base > tramo.limite) {
            // El sueldo supera el tramo actual, se calcula la cuota de este tramo completo
            cuota += (tramo.limite - anteriorLimite) * tramo.tipo;
            anteriorLimite = tramo.limite;
        } else {
            // El sueldo se queda en este tramo, se calcula la parte proporcional restante
            cuota += (base - anteriorLimite) * tramo.tipo;
            break;
        }
    }
    return cuota;
}

//// En España, las rentas bajas tienen una reducción extra antes de aplicar los tramos
function calcularReduccion(brutoAnual) {
    if (brutoAnual <= 14047.50) {
        return 6497.50;
    } else if (brutoAnual > 14047.50 && brutoAnual <= 19747.50) {
        return 6497.50 - 1.14 * (brutoAnual - 14047.50);
    } else {
        return 0;
    }
}

/**
 * Calcula el porcentaje de retención estimado de IRPF (Tarifa General Estatal)
 * @param {number} brutoAnual - Sueldo bruto anual en euros
 * @returns {{bruto: number, irpf: number, neto: number, porcentajeEfectivo: number}} - Devuelve un objeto con el total a pagar, neto y el % de retención efectivo
 */
function calcularRetencionIRPF(brutoAnual) {

    const reduccion = calcularReduccion(brutoAnual);
    const baseLiquidable = Math.max(0, brutoAnual - reduccion);
    const cuotaBase = calcularCuotaTramo(baseLiquidable);
    const cuotaMinimo = calcularCuotaTramo(MINIMO_PERSONAL);
    const irpfAnual = Math.max(0, cuotaBase - cuotaMinimo);
    const porcentajeRetencion = brutoAnual > 0 ? (irpfAnual / brutoAnual) * 100 : 0;

    return {
        bruto: brutoAnual,
        irpf: Math.round(irpfAnual * 100) / 100,
        neto: Math.round((brutoAnual - irpfAnual) * 100) / 100,
        porcentajeEfectivo: Math.round(porcentajeRetencion * 100) / 100
    };
}

function renderKpi(name, value) {
	if (!kpisEl) {
		return;
	}
    const div = document.createElement("div");
    div.classList.add("kpi");
    div.innerHTML = `
        <span>${name}</span>
        <strong>${value}</strong>
    `;
    kpisEl.appendChild(div);
}

function createBreakdownTable() {
    breakdownTableEl.innerHTML = `
        <thead>
            <tr>
                <th>Concepto</th>
                <th>Porcentaje</th>
                <th>Mensual</th>
                <th>Anual</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
}

function renderBreakdownRows(irpf) {
	if (!breakdownTableEl) {
		return;
	}

	breakdownTableEl.getElementsByTagName("tbody")[0].innerHTML = ARRAY_CATEGORIAS
		.map(
			(item) =>
				`<tr>
                    <td>${item.nombre}</td>
                    <td>${item.porcentaje.toFixed(2)} %</td>
                    <td>${toEuro((irpf * item.porcentaje) / 12 / 100)}</td>
                    <td>${toEuro((irpf * item.porcentaje) / 100)}</td>
                </tr>`
		)
		.join("");
}

if (form && resultPanel && kpisEl && resultSubtitleEl) {
	form.addEventListener("submit", (event) => {
		event.preventDefault();

		const formData = new FormData(form);
        const salaryRaw = Number(formData.get("salary"));
        const salaryMode = String(formData.get("salaryMode"));

		if (!Number.isFinite(salaryRaw) || salaryRaw <= 0) {
			return;
		}

        kpisEl.innerHTML = "";

        let annualInput = 0;
        if (salaryMode === "anual-bruto") {
            annualInput = salaryRaw;
        } else if (salaryMode === "mensual-12") {
            annualInput = salaryRaw * 12;
        } else if (salaryMode === "mensual-14") {
            annualInput = salaryRaw * 14;
        } else {
            annualInput = salaryRaw;
        }
        const retenciones = calcularRetencionIRPF(annualInput);

        renderKpi("Sueldo bruto anual", toEuro(retenciones.bruto));
        renderKpi("Sueldo neto anual", toEuro(retenciones.neto));
        renderKpi("IRPF anual", toEuro(retenciones.irpf));
        renderKpi("Porcentaje efectivo de retención", retenciones.porcentajeEfectivo + " %");

        createBreakdownTable();
		renderBreakdownRows(retenciones.irpf);

		resultPanel.classList.remove("hidden");
	});
}
