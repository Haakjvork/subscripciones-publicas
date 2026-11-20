const SMI_ANUAL = 15876;
const SALARIO_MEDIO_ANUAL = 29000;

const ARRAY_CATEGORIAS = [
	"Educación",
	"Sanidad",
	"Seguridad Social",
	"Defensa",
	"Orden Público",
	"Asuntos Económicos",
	"Protección Ambiental",
	"Vivienda y Servicios Comunitarios",
	"Ocio, Cultura y Religión",
	"Protección Social",
	"Deuda Pública",
	"Administración General",
	"Justicia",
	"Pensiones",
	"Paro",
	"Invalidez",
	"Familia e Infancia",
	"Desempleo",
	"Vivienda",
	"Exclusión Social",
	"Cultura",
	"Deporte",
	"Ciencia y Tecnología",
	"Transportes",
	"Comunicaciones",
	"Energía",
	"Agricultura",
	"Industria",
	"Comercio y Turismo",
	"Otros",
	"Otros Servicios"
];

let customCards = [];
let cardIdCounter = 1;

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

function getSelectedSalaries() {
	const salaries = [];

	const smiCheck = document.getElementById("smi-check");
	if (smiCheck && smiCheck.checked) {
		salaries.push({ id: "smi", salary: SMI_ANUAL, label: "SMI", checked: true });
	}

	const mediaCheck = document.getElementById("media-check");
	if (mediaCheck && mediaCheck.checked) {
		salaries.push({ id: "media", salary: SALARIO_MEDIO_ANUAL, label: "Salario Medio", checked: true });
	}

	for (const card of customCards) {
		if (card.checked) {
			const mode = document.getElementById(`mode-${card.id}`).value;
			const salary = getAnnualSalary(card.salary, mode);
			salaries.push({ id: card.id, salary: salary, label: card.label, checked: true, mode: mode });
		}
	}

	return salaries;
}

function renderResultCard(id, salary, label) {
	const irpfAnual = calcularRetencionIRPF(salary);
	const retencion = salary > 0 ? (irpfAnual / salary) * 100 : 0;
	const netoAnual = salary - irpfAnual;
	const netoMensual = netoAnual / 12;
	const irpfMensual = irpfAnual / 12;

	return `
		<div class="result-card" id="card-${id}">
			<div class="result-card-header">
				<strong>${label}</strong>
			</div>
			<div class="result-card-metrics">
				<div class="metric">
					<span class="metric-label">% Retención</span>
					<span class="metric-value">${retencion.toFixed(2)}%</span>
				</div>
				<div class="metric">
					<span class="metric-label">Bruto Anual</span>
					<span class="metric-value">€${salary.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
				<div class="metric">
					<span class="metric-label">IRPF Anual</span>
					<span class="metric-value">€${irpfAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
				<div class="metric">
					<span class="metric-label">Neto Mensual</span>
					<span class="metric-value">€${netoMensual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
				<div class="metric">
					<span class="metric-label">IRPF Mensual</span>
					<span class="metric-value">€${irpfMensual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
				</div>
			</div>
		</div>
	`;
}

function createBreakdownTable(salaries) {
	if (salaries.length === 0) return "";

	let html = "<thead><tr><th>Concepto</th>";
	for (const sal of salaries) {
		html += `<th>${sal.label}</th>`;
	}
	html += "</tr></thead><tbody>";

	for (let i = 0; i < ARRAY_CATEGORIAS.length; i++) {
		const categoria = ARRAY_CATEGORIAS[i];
		html += `<tr><td>${categoria}</td>`;

		for (const sal of salaries) {
			const porcentajeCategoria = (100 / ARRAY_CATEGORIAS.length);
			const importe = (sal.salary * (calcularRetencionIRPF(sal.salary) / sal.salary)) * (porcentajeCategoria / 100);
			html += `<td>€${importe.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</td>`;
		}

		html += "</tr>";
	}

	html += "</tbody>";
	return html;
}

