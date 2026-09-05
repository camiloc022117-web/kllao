# K'lliao — Sistema de Gestión de Ventas

Sistema de punto de venta e inventario desarrollado para K'lliao,
un emprendimiento local de granizados y cocteles en Medellín, Colombia.
Reemplaza el registro manual en libretas con una solución digital simple y completa.

## Estado del proyecto
**Versión:** 1.0.0 — Primera versión funcional  
**Estado:** En prueba piloto con el cliente  

Funcionalidades planeadas para versiones futuras:
- Gráficas de tendencias en reportes
- Historial de entradas de inventario
- Edición de precios desde la interfaz
- Despliegue en producción

## Requisitos del entorno
- Node.js v18 o superior
- Python 3.10 o superior
- Git
- Navegador moderno (Chrome, Edge, Firefox)
- Sistema operativo: Windows 10/11

## Tech Stack
- **Backend:** Node.js + Express + Better-SQLite3
- **Frontend:** React + Vite + React Router DOM
- **Database:** SQLite (archivo local)
- **Reports:** Python + Flask + openpyxl

## Inicio rápido (Windows)
Doble clic en `start.bat`

El sistema abre automáticamente en `http://localhost:5173`

## Primera instalación
1. Instalar [Node.js](https://nodejs.org), [Python](https://python.org) y [Git](https://git-scm.com)
2. `git clone https://github.com/alejogz07/klliao-pos.git`
3. `cd backend && npm install`
4. `node index.js` → Ctrl+C
5. `node database/seed.js`
6. `cd ../frontend && npm install`
7. `cd ../reports && pip install flask flask-cors openpyxl requests`
8. Doble clic en `start.bat`

## Vistas
| Ruta | Descripción |
|------|-------------|
| `/` | Registro de ventas (POS) |
| `/inventory` | Entrada de inventario |
| `/products` | Catálogo y stock |
| `/reports` | Reportes y exportación Excel |

## Decisiones de diseño
- Sin tabla de proveedores — los dueños compran directamente en tiendas cercanas
- Stock del granizado no se trackea — se produce bajo demanda
- Precio depende del tamaño y licor, no del sabor
- Interfaz en español, código en inglés

## Bugs conocidos
- El servidor Flask de reportes debe estar corriendo para que el botón "Descargar Excel" funcione
- Si se cierra una terminal accidentalmente, hay que reiniciar `start.bat`

## FAQ

**¿Qué pasa si cierro una terminal por error?**  
Cierra todas las terminales y vuelve a hacer doble clic en `start.bat`.

**¿Los datos se pierden si se reinicia el computador?**  
No. Los datos viven en `backend/database/kalliao.db`, un archivo persistente en disco.

**¿Cómo resetear la base de datos?**  
Elimina `backend/database/kalliao.db`, ejecuta `node index.js` y luego `node database/seed.js`.

**¿El sistema funciona sin internet?**  
Sí. Todo corre localmente, no requiere conexión a internet.

## Licencia
Proyecto privado desarrollado para K'lliao. Todos los derechos reservados.  
No se permite la distribución o modificación sin autorización del autor.