// renderer.js

document.getElementById("loadCsvButton").addEventListener("click", () => {
	const fileInput = document.getElementById("csvFileInput");
	if (fileInput.files.length === 0) {
		alert("Por favor, selecciona un archivo.");
		return;
	}

	const file = fileInput.files[0];
	if (!file.name.endsWith(".csv")) {
		alert("El archivo debe ser un CSV.");
		return;
	}

	window.electronAPI.loadCSV(file.path, (results) => {
		// Transformar resultados en un mapa de clientes y la suma de sus ofertas
		window.participants = results.reduce((acc, item) => {
			if (acc[item.clienteFactura]) {
				acc[item.clienteFactura].ofertas += parseInt(item.ofertas);
			} else {
				acc[item.clienteFactura] = {
					razonSocial: item.razonSocial,
					ofertas: parseInt(item.ofertas),
				};
			}
			return acc;
		}, {});

		console.log("Participants loaded:", window.participants);
	});
});

document.getElementById("drawWinnerButton").addEventListener("click", function () {
	if (!window.participants || Object.keys(window.participants).length === 0) {
		console.log("No participants loaded");
		return;
	}

	const winner = drawWinner(window.participants);
	actualizarCheque(winner.razonSocial);
	console.log(`El ganador es: ${winner.razonSocial}`);
});

function drawWinner(participants) {
	// Crear un array ponderado para el sorteo
	let weightedParticipants = [];
	Object.keys(participants).forEach((key) => {
		for (let i = 0; i < participants[key].ofertas; i++) {
			weightedParticipants.push(participants[key]);
		}
	});
	console.info(weightedParticipants);

	const winnerIndex = Math.floor(Math.random() * weightedParticipants.length);
	return weightedParticipants[winnerIndex];
}

function actualizarCheque(beneficiario) {
	const beneficiarySpan = document.getElementById("beneficiario").querySelector("span");
	// beneficiarySpan.textContent = beneficiario;
	revealWinner(beneficiario, beneficiarySpan, 6000);
}

document.getElementById("launchFireworksButton").addEventListener("click", function () {
	launchFireworks(20, 20000, 5); // Ajusta los parámetros según necesidad
});

function revealWinner(winner, spanElement, revealTime) {
	const totalDuration = revealTime; // Tiempo total para el efecto, que será de 8 segundos

	let chars = new Array(winner.length).fill("-"); // Comienza con guiones
	spanElement.textContent = chars.join(""); // Inicializar con guiones
	document.getElementById("drumroll").play(); // Suponiendo que hay un efecto de sonido de redoble de tambores al inicio

	// Animación para cada letra
	for (let i = 0; i < winner.length; i++) {
		animateLetter(i, winner[i], spanElement, totalDuration);
	}

	// Lanzar los fuegos artificiales después de que todas las letras se hayan asentado
	setTimeout(() => {
		launchFireworks(20, 5000, 5);
	}, totalDuration);
}

function animateLetter(index, correctChar, spanElement, totalDuration) {
	let startTime = Date.now();
	let endTime = startTime + totalDuration;
	let interval = setInterval(() => {
		let currentTime = Date.now();

		// Generar caracteres aleatorios hasta que se acabe el tiempo
		if (currentTime < endTime) {
			let text = spanElement.textContent.split("");
			text[index] = getRandomChar();
			spanElement.textContent = text.join("");
		} else {
			// Asignar el carácter correcto cuando el tiempo se acabe
			clearInterval(interval);
			let finalText = spanElement.textContent.split("");
			finalText[index] = correctChar;
			spanElement.textContent = finalText.join("");
		}
	}, 50); // Actualizar cada 50 ms
}

function getRandomChar() {
	// Generar un carácter aleatorio en el rango a-z
	return String.fromCharCode(Math.floor(Math.random() * (122 - 97 + 1)) + 97);
}

document.getElementById("toggleCsvFormButton").addEventListener("click", function () {
	var csvForm = document.getElementById("csvForm");
	if (csvForm.style.display === "none") {
		csvForm.style.display = "block";
		this.textContent = "Ocultar Opciones";
	} else {
		csvForm.style.display = "none";
		this.textContent = "Mostrar Opciones";
	}
});

document.getElementById("loadCsvButton").addEventListener("click", function () {
	var fileInput = document.getElementById("csvFileInput");
	if (fileInput.files.length === 0) {
		alert("Por favor, selecciona un archivo CSV.");
		return;
	}

	var file = fileInput.files[0];
	window.electronAPI.loadCSV(file.path, function (results) {
		alert("Archivo cargado correctamente.");
		console.log("Carga completada:", results);
	});
});

document.getElementById("loadImageButton").addEventListener("click", function () {
	console.log("Load Image Button Clicked");
	const fileInput = document.getElementById("backgroundImageInput");
	if (fileInput.files.length === 0) {
		alert("Por favor, selecciona una imagen.");
		return;
	}

	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.onload = function (e) {
		console.log("File loaded", e.target.result);
		const img = new Image();
		img.onload = function () {
			console.log("Image loaded, drawing on canvas");
			const canvas = document.getElementById("fireworksCanvas");
			const ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			// Llamar a updateBackgroundImage para establecer esta imagen como nuevo fondo.
			updateBackgroundImage(e.target.result);
		};
		img.onerror = function () {
			console.error("Error loading the image");
		};
		img.src = e.target.result;
	};

	reader.readAsDataURL(file);
});

// Función para actualizar la imagen de fondo.
function updateBackgroundImage(newImageSrc) {
	currentBackgroundImage.src = newImageSrc;
	currentBackgroundImage.onload = function () {
		// Opcional: Realizar acciones adicionales cuando la imagen se haya cargado.
	};
}
