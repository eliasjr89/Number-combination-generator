// ==== Pre-carga y gestión de sonidos ====
const sounds = {
  click: new Audio('./sounds/click-sound.mp3'),
  number: new Audio('./sounds/number-sound.mp3'),
  star: new Audio('./sounds/star-sound.mp3'),
  success: new Audio('./sounds/success-sound.mp3'),
  copy: new Audio('./sounds/copy-sound.mp3'),
  clear: new Audio('./sounds/clear-sound.mp3'),
};

function playSound(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(err => console.warn(`No se pudo reproducir "${name}":`, err));
  }
}

document.getElementById("generate-btn").addEventListener("click", generateRandomCombination);
document.getElementById("copy-button").addEventListener("click", copyCombination);
document.getElementById("clear-history").addEventListener("click", () => {
  document.getElementById("generated-list").innerHTML = '';
  playSound('clear');
});

// ==== Generar combinación aleatoria ====
function generateRandomCombination() {
  const button = document.getElementById("generate-btn");
  if (button.disabled) return;

  const ranges = [
    [1, 10],
    [11, 20],
    [21, 30],
    [31, 40],
    [41, 50],
  ];

  const numberElements = document.querySelectorAll("#random-combination .number");
  const starElements = document.querySelectorAll("#random-combination .star");

  button.disabled = true;
  button.textContent = "Generando...";
  playSound('click');

  let generatedNumbers = [];
  let generatedStars = [];

  numberElements.forEach((element, index) => {
    const [min, max] = ranges[index];
    generateRandomValue(element, min, max, generatedNumbers, 'number', index * 100, () => {
      if (generatedNumbers.length === ranges.length) generateStars();
    });
  });

  function generateStars() {
    starElements.forEach((element, index) => {
      generateRandomValue(element, 1, 12, generatedStars, 'star', 500 + index * 100, () => {
        if (generatedStars.length === 2) {
          button.disabled = false;
          button.textContent = "Generar nueva combinación";
          playSound('success');
          addCombinationToHistory(generatedNumbers, generatedStars);
          launchConfetti(); // 🎉
        }
      });
    });
  }
}

function generateRandomValue(element, min, max, generatedValues, type, delay = 0, callback) {
  let count = 0;
  const interval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (generatedValues.includes(rand));

    element.textContent = rand;
    count++;

    if (count > 15) {
      clearInterval(interval);
      generatedValues.push(rand);

      element.classList.add("pop");
      element.style.animation = `fadeInUp 0.5s ease-out forwards ${delay}ms, slideIn 0.8s ease-out ${delay}ms`; // Añadir animación de deslizamiento
      setTimeout(() => element.classList.remove("pop"), 300);

      playSound(type);
      callback();
    }
  }, 50);
}

// ==== Añadir combinación al historial ====
function addCombinationToHistory(numbers, stars) {
  const container = document.getElementById("generated-list");
  const combinationDiv = document.createElement("div");
  combinationDiv.className = "number-container";

  numbers.forEach(num => combinationDiv.appendChild(createBall('number', num)));
  stars.forEach(star => combinationDiv.appendChild(createBall('star', star)));

  container.prepend(combinationDiv);
}

function createBall(type, value) {
  const div = document.createElement("div");
  div.className = type;
  div.textContent = value;
  return div;
}

// ==== Copiar combinación ====
function copyCombination() {
  if (!navigator.clipboard) {
    alert('Tu navegador no soporta copiar al portapapeles.');
    return;
  }

  const combinationText = Array.from(
    document.querySelectorAll('#random-combination .number, #random-combination .star')
  ).map(el => el.textContent).join(' ');

  navigator.clipboard.writeText(combinationText)
    .then(() => {
      playSound('copy');
      showToast(translations[currentLang].toastCopied);
    })
    .catch(err => console.error('Error al copiar:', err));
}

// ==== Toast visual ====
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ==== Alternar modo oscuro ====
const darkToggle = document.getElementById("toggle-dark");
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  darkToggle.textContent = isDark ? "☀️ Modo claro" : "🌙 Modo oscuro";
  darkToggle.setAttribute("aria-pressed", isDark);
  darkToggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  localStorage.setItem("darkMode", isDark);
});

window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    darkToggle.textContent = "☀️ Modo claro";
    darkToggle.setAttribute("aria-pressed", true);
  }
});

// === Generar confeti ===
function launchConfetti() {
  const colors = [0, 30, 60, 120, 200, 280];
  for (let i = 0; i < 25; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.setProperty('--hue', colors[Math.floor(Math.random() * colors.length)]);
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1200);
  }
}

// Traducciones
const translations = {
  es: {
    generate: "Generar",
    generateNew: "Generar nueva combinación",
    copy: "Copiar",
    clear: "Limpiar",
    toggleDark: "🌙 Modo oscuro",
    toggleLight: "☀️ Modo claro",
    history: "Historial de combinaciones",
    toastCopied: "Combinación copiada al portapapeles",
    langToggle: "🌐 Cambiar idioma",
  },
  en: {
    generate: "Generate",
    generateNew: "Generate new combination",
    copy: "Copy",
    clear: "Clear",
    toggleDark: "🌙 Dark mode",
    toggleLight: "☀️ Light mode",
    history: "Combination history",
    toastCopied: "Combination copied to clipboard",
    langToggle: "🌐 Change language",
  },
};

let currentLang = localStorage.getItem("lang") || "es";

// Función para traducir la interfaz
function translateUI() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const isDark = document.body.classList.contains("dark-mode");
  document.getElementById("toggle-dark").textContent = isDark
    ? translations[currentLang].toggleLight
    : translations[currentLang].toggleDark;

  document.getElementById("toggle-lang").textContent = translations[currentLang].langToggle;
}

document.getElementById("toggle-lang").addEventListener("click", () => {
  currentLang = currentLang === "es" ? "en" : "es";
  localStorage.setItem("lang", currentLang);
  translateUI();
});

window.addEventListener("DOMContentLoaded", () => {
  translateUI();
});
