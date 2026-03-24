/* ==========================================================
   1. VARIABLES GLOBALES
   Memoria del juego, cronómetro y estado de configuración.
   ========================================================== */
const jsonFiles = ["Revisión_General", "Quiz_Modulo_2", "Quiz_Modulo_3", "Quiz_Modulo_4", "Quiz_Modulo_5", "Quiz_Modulo_6", "Quiz_Modulo_7",
"Python_Basico","Python_Intermedio","Python_Avanzado","Python_Experto", "CSS_Basico","CSS_Intermedio","CSS_Avanzado","CSS_Experto","HTML_Basico",
"HTML_Intermedio","HTML_Avanzado", "HTML_Experto","Bootstrap_Basico","Bootstrap_Intermedio","Bootstrap_Avanzado","Bootstrap_Experto","JavaScript_Basico",
"JavaScript_Intermedio","JavaScript_Avanzado","JavaScript_Experto","PostgreSQL_Basico","PostgreSQL_Intermedio",
"PostgreSQL_Avanzado","PostgreSQL_Experto","Django_Basico","Django_Intermedio","Django_Avanzado","Django_Experto"];
let currentQuestions = []; // Array que almacena la data del JSON
let currentIndex = 0;      // En qué pregunta vamos
let score = 0;             // Aciertos
let lives = 3;             // Vidas del modo desafío
let timerInterval;         
let secondsElapsed = 0;    
let currentMode = 'study'; // Modalidad predeterminada
let isPaused = false;      
let mistakes = [];         // Registro de las preguntas fallidas para el reporte
let soundEnabled = true;   // Controla si se emiten o no efectos de sonido

/* ==========================================================
   2. INICIALIZACIÓN
   ========================================================== */
window.onload = () => {
    // Carga los nombres de los archivos JSON en el selector al abrir la web
    const select = document.getElementById('source-select');
    jsonFiles.forEach(file => {
        const opt = document.createElement('option');
        opt.value = `data/${file}.json`;
        opt.textContent = file.replace(/_/g, ' ');
        select.appendChild(opt);
    });
};

/* ==========================================================
   3. EVENTOS DE INTERFAZ Y NAVEGACIÓN
   ========================================================== */

// Alterna la selección visual de los Modos de Juego
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    };
});

// Evento que detona el inicio de la partida
document.getElementById('start-btn').onclick = async () => {
    const source = document.getElementById('source-select').value;
    const amount = parseInt(document.getElementById('q-amount').value);

    const container = document.getElementById('main-container');
    const topBar = document.getElementById('top-bar');

    // [VITAL] Se resetean los errores e índices al iniciar para no arrastrar datos viejos
    mistakes = [];
    currentIndex = 0;
    score = 0;

    // Se muestra la barra superior y se ajusta el margen del contenedor
    topBar.classList.remove('hidden');
    topBar.style.display = 'flex';
    container.classList.add('quiz-active-layout'); 

    try {
        // Carga el archivo JSON de la carpeta /data/
        const response = await fetch(source);
        const data = await response.json();
        
        // Barajamos el JSON y extraemos la cantidad de preguntas requerida
        currentQuestions = shuffleArray(data).slice(0, amount);
        
        // Cambiamos de la vista de menú a la vista del quiz
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        setupGameUI();
        startTimer();
        loadQuestion();
    } catch (e) {
        alert("Error cargando el archivo JSON. Revisa la carpeta /data/");
    }
};

/* ==========================================================
   4. MECÁNICAS DEL JUEGO
   ========================================================== */

// Activa o desactiva elementos visuales según la modalidad
function setupGameUI() {
    const livesEl = document.getElementById('lives-display');
    if (currentMode === 'game') {
        lives = 3;
        livesEl.classList.remove('v-hidden');
        updateLivesDisplay();
    } else {
        livesEl.classList.add('v-hidden');
    }
}

