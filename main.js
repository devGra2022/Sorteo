const { app, BrowserWindow, globalShortcut, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

/**
 * Crea la ventana principal de la aplicación en modo pantalla completa.
 */
function createWindow() {
	// Configuración inicial de la ventana del navegador.
	let win = new BrowserWindow({
		width: 1920, // Ancho predeterminado.
		height: 1080, // Alto predeterminado.
		fullscreen: true, // Abre la ventana en modo pantalla completa.
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true, // Protege contra vulnerabilidades manteniendo separados los contextos.
			sandbox: false, // Habilitar sandbox para procesos de renderizado.
			preload: path.join(__dirname, "preload.js"), // Preload script para cargar antes de cualquier otro script.
		},
	});

	// Carga el archivo HTML principal que será la interfaz de la aplicación.
	win.loadFile(path.join(__dirname, "index.html"));
}

// Evento que se dispara cuando todas las ventanas han sido cerradas.
app.on("window-all-closed", () => {
	// En macOS es común que las aplicaciones y su barra de menú permanezcan activas hasta que el usuario salga explícitamente.
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Este evento se dispara cuando la aplicación está lista para crear ventanas.
// También se activa cuando la aplicación se reactiva.
app.whenReady().then(() => {
	createWindow();

	// Registrando un atajo global para alternar el modo pantalla completa.
	globalShortcut.register("F11", () => {
		let win = BrowserWindow.getFocusedWindow();
		if (win) {
			win.setFullScreen(!win.isFullScreen());
		}
	});

	// Verifica actualizaciones automáticamente y notifica al usuario cuando están disponibles.
	autoUpdater.checkForUpdatesAndNotify();

	app.on("activate", () => {
		// En macOS, es común recrear una ventana en la app cuando se hace clic en el icono del dock y no hay otras ventanas abiertas.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Eventos del autoUpdater
autoUpdater.on("update-available", () => {
	console.log("Una nueva actualización está disponible. Descargando...");
});

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
	// Opciones de diálogo para mostrar al usuario que una actualización está lista para instalarse.
	const dialogOpts = {
		type: "info",
		buttons: ["Reiniciar", "Más tarde"],
		title: "Actualización de Aplicación",
		message: process.platform === "win32" ? releaseNotes : releaseName,
		detail:
			"Una nueva versión ha sido descargada. Reinicia la aplicación para aplicar las actualizaciones.",
	};

	// Muestra el mensaje de diálogo al usuario.
	dialog.showMessageBox(dialogOpts).then(({ response }) => {
		if (response === 0) autoUpdater.quitAndInstall();
	});
});
