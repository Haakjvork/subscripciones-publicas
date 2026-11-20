const SMI_ANUAL = 15876;
const SALARIO_MEDIO_ANUAL = 29000;

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
];

let customCards = [];
let cardIdCounter = 1;
let activeInputId = null;

function getAnnualSalary(value, mode) {
	const num = parseFloat(value);
	if (isNaN(num)) return 0;
	if (mode === "anual-bruto") return num;
	if (mode === "mensual-12") return num * 12;
	if (mode === "mensual-14") return num * 14;
	return 0;
}

function calcularCuotaTramo(salario) {
	const tramos = [
		{ limite: 6000, tasa: 0.19 },
		{ limite: 10000, tasa: 0.24 },
		{ limite: 15000, tasa: 0.3 },
		{ limite: 24000, tasa: 0.37 },
		{ limite: 43000, tasa: 0.45 },
		{ limite: Infinity, tasa: 0.47 }
	];

	let cuota = 0;
	let basePrev = 0;

	for (const tramo of tramos) {
		const limite = tramo.limite;
		if (salario <= basePrev) break;
		const baseTramo = Math.min(salario, limite) - basePrev;
		cuota += baseTramo * tramo.tasa;
		basePrev = limite;
	}

	return cuota;
}

function calcularReduccion(salario) {
	if (salario < 15000) return 500;
	if (salario < 20000) return 400;
	if (salario < 25000) return 300;
	return 0;
}

function calcularRetencionIRPF(salarioAnual) {
	if (salarioAnual === 0) return 0;

	const minimo = 5550;
	const baseImponible = Math.max(0, salarioAnual - minimo);
	const cuota = calcularCuotaTramo(baseImponible);
	const reduccion = calcularReduccion(baseImponible);
	const irpfAnual = Math.max(0, cuota - reduccion);

	return irpfAnual;
}

