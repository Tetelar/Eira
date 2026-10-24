/* ============================================================
   EIRA - Interactividad
   ------------------------------------------------------------
   Cada bloque hace una cosa. El patrón casi siempre es:
   1. Buscar elementos del HTML  (document.querySelector)
   2. Escuchar un evento         (addEventListener: click, submit...)
   3. Cambiar algo en la página  (clases, texto, estilos)
   ============================================================ */

/* ---------- 1. Menú para celular ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  // toggle agrega la clase si no está, y la quita si ya está
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
});

// Cerrar el menú al elegir una opción
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---------- 2. Modo claro / oscuro ---------- */
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement; // es la etiqueta <html>

// localStorage guarda datos en el navegador, así recuerda tu preferencia
const savedTheme = localStorage.getItem('eira-theme');
if (savedTheme === 'dark') {
  root.setAttribute('data-theme', 'dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) {
    root.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('eira-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('eira-theme', 'dark');
  }
});

/* ---------- 3. Filtro de recetas ---------- */
const filterButtons = document.querySelectorAll('.filter-btn');
const recipeCards = document.querySelectorAll('.recipe-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Marcar como activo solo el botón presionado
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');

    // dataset.filter lee el atributo data-filter del HTML
    const filter = button.dataset.filter;

    recipeCards.forEach((card) => {
      const matches = filter === 'todas' || card.dataset.category === filter;
      // El segundo parámetro de toggle fuerza: true = agregar, false = quitar
      card.classList.toggle('hidden', !matches);
    });
  });
});

/* ---------- 4. Bienvenida interactiva en el teléfono de la portada ---------- */

// Cada paso de la bienvenida. "options" son botones que se pueden marcar.
// icon: 'logo' usa el isotipo de Eira en vez de un emoji.
const onboarding = [
  {
    icon: 'logo',
    title: '¡Bienvenido!',
    text: 'Te acompañaremos a construir hábitos saludables para cuidar tu cuerpo y tu bienestar cada día.',
  },
  {
    icon: '🤍',
    title: 'Importante',
    text: 'Eira es una herramienta de apoyo. No reemplaza la orientación de profesionales de la salud.',
  },
  {
    icon: '🩺',
    title: '¿Alguna condición?',
    text: 'Cuéntanos si tienes alguna de estas condiciones para adaptar tus recetas y rutinas.',
    options: ['Resistencia a la insulina', 'Diabetes', 'Hipertensión'],
  },
  {
    icon: '🎯',
    title: 'Sobre ti',
    text: '¿Qué te gustaría mejorar? Puedes elegir más de una opción.',
    options: ['Comer mejor', 'Moverme más', 'Dormir mejor', 'Reducir el estrés'],
  },
];

const onbScreen = document.getElementById('onb-screen');
const onbNext = document.getElementById('onb-next');
const onbSteps = document.querySelectorAll('#onb-steps li');
let onbIndex = 0;

function renderOnboarding() {
  const screen = onboarding[onbIndex];

  // Reutilizamos el isotipo del menú: outerHTML copia el SVG completo como texto
  const icon = screen.icon === 'logo'
    ? `<div class="onb-logo">${document.querySelector('.logo-mark').outerHTML}<span>EIRA</span></div>`
    : `<div class="onb-icon">${screen.icon}</div>`;

  const options = screen.options
    ? `<div class="chips">${screen.options.map((o) => `<button class="chip" aria-pressed="false">${o}</button>`).join('')}</div>`
    : '';

  onbScreen.innerHTML = `${icon}<h3>${screen.title}</h3><p>${screen.text}</p>${options}`;

  // Las opciones se marcan y desmarcan al tocarlas
  onbScreen.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', !pressed);
    });
  });

  // Puntos del indicador: los anteriores quedan "hechos" y el actual "activo"
  onbSteps.forEach((li, i) => {
    li.classList.toggle('done', i < onbIndex);
    li.classList.toggle('active', i === onbIndex);
  });

  const isLast = onbIndex === onboarding.length - 1;
  onbNext.textContent = isLast ? 'Comenzar' : 'Continuar';
}

onbNext.addEventListener('click', () => {
  if (onbIndex < onboarding.length - 1) {
    onbIndex++;
  } else {
    // Último paso: llevamos a la sección de hábitos y la bienvenida vuelve al inicio
    document.getElementById('habitos').scrollIntoView({ behavior: 'smooth' });
    onbIndex = 0;
  }
  renderOnboarding();
});

renderOnboarding();

/* ---------- 5. Formulario de registro (demo) ---------- */
const form = document.getElementById('signup-form');
const formMessage = document.getElementById('form-message');

form.addEventListener('submit', (event) => {
  // Evita que el navegador recargue la página (no hay servidor todavía)
  event.preventDefault();

  const email = document.getElementById('email').value;
  formMessage.textContent = `¡Gracias! Te avisaremos a ${email} 🌿`;
  form.reset();
});

