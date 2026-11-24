import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

function loadCalculator() {
	const script = readFileSync(new URL("../public/scripts/tax-calculator.js", import.meta.url), "utf8");
	return runInNewContext(`${script}
		({ ARRAY_CATEGORIAS, calcularRetencionIRPF, createBreakdownTable, expandedCategories, formatEuro, updateMetricsDisplay })`,
		{ document: globalThis.testDocument ?? { addEventListener() {} } }
	);
}

test("preset cards update monthly IRPF by metric name", () => {
	const values = Object.fromEntries(["retention", "bruto", "irpf", "neto", "irpf-mensual"].map(metric => [metric, { textContent: "-" }]));
	globalThis.testDocument = {
		addEventListener() {},
		getElementById: () => ({ querySelector: selector => values[selector.match(/"(.+)"/)[1]] })
	};
	const calculator = loadCalculator();
	delete globalThis.testDocument;

	calculator.updateMetricsDisplay(29000, "media-card");

	assert.equal(values["irpf-mensual"].textContent, calculator.formatEuro(calculator.calcularRetencionIRPF(29000) / 12));
	assert.equal(values.neto.textContent, calculator.formatEuro((29000 - calculator.calcularRetencionIRPF(29000)) / 12));
});

test("table headers use monthly net income for each salary", () => {
	const calculator = loadCalculator();
	const salaries = [{ salary: 15876 }, { salary: 29000 }, { salary: 0 }];
	const html = calculator.createBreakdownTable(salaries);

	for (const { salary } of salaries) {
		const net = (salary - calculator.calcularRetencionIRPF(salary)) / 12;
		assert.ok(html.includes(`<th>Neto mensual: ${net.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €</th>`));
	}
});

test("total reflects only assigned percentages and unrounded amounts", () => {
	const calculator = loadCalculator();
	const salaries = [{ salary: 15876 }, { salary: 29000 }, { salary: 0 }];
	const percentage = calculator.ARRAY_CATEGORIAS.flatMap(category => category.partidas)
		.reduce((sum, item) => sum + item.porcentaje, 0);
	assert.equal(percentage.toFixed(2), "94.80");

	calculator.expandedCategories.add(0);
	const html = calculator.createBreakdownTable(salaries);
	const expectedAmounts = salaries.map(({ salary }) => {
		const amount = calculator.calcularRetencionIRPF(salary) / 12 * percentage / 100;
		return `<td>${amount.toLocaleString("es-ES", { maximumFractionDigits: 2 })} €</td>`;
	}).join("");
	assert.ok(html.includes(`<tfoot><tr><td>Total</td><td>94.80%</td>${expectedAmounts}</tr></tfoot>`));
});

test("euro formatting follows the amount", () => {
	const calculator = loadCalculator();
	assert.equal(calculator.formatEuro(1234.5, 2), "1234,5 €");
	assert.equal(calculator.formatEuro(0), "0 €");
});