// Carga la pregunta actual en la interfaz
function loadQuestion() {
    const quizScreen = document.getElementById('quiz-screen');
    // Transición de desvanecimiento
    quizScreen.style.opacity = '0';

    // Se oculta la explicación previa
    const expBox = document.getElementById('explanation-box');
    expBox.classList.add('hidden');
    document.getElementById('explanation-text').textContent = ""; 

    setTimeout(() => {
        const q = currentQuestions[currentIndex];
        
        // Cargar etiqueta de Nivel Dinámico
        const levelTag = document.getElementById('level-tag');
        if (levelTag) {
            levelTag.textContent = q.nivel || "General"; 
        }

        // Cargar textos principales
        document.getElementById('question-text').textContent = q.pregunta;
        document.getElementById('category-badge').textContent = `${q.categoria} | ${q.tema}`;
        document.getElementById('progress-text').textContent = `Pregunta ${currentIndex + 1} de ${currentQuestions.length}`;
        document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;

        // Renderizar bloque de código con PrismJS si la pregunta lo contiene
        const codeContainer = document.getElementById('code-block');
        if (q.codigo) {
            codeContainer.classList.remove('hidden');
            const codeEl = codeContainer.querySelector('code');
            codeEl.textContent = q.codigo;
            Prism.highlightElement(codeEl);
        } else { codeContainer.classList.add('hidden'); }

        // Renderizado aleatorio de las opciones de respuesta
        const grid = document.getElementById('options-grid');
        grid.innerHTML = '';
        const correctValue = q.opcion1; // La lógica asume que la opcion1 es la correcta en BD
        
        // Filtramos opciones que puedan venir vacías en el JSON y barajamos
        let options = shuffleArray([q.opcion1, q.opcion2, q.opcion3, q.opcion4].filter(o => o));

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            // Se compara el texto del botón contra el texto original guardado
            btn.onclick = () => checkAnswer(opt === correctValue, btn, correctValue);
            grid.appendChild(btn);
        });

        quizScreen.style.opacity = '1';
    }, 300); // 300ms permite que ocurra el fade-out de CSS
}

// Lógica de evaluación de la respuesta clickeada por el usuario
function checkAnswer(isCorrect, btn, correctValue) {
    const allBtns = document.querySelectorAll('.option-btn');
    const q = currentQuestions[currentIndex]; 
    
    // Bloqueamos los botones para evitar doble puntuación
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        if(soundEnabled) sounds.correct();
    } else {
        btn.classList.add('wrong');
        // Ilumina la respuesta correcta para que el usuario aprenda de su error
        allBtns.forEach(b => { if(b.textContent === correctValue) b.classList.add('correct'); });
        if(soundEnabled) sounds.wrong();

        // REGISTRO DEL ERROR PARA EL REPORTE FINAL
        mistakes.push({
            pregunta: q.pregunta,
            tuRespuesta: btn.textContent,
            correcta: correctValue,
            explicacion: q.explicacion || "Sin explicación disponible."
        });

        // Penalización en modo Desafío
        if (currentMode === 'game') {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) return setTimeout(() => finishGame(true), 1000);
        }
    }

    // Lógica de transición a la siguiente pregunta
    if (currentMode === 'study') {
        const expBox = document.getElementById('explanation-box');
        expBox.classList.remove('hidden');
        document.getElementById('explanation-text').textContent = q.explicacion;
        document.getElementById('next-btn').onclick = () => {
            if(soundEnabled) sounds.click(); 
            nextQuestion();
        };
    } else {
        setTimeout(nextQuestion, 1500); // Avanza automáticamente tras 1.5s
    }
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) loadQuestion();
    else finishGame(false);
}

/* ==========================================================
   5. RESULTADOS Y REPORTES
   ========================================================== */
function finishGame(isGameOver) {
    clearInterval(timerInterval);
    document.getElementById('quiz-screen').classList.add('hidden');
    const resultScreen = document.getElementById('result-screen');
    resultScreen.classList.remove('hidden');

    const totalQuestions = currentQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Actualizar datos básicos
    document.getElementById('final-score').textContent = `${score} / ${totalQuestions}`;
    document.getElementById('final-time').textContent = document.getElementById('timer').textContent;

    // --- CÁLCULO DEL GRÁFICO CIRCULAR CSS ---
    const chart = document.getElementById('result-chart');
    const chartText = document.getElementById('chart-percentage');
    
    chart.style.background = `conic-gradient(var(--accent) ${percentage}%, #dc3545 ${percentage}% 100%)`;
    chartText.textContent = `${percentage}%`;

    // Interacción del gráfico (Alternar entre % y aciertos exactos)
    let showingPercentage = true;
    chart.onclick = () => {
        if(soundEnabled) sounds.click(); 
        if (showingPercentage) {
            chartText.textContent = `${score} / ${totalQuestions}`;
            chartText.style.fontSize = "1.2rem"; 
        } else {
            chartText.textContent = `${percentage}%`;
            chartText.style.fontSize = "1.5rem";
        }
        showingPercentage = !showingPercentage;
        chart.style.transform = "scale(0.95)";
        setTimeout(() => chart.style.transform = "scale(1.05)", 100);
    };

    // --- CONSTRUCCIÓN DEL REPORTE VISUAL DE ERRORES ---
    const reportContainer = document.getElementById('mistakes-report');
    const downloadBtn = document.getElementById('download-report-btn');
    reportContainer.innerHTML = ""; 

    if (mistakes.length > 0) {
        if (downloadBtn) {
            downloadBtn.classList.remove('hidden');
            downloadBtn.onclick = downloadMistakesReport; // Asigna evento de descarga
        }

        const title = document.createElement('h3');
        title.className = "report-title";
        title.innerHTML = "🔍 Revisión Detallada de Errores";
        reportContainer.appendChild(title);

        mistakes.forEach((m, index) => {
            const errorCard = document.createElement('div');
            errorCard.className = 'error-review-card';
            errorCard.innerHTML = `
                <div class="card-header">Pregunta ${index + 1}</div>
                <p class="error-q">${m.pregunta}</p>
                <div class="answers-row">
                    <div class="answer-box wrong-box">
                        <span class="label">Tu respuesta:</span>
                        <span class="val">${m.tuRespuesta}</span>
                    </div>
                    <div class="answer-box correct-box">
                        <span class="label">Correcta:</span>
                        <span class="val">${m.correcta}</span>
                    </div>
                </div>
                <div class="error-exp">
                    <strong>Análisis:</strong> ${m.explicacion}
                </div>
            `;
            reportContainer.appendChild(errorCard);
        });
    } else {
        if (downloadBtn) downloadBtn.classList.add('hidden');
        reportContainer.innerHTML = `
            <div class="perfect-badge">
                <span>✨</span>
                <p>¡Desempeño Perfecto! No tuviste errores.</p>
            </div>`;
    }
}