function renderResults() {
	const salaries = getSelectedSalaries();
	const resultsGrid = document.getElementById("results-grid");
	const breakdownTable = document.getElementById("breakdown-table");
	const resultPanel = document.getElementById("result-panel");

	if (salaries.length === 0) {
		resultsGrid.innerHTML = "";
		breakdownTable.innerHTML = "";
		resultPanel.classList.add("hidden");
		return;
	}

	resultsGrid.innerHTML = salaries.map(s => renderResultCard(s.id, s.salary, s.label)).join("");
	breakdownTable.innerHTML = createBreakdownTable(salaries);
	resultPanel.classList.remove("hidden");
}

function addCustomCard() {
	const id = `custom-${cardIdCounter}`;
	cardIdCounter++;

	const card = {
		id: id,
		salary: 0,
		label: `Salario ${cardIdCounter - 1}`,
		checked: false,
		mode: "anual-bruto"
	};

	customCards.push(card);

	const cardsContainer = document.getElementById("custom-cards-container");
	cardsContainer.insertAdjacentHTML("beforeend", `
		<div class="card card-custom" id="card-${id}">
			<div class="card-header">
				<div>
					<input 
						type="checkbox" 
						id="check-${id}" 
						class="custom-card-check"
						data-id="${id}"
					>
					<input 
						type="text" 
						class="custom-card-label" 
						value="Salario ${cardIdCounter - 1}" 
						data-id="${id}"
						placeholder="Etiqueta"
					>
				</div>
				<button type="button" class="btn-remove" data-id="${id}" aria-label="Eliminar tarjeta">×</button>
			</div>
			<div class="card-content">
				<div class="card-custom-input">
					<label>Salario</label>
					<input 
						type="number" 
						class="custom-card-salary" 
						data-id="${id}" 
						placeholder="0"
						step="100"
						min="0"
					>
				</div>
				<div class="card-custom-selector">
					<label>Período</label>
					<select id="mode-${id}" class="custom-card-mode" data-id="${id}">
						<option value="anual-bruto">Bruto Anual</option>
						<option value="mensual-12">Mensual (12 pagas)</option>
						<option value="mensual-14">Mensual (14 pagas)</option>
					</select>
				</div>
			</div>
		</div>
	`);

	attachCustomCardListeners(id);
}

function attachCustomCardListeners(id) {
	const checkEl = document.getElementById(`check-${id}`);
	const labelEl = document.querySelector(`.custom-card-label[data-id="${id}"]`);
	const salaryEl = document.querySelector(`.custom-card-salary[data-id="${id}"]`);
	const modeEl = document.querySelector(`.custom-card-mode[data-id="${id}"]`);
	const removeBtn = document.querySelector(`.btn-remove[data-id="${id}"]`);

	const cardObj = customCards.find(c => c.id === id);

	if (checkEl) {
		checkEl.addEventListener("change", (e) => {
			cardObj.checked = e.target.checked;
			renderResults();
		});
	}

	if (labelEl) {
		labelEl.addEventListener("input", (e) => {
			cardObj.label = e.target.value;
			renderResults();
		});
	}

	if (salaryEl) {
		salaryEl.addEventListener("input", (e) => {
			cardObj.salary = parseFloat(e.target.value) || 0;
			renderResults();
		});
	}

	if (modeEl) {
		modeEl.addEventListener("change", (e) => {
			cardObj.mode = e.target.value;
			renderResults();
		});
	}

	if (removeBtn) {
		removeBtn.addEventListener("click", (e) => {
			e.preventDefault();
			customCards = customCards.filter(c => c.id !== id);
			document.getElementById(`card-${id}`).remove();
			renderResults();
		});
	}
}

function attachPredefineCardListeners() {
	const smiCheck = document.getElementById("smi-check");
	const mediaCheck = document.getElementById("media-check");

	if (smiCheck) {
		smiCheck.addEventListener("change", () => renderResults());
	}

	if (mediaCheck) {
		mediaCheck.addEventListener("change", () => renderResults());
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
	renderResults();
});
