# En qué se reparten los impuestos de la nómina

Lo que se paga en la nómina se destina a dos tipos de gasto:

- **IRPF:** es un impuesto general. Se suma a la recaudación pública y se reparte entre las distintas partidas de gasto.
- **Cotizaciones sociales:** son finalistas. Cada cotización se destina a la prestación que financia.

Consulta [qué impuestos y cotizaciones hay en una nómina](./impuestos-nomina.md) para ver los tipos de cada concepto.

## Reparto del IRPF

La calculadora aplica estos porcentajes al IRPF. Por ejemplo, en el salario medio, el IRPF estimado es de 535,54 € al mes, y la columna de cada partida muestra la parte de esa cantidad que le corresponde.

Los porcentajes son aproximaciones del reparto del gasto público. Los datos actuales suman un **94,80 %**: el 5,20 % restante no está asignado a ninguna partida, por lo que el total de la tabla no llega al IRPF mensual completo.

| Categoría | % | Partidas incluidas |
| --- | ---: | --- |
| Pensiones | 34,50 % | Jubilación (24,80 %); viudedad, invalidez y otras pensiones (9,70 %) |
| Sanidad | 15,10 % | Hospitales y urgencias (7,80 %); recetas y medicamentos (2,90 %); atención primaria (2,30 %); especialistas y consultas (2,10 %) |
| Educación | 10,30 % | Secundaria, Bachillerato y FP (4,10 %); Primaria e Infantil (3,60 %); universidades y becas (2,60 %) |
| Policía y Ejército | 7,20 % | Defensa y Ejército (2,90 %); Policía Nacional y Guardia Civil (2,20 %); policías locales y autonómicas (2,10 %) |
| Desempleo | 6,20 % | Subsidios por desempleo |
| Deuda pública | 5,80 % | Intereses de la deuda pública |
| Transporte e infraestructuras | 4,40 % | Tren y Cercanías (1,70 %); carreteras y autovías (1,60 %); ayudas al transporte público (0,80 %); puertos y aeropuertos (0,30 %) |
| Administración e instituciones | 3,00 % | Estado central (1,10 %); comunidades autónomas (1,00 %); diputaciones y ayuntamientos (0,60 %); sueldos de cargos políticos y asesores (0,29 %); Casa Real (0,01 %) |
| Servicios públicos y emergencias | 2,20 % | Limpieza viaria, basuras y alcantarillado (1,40 %); bomberos, protección civil y emergencias (0,80 %) |
| Industria, energía e investigación | 1,80 % | Ayudas a industria, energía e I+D+i |
| Cultura y medios públicos | 1,80 % | Cultura, deportes y patrimonio (1,30 %); radio y televisión públicas (0,50 %) |
| Justicia | 1,40 % | Justicia y prisiones |
| Vivienda | 0,90 % | Vivienda pública y ayudas al alquiler |
| Otros | 0,20 % | Fondos de contingencia e imprevistos |
| **Total asignado** | **94,80 %** | |
| Sin asignar | 5,20 % | Diferencia hasta el 100 % |

Estos datos están definidos en `ARRAY_CATEGORIAS`, en [tax-calculator.js](../public/scripts/tax-calculator.js).

## Destino de las cotizaciones sociales

Las cotizaciones no se reparten con la tabla anterior: cada una financia su propia prestación.

| Cotización | Trabajador | Empresa | Destino |
| --- | ---: | ---: | --- |
| Contingencias comunes | 4,70 % | 23,60 % | Seguridad Social: pensiones e incapacidad temporal por enfermedad común, entre otras prestaciones |
| MEI | 0,15 % | 0,75 % | Fondo de Reserva de la Seguridad Social |
| AT y EP | — | 1,50 % | Accidentes de trabajo y enfermedades profesionales |
| Desempleo | 1,55 % | 5,50 % | Prestaciones por desempleo |
| Formación profesional | 0,10 % | 0,60 % | Formación para el empleo |
| FOGASA | — | 0,20 % | Salarios e indemnizaciones impagados por empresas insolventes |
| **Total** | **6,50 %** | **32,15 %** | |

Las pensiones y el desempleo aparecen tanto en el reparto del IRPF como en las cotizaciones. Las cotizaciones financian la mayor parte de estas prestaciones, pero el Estado también aporta fondos procedentes de los impuestos generales.

## Limitaciones

La calculadora todavía no incluye las cotizaciones sociales: solo reparte el IRPF entre las partidas de gasto. Por eso no muestra todo lo que se paga en la nómina ni el coste total para la empresa.