/* ---------- 6. Año actual en el pie de página ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- 7. Detalle de recetas (ventana emergente) ---------- */

// Los datos de cada receta viven en un OBJETO.
// La clave (ej: "tostadas") coincide con el atributo data-recipe del HTML.
// Para agregar una receta nueva: copia un bloque, cambia la clave y los datos,
// y crea su tarjeta en index.html con el mismo data-recipe.
//
// "image" es la foto de cómo se ve el plato terminado. Ahora son fotos gratuitas
// de Unsplash (necesitan internet). Para usar tus propias fotos, guárdalas en una
// carpeta "img" junto a index.html y escribe, por ejemplo: image: 'img/avena.jpg'
// Si la foto no carga, se muestra el emoji en su lugar.
const recipes = {
  avena: {
    emoji: '🥣',
    image: 'https://images.unsplash.com/photo-1686344234276-dc3ac6f284ff?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Avena con frutos rojos',
    description: 'Un desayuno cremoso y tibio que te da energía estable toda la mañana.',
    time: '10 min',
    calories: 320,
    frequency: '3 a 5 veces por semana',
    ingredients: [
      { name: 'Avena en hojuelas', amount: '40 g' },
      { name: 'Leche descremada o bebida vegetal', amount: '200 ml' },
      { name: 'Frutos rojos (frescos o congelados)', amount: '80 g' },
      { name: 'Semillas de chía', amount: '10 g (1 cda)' },
      { name: 'Miel', amount: '5 g (1 cdta)' },
    ],
    steps: [
      'Calienta la leche en una olla a fuego medio.',
      'Agrega la avena y revuelve por 4 a 5 minutos, hasta que espese.',
      'Retira del fuego y mezcla las semillas de chía.',
      'Sirve y decora con los frutos rojos y la miel.',
    ],
    healthy:
      'La avena aporta beta-glucanos, un tipo de fibra que ayuda a controlar el colesterol y da saciedad. Los frutos rojos son ricos en antioxidantes y vitamina C, y la chía suma omega-3 de origen vegetal.',
  },

  quinoa: {
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Bowl de quinoa y verduras',
    description: 'Un almuerzo completo, colorido y fácil de preparar con anticipación.',
    time: '25 min',
    calories: 450,
    frequency: '2 a 3 veces por semana',
    ingredients: [
      { name: 'Quinoa (cruda)', amount: '60 g' },
      { name: 'Garbanzos cocidos', amount: '80 g' },
      { name: 'Brócoli', amount: '80 g' },
      { name: 'Zanahoria', amount: '50 g (½ unidad)' },
      { name: 'Tomates cherry', amount: '60 g (6 unidades)' },
      { name: 'Aceite de oliva', amount: '5 ml (1 cdta)' },
      { name: 'Jugo de limón, sal y pimienta', amount: 'a gusto' },
    ],
    steps: [
      'Lava bien la quinoa con agua fría para quitarle el amargor.',
      'Cocínala en el doble de agua por 15 minutos, hasta que absorba el líquido.',
      'Mientras tanto, cocina el brócoli al vapor por 5 minutos.',
      'Ralla la zanahoria y corta los tomates por la mitad.',
      'Arma el bowl con la quinoa de base y las verduras y garbanzos encima.',
      'Aliña con aceite de oliva, limón, sal y pimienta.',
    ],
    healthy:
      'La quinoa es una proteína vegetal completa (tiene todos los aminoácidos esenciales). Junto a los garbanzos aporta mucha fibra y proteína, y las verduras suman vitaminas, minerales y color al plato.',
  },

  batido: {
    emoji: '🍌',
    image: 'https://images.unsplash.com/photo-1685967836529-b0e8d6938227?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Batido de plátano y avena',
    description: 'Ideal como colación o después de entrenar. Listo en 5 minutos.',
    time: '5 min',
    calories: 210,
    frequency: '3 a 4 veces por semana',
    ingredients: [
      { name: 'Plátano', amount: '1 unidad mediana (100 g)' },
      { name: 'Avena en hojuelas', amount: '20 g (2 cdas)' },
      { name: 'Leche descremada o bebida vegetal', amount: '150 ml' },
      { name: 'Canela en polvo', amount: '1 pizca' },
      { name: 'Hielo (opcional)', amount: '3 a 4 cubos' },
    ],
    steps: [
      'Pela el plátano y córtalo en trozos.',
      'Pon todos los ingredientes en la licuadora.',
      'Licúa por 1 minuto, hasta que quede suave.',
      'Sirve de inmediato.',
    ],
    healthy:
      'El plátano aporta potasio, que ayuda a la función muscular, y carbohidratos de rápida absorción para recuperar energía. La avena suma fibra para que la energía dure más.',
  },

  tostadas: {
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Tostadas con palta y huevo',
    description: 'Un clásico saciador y nutritivo para empezar el día con proteína.',
    time: '12 min',
    calories: 380,
    frequency: '2 a 4 veces por semana',
    ingredients: [
      { name: 'Pan integral', amount: '2 rebanadas (60 g)' },
      { name: 'Palta', amount: '50 g (¼ unidad)' },
      { name: 'Huevos', amount: '2 unidades (110 g)' },
      { name: 'Tomate', amount: '30 g (3 rodajas)' },
      { name: 'Jugo de limón', amount: '5 ml (1 cdta)' },
      { name: 'Sal, pimienta y orégano', amount: 'a gusto' },
    ],
    steps: [
      'Tuesta las rebanadas de pan.',
      'Muele la palta con un tenedor y agrégale el limón y una pizca de sal.',
      'Cocina los huevos a tu gusto (a la plancha, revueltos o pochados), de 3 a 4 minutos.',
      'Unta la palta sobre las tostadas.',
      'Pon encima el tomate y el huevo, y termina con pimienta y orégano.',
    ],
    healthy:
      'La palta aporta grasas monoinsaturadas, buenas para el corazón. El huevo es una proteína de alta calidad que da saciedad, y el pan integral suma fibra para una digestión más lenta y estable.',
  },

  salmon: {
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Salmón al horno con espárragos',
    description: 'Un plato completo en una sola bandeja, perfecto para la cena.',
    time: '30 min',
    calories: 520,
    frequency: '1 a 2 veces por semana',
    ingredients: [
      { name: 'Filete de salmón', amount: '150 g' },
      { name: 'Espárragos', amount: '150 g (8 a 10 unidades)' },
      { name: 'Papas pequeñas', amount: '150 g (3 unidades)' },
      { name: 'Aceite de oliva', amount: '7 ml (½ cda)' },
      { name: 'Ajo', amount: '1 diente' },
      { name: 'Limón', amount: '½ unidad' },
      { name: 'Sal, pimienta y eneldo', amount: 'a gusto' },
    ],
    steps: [
      'Precalienta el horno a 200 °C.',
      'Corta las papas en cuartos, mézclalas con la mitad del aceite y hornéalas 10 minutos.',
      'Corta la base dura de los espárragos.',
      'Agrega a la bandeja el salmón y los espárragos, con el ajo picado, el resto del aceite, sal y pimienta.',
      'Hornea 12 a 15 minutos más, hasta que el salmón se separe fácil con un tenedor.',
      'Sirve con jugo de limón y eneldo por encima.',
    ],
    healthy:
      'El salmón es una de las mejores fuentes de omega-3, que cuida el corazón y el cerebro, además de proteína y vitamina D. Los espárragos aportan fibra, folato y muy pocas calorías.',
  },

  'frutos-secos': {
    emoji: '🥜',
    image: 'https://images.unsplash.com/photo-1543158181-1274e5362710?w=800&h=480&fit=crop&auto=format&q=80',
    name: 'Mix de frutos secos',
    description: 'Una colación práctica para llevar a cualquier parte.',
    time: '2 min',
    calories: 180,
    frequency: '5 a 7 veces por semana (1 porción al día)',
    ingredients: [
      { name: 'Almendras', amount: '10 g (8 unidades)' },
      { name: 'Nueces', amount: '10 g (4 mitades)' },
      { name: 'Semillas de zapallo', amount: '5 g (1 cdta)' },
      { name: 'Arándanos deshidratados', amount: '8 g (1 cda)' },
    ],
    steps: [
      'Mezcla todos los ingredientes en un recipiente.',
      'Si preparas varias porciones, guárdalas en frascos o bolsitas de 30 g.',
      'Llévalo contigo como colación a media mañana o media tarde.',
    ],
    healthy:
      'Los frutos secos aportan grasas saludables, vitamina E y magnesio, y las nueces suman omega-3. Son muy energéticos, por eso la clave es la porción: un puñado (unos 30 g) al día es suficiente.',
  },
};

