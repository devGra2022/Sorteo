const config = {
	fireworks: {
		numRockets: 10, // Número de cohetes: Especifica cuántos cohetes se lanzan cada vez que se activa la función.
		duration: 20000, // Duración: Tiempo total en milisegundos durante el cual los cohetes se lanzarán repetidamente.
		velocity: 3, // Velocidad: Velocidad inicial de los cohetes al ser lanzados.
		brightness: { min: 50, max: 110 }, // Brillo: Rango del brillo mínimo y máximo para los fuegos artificiales.
		particlesPerExplosion: { min: 50, max: 70 }, // Partículas por explosión: Número aleatorio de partículas generadas por cada explosión.
		particleAlphaFadeOut: 0.02, // Desvanecimiento de Alfa de partículas: Tasa de desvanecimiento de la transparencia de las partículas.
		particleFriction: 0.95, // Fricción de partículas: Coeficiente de fricción que reduce la velocidad de las partículas con el tiempo.
		particleGravity: 0.01, // Gravedad de partículas: Fuerza de gravedad aplicada a cada partícula para simular la caída.
		rocketTrailLength: 4, // Longitud del rastro del cohete: Tamaño del rastro dejado por cada cohete.
		particleSize: 2, // Tamaño de partículas: Tamaño de cada partícula que explota desde el cohete.
		maxParticles: 300, // Máximo de partículas activas permitidas
	},
	canvas: {
		width: window.innerWidth, // Ancho del lienzo: Ancho del canvas, se ajusta al ancho de la ventana.
		height: window.innerHeight, // Alto del lienzo: Alto del canvas, se ajusta al alto de la ventana.
	},
};

// Variable global para almacenar la imagen de fondo.
let currentBackgroundImage = new Image();
currentBackgroundImage.src = "2.jpg"; // Establece una imagen de fondo por defecto si es necesario.

document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById("fireworksCanvas");
	const ctx = canvas.getContext("2d");
	canvas.width = config.canvas.width;
	canvas.height = config.canvas.height;

	let fireworks = [];
	let particles = [];
	let particlePool = []; // Pool de partículas para reutilización
	const backgroundImageUrl = canvas.getAttribute("data-image-url");
	const backgroundImage = new Image();
	backgroundImage.onload = () => initializeCanvas(backgroundImage);
	backgroundImage.src = backgroundImageUrl;

	function initializeCanvas(backgroundImage) {
		ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
		animate();
	}

	function randomColor() {
		return `hsl(${Math.random() * 360}, 100%, 50%)`;
	}

	class Firework {
		constructor(x, y, targetY, color, velocity) {
			this.x = x;
			this.y = y;
			this.targetY = targetY;
			this.color = color;
			this.velocity = {
				x: 0, // No necesita desplazamiento horizontal inicial
				y: -Math.abs(Math.random() * 2 + velocity), // Asegurarse de que siempre se mueva hacia arriba
			};
			this.brightness =
				Math.random() * (config.fireworks.brightness.max - config.fireworks.brightness.min) +
				config.fireworks.brightness.min;
		}

		update() {
			this.y += this.velocity.y;
			if (this.y <= this.targetY) {
				this.explode();
			}
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, config.fireworks.rocketTrailLength, 0, Math.PI * 2, false);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		}

		explode() {
			const count = Math.floor(
				Math.random() *
					(config.fireworks.particlesPerExplosion.max -
						config.fireworks.particlesPerExplosion.min) +
					config.fireworks.particlesPerExplosion.min
			);
			for (let i = 0; i < count; i++) {
				particles.push(new Particle(this.x, this.y, this.color));
			}
		}
	}

	class Particle {
		constructor(x, y, color) {
			this.x = x;
			this.y = y;
			this.color = color;
			// Utilizar coordenadas polares para la inicialización de la velocidad y luego convertirlas a cartesianas
			const angle = Math.random() * Math.PI * 2; // Ángulo aleatorio completo en radianes
			const speed = Math.random() * 5 + 2; // Velocidad aleatoria
			this.velocity = {
				x: Math.cos(angle) * speed,
				y: Math.sin(angle) * speed,
			};
			this.alpha = 1;
		}

		update() {
			this.velocity.x *= config.fireworks.particleFriction;
			this.velocity.y *= config.fireworks.particleFriction + config.fireworks.particleGravity;
			this.x += this.velocity.x;
			this.y += this.velocity.y;
			this.alpha -= config.fireworks.particleAlphaFadeOut;
			if (this.alpha < 0) this.alpha = 0; // Asegurar que la alfa no sea negativa
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, config.fireworks.particleSize, 0, Math.PI * 2, false);
			ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
			ctx.fill();
			ctx.closePath();
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(currentBackgroundImage, 0, 0, canvas.width, canvas.height); // Dibuja la imagen de fondo actual.

		fireworks.forEach((firework, index) => {
			firework.update();
			firework.draw();
			if (firework.y <= firework.targetY || firework.brightness <= 0) {
				fireworks.splice(index, 1);
			}
		});

		particles.forEach((particle, index) => {
			particle.update();
			particle.draw();
			if (particle.alpha <= 0) {
				recycleParticle(particle);
				particles.splice(index, 1);
			}
		});
	}
	function recycleParticle(particle) {
		if (particlePool.length < config.fireworks.maxParticles) {
			particlePool.push(particle);
		}
	}

	function createParticle(x, y, color) {
		let particle;
		if (particlePool.length) {
			particle = particlePool.pop();
			particle.reset(x, y, color);
		} else {
			particle = new Particle(x, y, color);
		}
		return particle;
	}
	window.launchFireworks = function () {
		const { numRockets, duration, velocity } = config.fireworks;

		// Crear el elemento de audio y cargar el archivo MP3
		const audio = new Audio("crowd-cheer-ii-6263.mp3");
		audio.loop = true; // Opcional: Hacer que el audio se repita
		audio.play(); // Iniciar la reproducción del audio

		// Iniciar el lanzamiento de fuegos artificiales
		const interval = setInterval(() => {
			for (let i = 0; i < numRockets; i++) {
				const x = Math.random() * canvas.width;
				const y = canvas.height;
				const targetY = (Math.random() * canvas.height) / 2;
				fireworks.push(new Firework(x, y, targetY, randomColor(), velocity));
			}
		}, 400);

		// Detener los fuegos artificiales y el audio después de la duración especificada
		setTimeout(() => {
			clearInterval(interval);
			audio.pause(); // Detener el audio
			audio.currentTime = 0; // Reiniciar el tiempo de audio para la próxima vez
		}, duration);
	};
});
