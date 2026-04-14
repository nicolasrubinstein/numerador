# Numerador de Código Python

Herramienta web que agrega numeración de líneas a código Python con formato de ceros a la izquierda, lista para entregar en trabajos académicos.

Desarrollada para la cátedra de **71.20 Informática General — ITBA**.

## ¿Qué hace?

Toma código Python sin numerar y genera una versión con cada línea precedida por su número, ajustando automáticamente el ancho según el total de líneas del archivo.

**Ejemplos:**
- 9 líneas → `1  ...`, `2  ...`, ..., `9  ...`
- 200 líneas → `001  ...`, `002  ...`, ..., `200  ...`

## Características

- Interfaz de dos paneles: entrada (código original) y salida (código numerado)
- Descarga directa del resultado como archivo `.py`
- Botón de copiado al portapapeles
- Vista expandida en pantalla completa
- Todo el procesamiento ocurre en el navegador, sin envío de datos a ningún servidor

## Uso

1. Abrir `index.html` en el navegador (o acceder a la versión online)
2. Pegar el código Python en el panel izquierdo
3. Hacer clic en **Procesar código**
4. Copiar el resultado o descargarlo como `.py`

## Estructura del proyecto

```
numberer/
├── index.html   # Estructura de la página
├── styles.css   # Estilos visuales
└── app.js       # Lógica de numeración y eventos
```

## Autor

Nicolás Rubinstein