const modal = document.getElementById('recipe-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

// Construye el HTML de la ventana a partir de los datos de una receta
function openRecipe(id) {
  const r = recipes[id];
  if (!r) return; // si no existe la receta, no hacemos nada

  // .map() transforma cada ingrediente en un <li>, y .join('') los une en un texto
  const ingredientsHTML = r.ingredients
    .map((ing) => `<li><span>${ing.name}</span><span class="amount">${ing.amount}</span></li>`)
    .join('');

  const stepsHTML = r.steps.map((step) => `<li>${step}</li>`).join('');

  // Las comillas invertidas (`) permiten escribir HTML en varias líneas
  // e insertar variables con ${...}
  modalContent.innerHTML = `
    <figure class="modal-photo">
      <img src="${r.image}" alt="Así se ve ${r.name} terminada">
      <figcaption>✨ Así se ve terminada · Foto: Unsplash</figcaption>
    </figure>

    <header class="modal-header">
      <h2 id="modal-title">${r.emoji} ${r.name}</h2>
      <p>${r.description}</p>
    </header>

    <div class="modal-body">
      <div class="modal-stats">
        <div class="stat"><span class="stat-label">⏱ Tiempo estimado</span><span class="stat-value">${r.time}</span></div>
        <div class="stat"><span class="stat-label">🔥 Calorías</span><span class="stat-value">${r.calories} kcal</span></div>
        <div class="stat"><span class="stat-label">📅 Frecuencia</span><span class="stat-value">${r.frequency}</span></div>
      </div>

      <h3>Ingredientes</h3>
      <ul class="ingredients">${ingredientsHTML}</ul>

      <h3>Preparación</h3>
      <ol class="recipe-steps">${stepsHTML}</ol>

      <h3>¿Por qué es saludable?</h3>
      <p class="healthy-box">${r.healthy}</p>

      <p class="modal-note">
        Valores aproximados por porción. Las cantidades y la frecuencia son una guía general;
        para un plan personalizado, consulta con un nutricionista.
      </p>
    </div>
  `;

  // Si la foto no carga (sin internet o ruta equivocada), mostramos el emoji grande
  const photo = modalContent.querySelector('.modal-photo');
  photo.querySelector('img').addEventListener('error', () => {
    photo.innerHTML = `<div class="modal-emoji">${r.emoji}</div>`;
  });

  modal.showModal(); // abre la ventana y oscurece el fondo
  modal.scrollTop = 0; // siempre empieza desde arriba
}

// Abrir al hacer clic en una tarjeta, o al presionar Enter/Espacio con el teclado
recipeCards.forEach((card) => {
  card.addEventListener('click', () => openRecipe(card.dataset.recipe));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openRecipe(card.dataset.recipe);
    }
  });
});

