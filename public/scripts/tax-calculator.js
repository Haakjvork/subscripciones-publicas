const form = document.querySelector("#tax-form");
const resultPanel = document.querySelector("#result-panel");
const taxMonthEl = document.querySelector("#tax-month");
const taxYearEl = document.querySelector("#tax-year");
const resultSubtitleEl = document.querySelector("#result-subtitle");
const breakdownListEl = document.querySelector("#breakdown-list");

const mockBreakdown = [
	{ name: "Gastos sociales", ratio: 0.32 },
	{ name: "Educacion", ratio: 0.14 },
	{ name: "Sanidad", ratio: 0.17 },
	{ name: "Gastos militares", ratio: 0.07 },
	{ name: "Orden publico", ratio: 0.08 },
	{ name: "Casa real", ratio: 0.01 },
	{ name: "Infraestructuras", ratio: 0.1 },
	{ name: "Intereses de deuda", ratio: 0.11 }
];

const estimatedTaxRate = 0.2535;

function toEuro(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 2
	}).format(value);
}

function toAnnual(amount, period) {
	if (period === "12") {
		return amount * 12;
	}

	if (period === "14") {
		return amount * 14;
	}

	return amount;
}

function buildBreakdown(totalTaxAnnual) {
	return mockBreakdown.map((item) => ({
		name: item.name,
		amount: totalTaxAnnual * item.ratio,
		percentage: item.ratio * 100
	}));
}

function renderBreakdown(items) {
	if (!breakdownListEl) {
		return;
	}

	breakdownListEl.innerHTML = items
		.map(
			(item) =>
				`<div class="breakdown-item"><span>${item.name} (${item.percentage.toFixed(0)}%)</span><span>${toEuro(item.amount)}</span></div>`
		)
		.join("");
}

if (form && resultPanel && taxMonthEl && taxYearEl && resultSubtitleEl) {
	form.addEventListener("submit", (event) => {
		event.preventDefault();

		const formData = new FormData(form);
		const salaryRaw = Number(formData.get("salary"));
		const salaryType = String(formData.get("salaryType"));
		const period = String(formData.get("period"));

		if (!Number.isFinite(salaryRaw) || salaryRaw <= 0) {
			return;
		}

		const annualInput = toAnnual(salaryRaw, period);
		const annualGross = salaryType === "bruto" ? annualInput : annualInput / (1 - estimatedTaxRate);
		const annualNet = salaryType === "neto" ? annualInput : annualInput * (1 - estimatedTaxRate);
		const annualTax = Math.max(annualGross - annualNet, 0);
		const monthlyTax = period === "14" ? annualTax / 14 : annualTax / 12;

		taxMonthEl.textContent = toEuro(monthlyTax);
		taxYearEl.textContent = toEuro(annualTax);

		const periodText = period === "anual" ? "anual" : `mensual en ${period} pagas`;
		resultSubtitleEl.textContent = `Base estimada ${salaryType} (${periodText}): ${toEuro(salaryRaw)}.`;

		renderBreakdown(buildBreakdown(annualTax));
		resultPanel.classList.remove("hidden");
	});
}