function getFormatLabel(value, mode) {
	const num = parseFloat(value);
	if (isNaN(num) || num === 0) return "€0";
	
	if (mode === "anual-bruto") {
		return `€${num.toLocaleString('es-ES', { maximumFractionDigits: 0 })} Bruto Anual`;
	} else if (mode === "mensual-12") {
		return `€${num.toLocaleString('es-ES', { maximumFractionDigits: 0 })} Mensual (12)`;
	} else if (mode === "mensual-14") {
		return `€${num.toLocaleString('es-ES', { maximumFractionDigits: 0 })} Mensual (14)`;
	}
	return `€${num.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
}

function updateMetricsDisplay(salaryValue, elementId) {
	const element = document.getElementById(elementId);
	if (!element) return;

	const irpfAnual = calcularRetencionIRPF(salaryValue);
	const retencion = salaryValue > 0 ? (irpfAnual / salaryValue) * 100 : 0;
	const netoMensual = (salaryValue - irpfAnual) / 12;

	const metricsElements = element.querySelectorAll('.card-metric-value');
	metricsElements[0].textContent = `${retencion.toFixed(2)}%`;
	metricsElements[1].textContent = `€${salaryValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
	metricsElements[2].textContent = `€${irpfAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
	metricsElements[3].textContent = `€${netoMensual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
}

function getSelectedSalaries() {
	const salaries = [];

	const smiCheck = document.getElementById("smi-check");
	if (smiCheck && smiCheck.checked) {
		salaries.push({ id: "smi", salary: SMI_ANUAL, label: "€15.876 Bruto Anual", checked: true });
	}

	const mediaCheck = document.getElementById("media-check");
	if (mediaCheck && mediaCheck.checked) {
		salaries.push({ id: "media", salary: SALARIO_MEDIO_ANUAL, label: "€29.000 Bruto Anual", checked: true });
	}

	for (const card of customCards) {
		if (card.checked) {
			const salary = getAnnualSalary(card.salary, card.mode);
			const label = getFormatLabel(card.salary, card.mode);
			salaries.push({ id: card.id, salary: salary, label: label, checked: true });
		}
	}

	return salaries;
}

function renderCustomCard(id, salary, mode) {
	const annualSalary = getAnnualSalary(salary, mode);
	const irpfAnual = calcularRetencionIRPF(annualSalary);
	const retencion = annualSalary > 0 ? (irpfAnual / annualSalary) * 100 : 0;
	const netoMensual = (annualSalary - irpfAnual) / 12;

	const html = `
		<div class="card card-custom card-preset-full" id="card-${id}">
			<div class="card-header-preset">
				<div class="card-header-left">
					<input 
						type="checkbox" 
						class="custom-card-check"
						data-id="${id}"
						checked
					>
					<div class="card-content">
						<span class="card-label">${getFormatLabel(salary, mode)}</span>
						<span class="card-value"></span>
					</div>
				</div>
				<button type="button" class="btn-remove" data-id="${id}" aria-label="Eliminar tarjeta">×</button>
			</div>

			<div class="card-inputs">
				<div class="card-input-group">
					<label>Salario</label>
					<input 
						type="number" 
						class="custom-card-salary" 
						data-id="${id}" 
						value="${salary}"
						step="100"
						min="0"
					>
				</div>
				<div class="card-input-group">
					<label>Período</label>
					<select class="custom-card-mode" data-id="${id}">
						<option value="anual-bruto" ${mode === 'anual-bruto' ? 'selected' : ''}>Bruto Anual</option>
						<option value="mensual-12" ${mode === 'mensual-12' ? 'selected' : ''}>Mensual (12)</option>
						<option value="mensual-14" ${mode === 'mensual-14' ? 'selected' : ''}>Mensual (14)</option>
					</select>
				</div>
			</div>

			<div class="card-metrics-preset">
				<div class="card-metric">
					<span class="card-metric-label">% Retención</span>
					<span class="card-metric-value">${retencion.toFixed(2)}%</span>
				</div>
				<div class="card-metric">
					<span class="card-metric-label">Bruto Anual</span>
					<span class="card-metric-value">€${annualSalary.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
				<div class="card-metric">
					<span class="card-metric-label">IRPF Anual</span>
					<span class="card-metric-value">€${irpfAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
				<div class="card-metric">
					<span class="card-metric-label">Neto Mensual</span>
					<span class="card-metric-value">€${netoMensual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
			</div>
		</div>
	`;

	return html;
}

function createBreakdownTable(salaries) {
	if (salaries.length === 0) return "";

	let html = "<thead><tr><th>Concepto</th><th>%</th>";
	for (const sal of salaries) {
		html += `<th>${sal.label}</th>`;
	}
	html += "</tr></thead><tbody>";

	for (let i = 0; i < ARRAY_CATEGORIAS.length; i++) {
		const categoria = ARRAY_CATEGORIAS[i];
		html += `<tr><td>${categoria.nombre}</td><td>${categoria.porcentaje.toFixed(2)}%</td>`;

		for (const sal of salaries) {
			const irpfAnual = calcularRetencionIRPF(sal.salary);
			const importeAnual = (irpfAnual * categoria.porcentaje) / 100;
			const importeMensual = importeAnual / 12;
			html += `<td>€${importeMensual.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</td>`;
		}

		html += "</tr>";
	}

	html += "</tbody>";
	return html;
}

function updateDisplay() {
	updateMetricsDisplay(SMI_ANUAL, 'smi-card');
	updateMetricsDisplay(SALARIO_MEDIO_ANUAL, 'media-card');

	const customContainer = document.getElementById("custom-cards-container");
	if (customContainer) {
		customContainer.innerHTML = customCards.map(card => renderCustomCard(card.id, card.salary, card.mode)).join("");
		attachCustomCardListeners();
	}

	const salaries = getSelectedSalaries();
	const breakdownTable = document.getElementById("breakdown-table");
	const resultPanel = document.getElementById("result-panel");

	if (salaries.length === 0) {
		breakdownTable.innerHTML = "";
		resultPanel.classList.add("hidden");
		return;
	}

	breakdownTable.innerHTML = createBreakdownTable(salaries);
	resultPanel.classList.remove("hidden");
}

function addCustomCard() {
	const id = `custom-${cardIdCounter}`;
	cardIdCounter++;

	const card = {
		id: id,
		salary: 0,
		mode: "anual-bruto",
		checked: true
	};

	customCards.push(card);
	updateDisplay();

	// Focus on the newly created input
	setTimeout(() => {
		const input = document.querySelector(`.custom-card-salary[data-id="${id}"]`);
		if (input) {
			input.focus();
			activeInputId = id;
		}
	}, 0);
}

function attachCustomCardListeners() {
	const checkboxes = document.querySelectorAll('.custom-card-check');
	const salaryInputs = document.querySelectorAll('.custom-card-salary');
	const modeSelects = document.querySelectorAll('.custom-card-mode');
	const removeButtons = document.querySelectorAll('.btn-remove');

	checkboxes.forEach(checkbox => {
		checkbox.addEventListener("change", (e) => {
			const id = e.target.dataset.id;
			const card = customCards.find(c => c.id === id);
			if (card) {
				card.checked = e.target.checked;
				updateDisplay();
			}
		});
	});

	salaryInputs.forEach(input => {
		input.addEventListener("input", (e) => {
			const id = e.target.dataset.id;
			const card = customCards.find(c => c.id === id);
			if (card) {
				card.salary = parseFloat(e.target.value) || 0;
				updateDisplay();
				// Restore focus after update
				if (activeInputId === id) {
					setTimeout(() => {
						const currentInput = document.querySelector(`.custom-card-salary[data-id="${id}"]`);
						if (currentInput && currentInput !== document.activeElement) {
							currentInput.focus();
						}
					}, 0);
				}
			}
		});

		input.addEventListener("focus", (e) => {
			activeInputId = e.target.dataset.id;
		});

		input.addEventListener("blur", () => {
			activeInputId = null;
		});
	});

	modeSelects.forEach(select => {
		select.addEventListener("change", (e) => {
			const id = e.target.dataset.id;
			const card = customCards.find(c => c.id === id);
			if (card) {
				card.mode = e.target.value;
				updateDisplay();
				// Restore focus on the salary input after update
				if (activeInputId === id) {
					setTimeout(() => {
						const currentInput = document.querySelector(`.custom-card-salary[data-id="${id}"]`);
						if (currentInput) {
							currentInput.focus();
						}
					}, 0);
				}
			}
		});
	});

	removeButtons.forEach(btn => {
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			const id = e.target.dataset.id;
			customCards = customCards.filter(c => c.id !== id);
			updateDisplay();
		});
	});
}

function attachPredefineCardListeners() {
	const smiCheck = document.getElementById("smi-check");
	const mediaCheck = document.getElementById("media-check");

	if (smiCheck) {
		smiCheck.addEventListener("change", () => updateDisplay());
	}

	if (mediaCheck) {
		mediaCheck.addEventListener("change", () => updateDisplay());
	}
}

function attachAddCardListener() {
	const addBtn = document.getElementById("add-card-btn");
	if (addBtn) {
		addBtn.addEventListener("click", (e) => {
			e.preventDefault();
			addCustomCard();
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	attachPredefineCardListeners();
	attachAddCardListener();
	updateDisplay();
});