// Cerrar con el botón ✕ (la tecla Esc ya funciona sola gracias a <dialog>)
modalClose.addEventListener('click', () => modal.close());

// Cerrar al hacer clic en el fondo oscuro (fuera de la ventana)
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

/* ---------- 8. Rutinas de ejercicio con temporizador ---------- */

// Igual que las recetas, cada rutina es un objeto con sus datos.
// "duration" está en SEGUNDOS. "rest" es el descanso entre ejercicios.
// La duración total NO se escribe a mano: se calcula sola (ver totalSeconds).
const routines = [
  {
    id: 'yoga',
    emoji: '🧘',
    name: 'Yoga suave',
    level: 'Principiante',
    focus: 'Flexibilidad y calma',
    description: 'Una secuencia tranquila para soltar tensiones y conectar con tu respiración.',
    frequency: '3 a 5 veces por semana',
    rest: 10,
    exercises: [
      { name: 'Respiración consciente', duration: 60, tip: 'Con la espalda recta, inhala en 4 tiempos y exhala en 6.' },
      { name: 'Gato-vaca', duration: 60, tip: 'En cuatro apoyos, arquea y redondea la espalda al ritmo de tu respiración.' },
      { name: 'Perro boca abajo', duration: 45, tip: 'Caderas arriba, talones hacia el suelo. Puedes flexionar las rodillas.' },
      { name: 'Postura del niño', duration: 60, tip: 'Rodillas abiertas, frente al suelo, brazos estirados al frente.' },
      { name: 'Guerrero I', duration: 60, tip: '30 segundos por lado. Rodilla delantera sobre el tobillo.' },
      { name: 'Torsión sentada', duration: 60, tip: '30 segundos por lado. Crece con la espalda antes de girar.' },
      { name: 'Relajación final', duration: 90, tip: 'Boca arriba, suelta todo el cuerpo y respira lento.' },
    ],
  },
  {
    id: 'cardio',
    emoji: '🏃',
    name: 'Cardio en casa',
    level: 'Intermedio',
    focus: 'Resistencia y energía',
    description: 'Sube tus pulsaciones sin salir de casa y sin ningún equipo.',
    frequency: '3 veces por semana',
    rest: 15,
    exercises: [
      { name: 'Marcha en el lugar', duration: 60, tip: 'Calentamiento: levanta las rodillas y mueve los brazos.' },
      { name: 'Jumping jacks', duration: 40, tip: 'Abre y cierra piernas y brazos a la vez.' },
      { name: 'Rodillas al pecho', duration: 40, tip: 'Corre en el lugar subiendo las rodillas a la altura de la cadera.' },
      { name: 'Sentadilla con salto', duration: 30, tip: 'Aterriza suave, con las rodillas un poco flexionadas.' },
      { name: 'Escaladores', duration: 40, tip: 'En plancha, lleva las rodillas al pecho de forma alternada.' },
      { name: 'Burpees', duration: 30, tip: 'Hazlos sin salto si necesitas bajar la intensidad.' },
      { name: 'Vuelta a la calma', duration: 60, tip: 'Camina en el lugar y deja que tu respiración se normalice.' },
    ],
  },
  {
    id: 'fuerza',
    emoji: '💪',
    name: 'Fuerza básica',
    level: 'Principiante',
    focus: 'Tonificación sin equipo',
    description: 'Fortalece piernas, brazos y abdomen usando solo el peso de tu cuerpo.',
    frequency: '2 a 3 veces por semana (días no seguidos)',
    rest: 20,
    exercises: [
      { name: 'Sentadillas', duration: 45, tip: 'Espalda recta, como si te sentaras en una silla.' },
      { name: 'Flexiones', duration: 40, tip: 'Puedes apoyar las rodillas. Baja el pecho de forma controlada.' },
      { name: 'Puente de glúteos', duration: 45, tip: 'Boca arriba con las rodillas flexionadas, sube la cadera y aprieta los glúteos.' },
      { name: 'Plancha', duration: 30, tip: 'Codos bajo los hombros y el cuerpo en línea recta.' },
      { name: 'Zancadas alternas', duration: 45, tip: 'Da un paso largo y baja hasta que ambas rodillas formen 90°.' },
      { name: 'Superman', duration: 40, tip: 'Boca abajo, levanta brazos y piernas a la vez, y baja lento.' },
    ],
  },
  {
    id: 'oficina',
    emoji: '🪑',
    name: 'Pausa activa',
    level: 'Todos los niveles',
    focus: 'Estiramiento en la silla',
    description: 'Ideal para hacer entre clases o en el trabajo, sin levantarte de la silla.',
    frequency: 'Todos los días (cada 2 a 3 horas frente al escritorio)',
    rest: 5,
    exercises: [
      { name: 'Giros de cuello', duration: 30, tip: 'Lento y sin forzar, hacia ambos lados.' },
      { name: 'Rotación de hombros', duration: 30, tip: 'Círculos hacia atrás y luego hacia adelante.' },
      { name: 'Estiramiento de muñecas', duration: 30, tip: 'Brazo estirado, tira suave de los dedos hacia ti.' },
      { name: 'Estiramiento lateral', duration: 40, tip: '20 segundos por lado. Brazo arriba, inclínate hacia el lado contrario.' },
      { name: 'Torsión en la silla', duration: 40, tip: '20 segundos por lado. Gira el tronco tomándote del respaldo.' },
      { name: 'Estirar piernas', duration: 40, tip: 'Estira una pierna al frente y lleva la punta del pie hacia ti.' },
    ],
  },
];

