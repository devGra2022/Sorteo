const { contextBridge } = require("electron");
const fs = require("fs");
const csv = require("csv-parser");

contextBridge.exposeInMainWorld("electronAPI", {
	loadCSV: (path, callback) => {
		const results = [];
		fs.createReadStream(path)
			.pipe(
				csv({
					separator: ";", // Especifica ';' como el delimitador
					mapHeaders: ({ header }) => header.trim(),
				})
			)
			.on("data", (data) => {
				console.log(data); // Esto mostrará los datos crudos en la consola
				results.push({
					clienteFactura: data["Cliente factura"],
					razonSocial: data["Razón social cliente despacho"],
					ofertas: data["Ofertas"],
				});
			})
			.on("end", () => callback(results));
	},
});
