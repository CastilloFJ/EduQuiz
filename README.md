# EduQuiz - Focus Mode

<div align="center">

![Versión](https://img.shields.io/badge/Versión-1.0.0-3776AB?style=for-the-badge&logo=github)
![Fase](https://img.shields.io/badge/Fase-Beta%20/%20PoC-orange?style=for-the-badge&logo=google-analytics)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge&logo=git)
![Despliegue](https://img.shields.io/badge/Despliegue-GitHub%20Pages-222222?style=for-the-badge&logo=github-pages)
![Requiere](https://img.shields.io/badge/Requiere-Servidor%20Local-critical?style=for-the-badge&logo=serverfault)

</div>

### 🛠️ Tecnologías Core
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![JSON](https://img.shields.io/badge/Data-JSON-000000?style=flat-square&logo=json&logoColor=white)

**EduQuiz** es una plataforma de aprendizaje inmersiva diseñada bajo el concepto de **Modo Enfoque (Focus Mode)**. Permite a estudiantes y profesionales evaluar sus conocimientos en diversas áreas mediante una interfaz limpia, sin distracciones y altamente personalizable a través de archivos JSON.

## 🚀 Características Principales

* **Agnóstico a la Temática**: Funciona con cualquier disciplina (Python, Química Orgánica, etc.) simplemente cargando el archivo de datos correspondiente.
* **Tres Modos de Aprendizaje**:
    * **Estudio**: Sin tiempo, con retroalimentación pedagógica inmediata.
    * **Quiz**: Evaluación estándar para medir velocidad y precisión.
    * **Desafío**: Sistema de 3 vidas para máxima presión competitiva.
* **Interfaz de Enfoque**: Para mayor concentración, con bordes rectos, modo oscuro nativo y navegación lateral.
* **Resaltado de Código**: Integración con Prism.js para una lectura clara de fragmentos de programación.

## 🛠️ Cómo agregar nuevas temáticas

Para incorporar un nuevo cuestionario, sigue estos dos pasos:

1.  **Crea el JSON**: Guarda un archivo en la carpeta `/data/` con la siguiente estructura técnica:
    ```json
    {
      "campo": "Ciencias",
      "area": "Química",
      "categoria": "General",
      "nivel": "Básico",
      "tema": "Tabla Periódica",
      "pregunta": "¿Cuál es el símbolo del Oro?",
      "opcion1": "Ag",
      "opcion2": "Au",
      "opcion3": "Fe",
      "opcion4": "Pb",
      "respuesta_correcta": 1,
      "explicacion": "El símbolo Au proviene del latín 'aurum'."
    }
    ```
2.  **Registra la Fuente**: Añade el nombre del archivo (sin .json) al array `jsonFiles` en el archivo `script.js`.

3.  ## 🛠️ Ejecución Local

Debido al uso de `fetch()` para cargar las bases de datos JSON, este proyecto **no funcionará** abriendo el archivo HTML directamente desde el explorador de archivos.

Para ejecutarlo en tu PC, utiliza un servidor local:
1. **Python**: Ejecuta `python -m http.server 8000` en la carpeta del proyecto.
2. **VS Code**: Usa la extensión *Live Server*.
3. **Node.js**: Usa el paquete `http-server`.


## 🌐 Despliegue

Este proyecto está optimizado para ser alojado en **GitHub Pages**. Solo necesitas subir los archivos y activar la opción en los ajustes del repositorio. Aunque ya cuenta con contenido general para prueba y otras como HTML, CSS, JS, Python, Django, PostgreSQL y Bootstrap segmentados por niveles.

---
© 2026 JCastillo - Desarrollador Full Stack & Profesor de Química.