// Suma la duración de todos los ejercicios + los descansos entre ellos.
// .reduce() recorre la lista acumulando un total.
function totalSeconds(routine) {
  const exercisesTime = routine.exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const restTime = routine.rest * (routine.exercises.length - 1);
  return exercisesTime + restTime;
}

// Convierte segundos al formato reloj "m:ss" (ej: 75 → "1:15")
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// --- Crear las tarjetas automáticamente a partir de los datos ---
const routinesList = document.getElementById('routines-list');

routines.forEach((routine) => {
  const card = document.createElement('article');
  card.className = 'routine-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.innerHTML = `
    <div class="routine-emoji">${routine.emoji}</div>
    <h3>${routine.name}</h3>
    <p>${routine.focus}</p>
    <div class="badges">
      <span class="badge">⏱ ${Math.round(totalSeconds(routine) / 60)} min</span>
      <span class="badge">${routine.level}</span>
      <span class="badge">${routine.exercises.length} ejercicios</span>
    </div>
  `;
  card.addEventListener('click', () => openRoutine(routine));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openRoutine(routine);
    }
  });
  routinesList.appendChild(card);
});

// --- Temporizador ---
const routineModal = document.getElementById('routine-modal');
const routineContent = document.getElementById('routine-content');
const RING_LENGTH = 2 * Math.PI * 80; // perímetro del círculo (radio 80): 2πr

// "Estado" del temporizador: toda la información que cambia mientras entrenas
let plan = [];        // lista de pasos: ejercicios y descansos intercalados
let step = 0;         // en qué paso vamos
let remaining = 0;    // segundos que quedan del paso actual
let timerId = null;   // identificador del setInterval (null = en pausa)
let finished = false;
let currentRoutine = null; // la rutina abierta (para sumar sus minutos a tus hábitos)

// Arma la lista de pasos: ejercicio, descanso, ejercicio, descanso...
function buildPlan(routine) {
  const steps = [];
  routine.exercises.forEach((ex, i) => {
    steps.push({ ...ex, type: 'exercise', exIndex: i });
    const isLast = i === routine.exercises.length - 1;
    if (!isLast && routine.rest > 0) {
      steps.push({ name: 'Descanso', duration: routine.rest, tip: 'Respira y prepárate para lo que viene.', type: 'rest', exIndex: i });
    }
  });
  return steps;
}

function openRoutine(routine) {
  currentRoutine = routine;
  plan = buildPlan(routine);

  const exercisesHTML = routine.exercises
    .map((ex) => `<li><span>${ex.name}</span><span class="amount">${formatTime(ex.duration)}</span></li>`)
    .join('');

  routineContent.innerHTML = `
    <div class="modal-banner">${routine.emoji}</div>

    <header class="modal-header">
      <h2 id="routine-title">${routine.name}</h2>
      <p>${routine.description}</p>
    </header>

    <div class="modal-body">
      <div class="modal-stats">
        <div class="stat"><span class="stat-label">⏱ Duración total</span><span class="stat-value">${Math.round(totalSeconds(routine) / 60)} min</span></div>
        <div class="stat"><span class="stat-label">📶 Nivel</span><span class="stat-value">${routine.level}</span></div>
        <div class="stat"><span class="stat-label">📅 Frecuencia</span><span class="stat-value">${routine.frequency}</span></div>
      </div>

      <div class="timer" id="timer">
        <p class="timer-phase" id="timer-phase"></p>
        <p class="timer-exercise" id="timer-exercise"></p>
        <p class="timer-tip" id="timer-tip"></p>

        <div class="timer-ring">
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <circle class="ring-bg" cx="90" cy="90" r="80"></circle>
            <circle class="ring-progress" id="ring-progress" cx="90" cy="90" r="80"
                    stroke-dasharray="${RING_LENGTH}" stroke-dashoffset="0"></circle>
          </svg>
          <div class="timer-time" id="timer-time" role="timer"></div>
        </div>

        <p class="timer-next" id="timer-next"></p>

        <div class="timer-controls">
          <button class="btn btn-primary" id="timer-toggle">▶ Iniciar</button>
          <button class="btn btn-secondary" id="timer-skip">⏭ Saltar</button>
          <button class="btn btn-secondary" id="timer-reset">↺ Reiniciar</button>
        </div>
      </div>

      <h3>Ejercicios</h3>
      <ol class="exercise-list" id="exercise-list">${exercisesHTML}</ol>

      <p class="modal-note">
        Escucha a tu cuerpo: si sientes dolor, detente. Si tienes una lesión o condición médica,
        consulta con un profesional antes de empezar una rutina nueva.
      </p>
    </div>
  `;

  // Conectar los botones recién creados
  document.getElementById('timer-toggle').addEventListener('click', toggleTimer);
  document.getElementById('timer-skip').addEventListener('click', nextStep);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  resetTimer();
  routineModal.showModal();
  routineModal.scrollTop = 0;
}

// Dibuja en pantalla el estado actual del temporizador
function renderTimer() {
  const current = plan[step];
  const timer = document.getElementById('timer');
  const toggleBtn = document.getElementById('timer-toggle');

  if (finished) {
    timer.classList.remove('is-rest');
    document.getElementById('timer-phase').textContent = '¡Lo lograste!';
    document.getElementById('timer-exercise').textContent = 'Rutina completada 🎉';
    document.getElementById('timer-tip').textContent = 'Toma agua y date un momento para notar cómo te sientes.';
    document.getElementById('timer-time').textContent = '✓';
    document.getElementById('timer-next').textContent = '';
    document.getElementById('ring-progress').style.strokeDashoffset = 0;
    toggleBtn.textContent = '↺ Repetir';
  } else {
    // classList.toggle con segundo parámetro: agrega la clase solo si es descanso
    timer.classList.toggle('is-rest', current.type === 'rest');
    const exerciseCount = plan.filter((s) => s.type === 'exercise').length;
    document.getElementById('timer-phase').textContent =
      current.type === 'rest'
        ? `Completaste ${current.exIndex + 1} de ${exerciseCount} ✓`
        : `Ejercicio ${current.exIndex + 1} de ${exerciseCount}`;
    document.getElementById('timer-exercise').textContent = current.name;
    document.getElementById('timer-tip').textContent = current.tip;
    document.getElementById('timer-time').textContent = formatTime(remaining);

    // El anillo se va llenando: offset 0 = lleno, offset = RING_LENGTH = vacío
    const progress = 1 - remaining / current.duration;
    document.getElementById('ring-progress').style.strokeDashoffset = RING_LENGTH * (1 - progress);

    const next = plan[step + 1];
    document.getElementById('timer-next').textContent = next ? `Siguiente: ${next.name}` : 'Último ejercicio 💪';
    toggleBtn.textContent = timerId ? '⏸ Pausar' : '▶ Continuar';
    if (!timerId && step === 0 && remaining === current.duration) toggleBtn.textContent = '▶ Iniciar';
  }

  // Marcar en la lista qué ejercicios están hechos y cuál va ahora
  const items = document.querySelectorAll('#exercise-list li');
  items.forEach((li, i) => {
    const doneIndex = finished ? items.length : current.exIndex + (current.type === 'rest' ? 1 : 0);
    li.classList.toggle('done', i < doneIndex);
    li.classList.toggle('current', !finished && current.type === 'exercise' && i === current.exIndex);
  });
}

// Se ejecuta cada 1 segundo mientras el temporizador corre
function tick() {
  remaining--;
  if (remaining <= 3 && remaining > 0) beep(660, 0.08); // cuenta regresiva: 3, 2, 1
  if (remaining <= 0) {
    nextStep();
  } else {
    renderTimer();
  }
}

function nextStep() {
  if (finished) return;
  if (step < plan.length - 1) {
    step++;
    remaining = plan[step].duration;
    beep(880, 0.2);
  } else {
    finished = true;
    stopTimer();
    beep(1046, 0.4);
    // Conexión con el seguimiento de hábitos (bloque 9): sumamos los minutos de la rutina
    addActivityMinutes(Math.round(totalSeconds(currentRoutine) / 60));
  }
  renderTimer();
}

function startTimer() {
  if (timerId) return; // ya está corriendo
  timerId = setInterval(tick, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function toggleTimer() {
  if (finished) {
    resetTimer();
    startTimer();
  } else if (timerId) {
    stopTimer();
  } else {
    startTimer();
  }
  renderTimer();
}

function resetTimer() {
  stopTimer();
  step = 0;
  finished = false;
  remaining = plan[0].duration;
  renderTimer();
}

// Sonido corto usando la Web Audio API del navegador (sin archivos de audio)
let audioCtx = null;
function beep(frequency, seconds) {
  try {
    audioCtx = audioCtx || new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + seconds);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + seconds);
  } catch (error) {
    // Si el navegador no permite sonido, simplemente seguimos sin él
  }
}

// Al cerrar la ventana (con ✕, Esc o clic afuera) pausamos el temporizador
document.getElementById('routine-close').addEventListener('click', () => routineModal.close());
routineModal.addEventListener('click', (event) => {
  if (event.target === routineModal) routineModal.close();
});
routineModal.addEventListener('close', stopTimer);

/* ---------- 9. Seguimiento de hábitos ---------- */

// Metas diarias. Cámbialas aquí y toda la sección se ajusta.
const GOALS = { water: 8, sleep: 7, activity: 30 };
const HABITS_KEY = 'eira-habits';
const MOOD_LABELS = { 1: 'Muy mal', 2: 'Mal', 3: 'Normal', 4: 'Bien', 5: 'Muy bien' };

// Los datos se guardan como un objeto con una entrada por día:
// { "2026-10-23": { water: 5, sleep: 7.5, activity: 20, mood: 4 }, ... }
// try/catch: si el navegador bloquea el almacenamiento, la página sigue funcionando.
function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(HABITS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveHabits() {
  try {
    // localStorage solo guarda texto: JSON.stringify convierte el objeto en texto
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    // Sin almacenamiento: los datos duran hasta recargar la página
  }
}

let habits = loadHabits();

// Convierte una fecha en una "clave" de texto, por ejemplo "2026-10-23"
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Fecha de hace N días (0 = hoy, 1 = ayer...)
function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

// Devuelve los datos de un día. Si no existen, los crea vacíos.
function getDay(key) {
  if (!habits[key]) habits[key] = { water: 0, sleep: 0, activity: 0, mood: null };
  return habits[key];
}

// Cuántas de las 4 metas se cumplieron en un día (de 0 a 4)
function dayScore(day) {
  if (!day) return 0;
  const goalsMet = [
    day.water >= GOALS.water,
    day.sleep >= GOALS.sleep,
    day.activity >= GOALS.activity,
    day.mood !== null,
  ];
  // filter(Boolean) deja solo los "true"; .length los cuenta
  return goalsMet.filter(Boolean).length;
}

// Racha: días seguidos (hacia atrás) con al menos 3 de 4 metas.
// Si hoy todavía no llegas a 3, no se rompe: empezamos a contar desde ayer.
function calcStreak() {
  let streak = 0;
  let n = dayScore(habits[dateKey(daysAgo(0))]) >= 3 ? 0 : 1;
  while (dayScore(habits[dateKey(daysAgo(n))]) >= 3) {
    streak++;
    n++;
  }
  return streak;
}

// Ancho de una barra de progreso en %, sin pasar de 100
function percent(value, goal) {
  return Math.min(100, (value / goal) * 100) + '%';
}

// --- Crear los 8 vasos de agua ---
const glassesBox = document.getElementById('glasses');
for (let i = 1; i <= GOALS.water; i++) {
  const glass = document.createElement('button');
  glass.className = 'glass';
  glass.textContent = '💧';
  glass.setAttribute('aria-label', `${i} vasos`);
  glass.addEventListener('click', () => {
    const today = getDay(dateKey(new Date()));
    // Si tocas el último vaso lleno, se vacía (para poder corregir)
    today.water = today.water === i ? i - 1 : i;
    updateHabits();
  });
  glassesBox.appendChild(glass);
}

// --- Conectar los controles ---
const sleepInput = document.getElementById('sleep-input');
sleepInput.addEventListener('input', () => {
  getDay(dateKey(new Date())).sleep = Number(sleepInput.value);
  updateHabits();
});

document.getElementById('activity-plus').addEventListener('click', () => addActivityMinutes(10));
document.getElementById('activity-minus').addEventListener('click', () => addActivityMinutes(-10));

// También la usa el temporizador de rutinas (bloque 8) al terminar una rutina
function addActivityMinutes(minutes) {
  const today = getDay(dateKey(new Date()));
  today.activity = Math.max(0, today.activity + minutes); // nunca bajo 0
  updateHabits();
}

document.querySelectorAll('.mood-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const today = getDay(dateKey(new Date()));
    const mood = Number(button.dataset.mood);
    today.mood = today.mood === mood ? null : mood; // tocar de nuevo lo desmarca
    updateHabits();
  });
});

// Guardar + volver a dibujar. Se llama después de cada cambio.
function updateHabits() {
  saveHabits();
  renderHabits();
}

// --- Dibujar todo según los datos ---
function renderHabits() {
  const today = getDay(dateKey(new Date()));

  // Agua
  document.getElementById('water-value').textContent = `${today.water} / ${GOALS.water}`;
  document.getElementById('water-progress').style.width = percent(today.water, GOALS.water);
  glassesBox.querySelectorAll('.glass').forEach((glass, i) => {
    glass.classList.toggle('filled', i < today.water);
  });

  // Sueño
  sleepInput.value = today.sleep;
  document.getElementById('sleep-value').textContent = `${today.sleep} h`;
  document.getElementById('sleep-progress').style.width = percent(today.sleep, GOALS.sleep);

  // Actividad
  document.getElementById('activity-value').textContent = `${today.activity} / ${GOALS.activity} min`;
  document.getElementById('activity-progress').style.width = percent(today.activity, GOALS.activity);

  // Ánimo
  document.getElementById('mood-value').textContent = today.mood ? MOOD_LABELS[today.mood] : '—';
  document.querySelectorAll('.mood-btn').forEach((button) => {
    button.setAttribute('aria-pressed', Number(button.dataset.mood) === today.mood);
  });

  // Resumen
  document.getElementById('streak').textContent = calcStreak();
  document.getElementById('today-score').textContent = `Hoy: ${dayScore(today)} de 4 metas`;

  // Gráfico de los últimos 7 días (de más antiguo a hoy)
  const chart = document.getElementById('week-chart');
  chart.innerHTML = '';
  for (let n = 6; n >= 0; n--) {
    const date = daysAgo(n);
    const score = dayScore(habits[dateKey(date)]);
    // toLocaleDateString con 'es' da el nombre del día en español: "lun", "mar"...
    const label = n === 0 ? 'Hoy' : date.toLocaleDateString('es', { weekday: 'short' }).replace('.', '');

    const col = document.createElement('div');
    col.className = 'bar-col' + (n === 0 ? ' today' : '');
    col.title = `${label}: ${score} de 4 metas`;
    col.innerHTML = `
      <div class="bar-track">
        <div class="bar ${score >= 3 ? 'complete' : ''}" style="height: ${(score / 4) * 100}%"></div>
      </div>
      <span class="bar-label">${label}</span>
    `;
    chart.appendChild(col);
  }
}

// --- Botones del resumen ---
// Llena los 6 días anteriores con datos inventados para ver el gráfico funcionando
document.getElementById('habits-demo').addEventListener('click', () => {
  const sample = [
    { water: 8, sleep: 7.5, activity: 35, mood: 4 },
    { water: 6, sleep: 6, activity: 15, mood: 3 },
    { water: 8, sleep: 8, activity: 30, mood: 5 },
    { water: 7, sleep: 7, activity: 40, mood: 4 },
    { water: 8, sleep: 7, activity: 30, mood: 4 },
    { water: 8, sleep: 8.5, activity: 45, mood: 5 },
  ];
  sample.forEach((day, i) => {
    // i = 0 es hace 6 días ... i = 5 es ayer. Hoy no se toca.
    habits[dateKey(daysAgo(6 - i))] = { ...day };
  });
  updateHabits();
});

document.getElementById('habits-reset').addEventListener('click', () => {
  // confirm() muestra una ventanita del navegador con Aceptar / Cancelar
  if (confirm('¿Borrar todos tus registros de hábitos?')) {
    habits = {};
    updateHabits();
  }
});

renderHabits();