// Lógica para exportar los errores como un archivo .txt
function downloadMistakesReport() {
    if (mistakes.length === 0) return;

    let reportText = `REPORTE DE ESTUDIO - EduQuiz Master\n`;
    reportText += `Fecha: ${new Date().toLocaleDateString()}\n`;
    reportText += `Puntaje Final: ${score} / ${currentQuestions.length}\n`;
    reportText += `-------------------------------------------\n\n`;

    mistakes.forEach((m, i) => {
        reportText += `PREGUNTA ${i + 1}: ${m.pregunta}\n`;
        reportText += `❌ Tu respuesta: ${m.tuRespuesta}\n`;
        reportText += `✅ Respuesta correcta: ${m.correcta}\n`;
        reportText += `💡 Explicación: ${m.explicacion}\n`;
        reportText += `-------------------------------------------\n\n`;
    });

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `Reporte_EduQuiz_${currentMode}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ==========================================================
   6. FUNCIONES DE UTILIDAD (Sonido, Timer, Shuffle)
   ========================================================== */

// Algoritmo Fisher-Yates para barajar Arrays
function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Generador de Sonido Sintético usando la API nativa de Audio del navegador
function playTone(freq, type, duration) {
    if (!soundEnabled) return; 
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log("Audio bloqueado por el navegador hasta interacción del usuario");
    }
}

const sounds = {
    correct: () => playTone(600, 'sine', 0.3),
    wrong: () => playTone(200, 'triangle', 0.5),
    click: () => playTone(400, 'sine', 0.1)
};

// Alternador visual y lógico de sonido
document.getElementById('sound-toggle').onclick = function() {
    soundEnabled = !soundEnabled;
    this.textContent = soundEnabled ? "🔊" : "🔇";
    this.classList.toggle('muted', !soundEnabled);
};

// Cronómetro del juego
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `⏱️ ${m}:${s}`;
    }, 1000);
}

// Dibuja las vidas en la UI superior
function updateLivesDisplay() {
    document.getElementById('lives-display').textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

/* ==========================================================
   7. CONTROLES DE LA BARRA DE NAVEGACIÓN GLOBAL
   ========================================================== */
document.getElementById('theme-toggle').onclick = () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
};

document.getElementById('menu-toggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('nav-menu').classList.toggle('hidden');
};

// Si haces clic fuera del menú hamburguesa, se cierra solo
document.addEventListener('click', () => {
    document.getElementById('nav-menu').classList.add('hidden');
});

document.getElementById('reset-act-btn').onclick = () => {
    if(confirm("¿Reiniciar actividad?")) { currentIndex = 0; score = 0; loadQuestion(); }
};

document.getElementById('pause-act-btn').onclick = function() {
    isPaused = !isPaused;
    const quiz = document.getElementById('quiz-screen');
    if(isPaused) {
        clearInterval(timerInterval);
        this.textContent = "▶️ Reanudar";
        quiz.style.filter = "blur(8px)";
        quiz.style.pointerEvents = "none";
    } else {
        startTimer();
        this.textContent = "⏸️ Pausar";
        quiz.style.filter = "none";
        quiz.style.pointerEvents = "auto";
    }
};

document.getElementById('exit-act-btn').onclick = () => { location.reload(); };

document.getElementById('focus-mode-btn').onclick = function() {
    const container = document.getElementById('main-container');
    const isFocus = container.classList.toggle('focus-active');
    this.textContent = isFocus ? "🔳" : "🔳";
    
    // Si el navegador lo soporta, expande la web a pantalla completa
    if(isFocus) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
};
