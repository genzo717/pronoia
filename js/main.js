/**
 * PRONOIA STUDIO — Emotional Design & Cap Customizer Engine
 * High Performance, Zero External Dependencies, Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initPupilTracking();
  initCapCustomizer();
  initHeroParallax();
  initAudioFeedback();
  initUgcFilter();
  initConfettiCannon();
  initBackToTop();
});

/* ==========================================================================
   1. EYE PUPIL TRACKING (Categorias.png Emotional Design)
   Pupils follow cursor across the screen with gentle elasticity & blinking
   ========================================================================== */
function initPupilTracking() {
  const pupils = document.querySelectorAll('.eye-pupil');
  if (!pupils.length) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    requestAnimationFrame(updatePupils);
  }, { passive: true });

  function updatePupils() {
    pupils.forEach(pupil => {
      const rect = pupil.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = mouseX - eyeCenterX;
      const deltaY = mouseY - eyeCenterY;
      const distance = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      // Max pupil movement radius within the eye socket
      const maxMove = 5; 
      const moveDistance = Math.min(distance / 20, maxMove);

      const moveX = Math.cos(angle) * moveDistance;
      const moveY = Math.sin(angle) * moveDistance;

      pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  // Periodic playful blink
  setInterval(() => {
    const randomCard = document.querySelectorAll('.character-svg');
    if (!randomCard.length) return;
    const target = randomCard[Math.floor(Math.random() * randomCard.length)];
    target.classList.add('blink');
    setTimeout(() => target.classList.remove('blink'), 220);
  }, 4000);
}

/* ==========================================================================
   2. INTERACTIVE CAP CUSTOMIZER STUDIO (Taller Virtual)
   ========================================================================== */
function initCapCustomizer() {
  const capSvg = document.getElementById('customizer-cap-svg');
  if (!capSvg) return;

  // State
  const state = {
    model: 'trucker',
    modelName: 'Trucker 5-Panel',
    colorHex: '#dc0109',
    colorName: 'Rojo Pronoia',
    basePrice: 380,
    crownPatch: { id: 'chenille-heart', name: 'Corazón Chenille', price: 120, icon: 'heart' },
    sidePin: { id: 'pin-bolt', name: 'Pin Relámpago Dorado', price: 85, icon: 'bolt' },
    visorSticker: null,
    activeSlot: 'crown'
  };

  // Color Swatches
  const colorSwatches = document.querySelectorAll('.color-swatch-btn');
  colorSwatches.forEach(btn => {
    btn.addEventListener('click', () => {
      colorSwatches.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name');
      state.colorHex = hex;
      state.colorName = name;
      updateCapColor(hex);
      playSound('pop');
    });
  });

  function updateCapColor(hex) {
    const crownEl = document.getElementById('cap-crown-fill');
    const visorEl = document.getElementById('cap-visor-fill');
    const buttonTop = document.getElementById('cap-button-fill');
    if (crownEl) crownEl.setAttribute('fill', hex);
    if (visorEl) visorEl.setAttribute('fill', hex);
    if (buttonTop) buttonTop.setAttribute('fill', hex);
  }

  // Silhouette Selector
  const silButtons = document.querySelectorAll('.silhouette-btn');
  silButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      silButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const model = btn.getAttribute('data-model');
      state.model = model;
      state.modelName = btn.textContent.trim();
      
      const meshPattern = document.getElementById('cap-mesh-layer');
      if (meshPattern) {
        meshPattern.style.opacity = model === 'trucker' ? '0.28' : '0';
      }
      playSound('click');
      updatePrice();
    });
  });

  // Slot Selectors
  const slotCrown = document.getElementById('slot-crown');
  const slotSide = document.getElementById('slot-side');
  const slotVisor = document.getElementById('slot-visor');

  [slotCrown, slotSide, slotVisor].forEach(slot => {
    if (!slot) return;
    slot.addEventListener('click', () => {
      document.querySelectorAll('.patch-slot').forEach(s => s.classList.remove('active-slot'));
      slot.classList.add('active-slot');
      state.activeSlot = slot.getAttribute('data-slot');
      playSound('click');
    });
  });

  // Patch Catalog Tabs
  const patchTabs = document.querySelectorAll('.patch-tab-btn');
  const patchGrids = document.querySelectorAll('.patches-picker-grid');
  patchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      patchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetCat = tab.getAttribute('data-target');
      patchGrids.forEach(grid => {
        grid.style.display = grid.getAttribute('data-category') === targetCat ? 'grid' : 'none';
      });
      playSound('pop');
    });
  });

  // Patch Card Selections
  const patchCards = document.querySelectorAll('.patch-card-select');
  patchCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'), 10) || 0;
      const type = card.getAttribute('data-type'); // 'chenille', 'embroidery', 'pin', 'sticker'
      const icon = card.getAttribute('data-icon');

      if (state.activeSlot === 'crown') {
        state.crownPatch = { id, name, price, icon, type };
        renderPatchInSlot(slotCrown, icon, type);
      } else if (state.activeSlot === 'side') {
        state.sidePin = { id, name, price, icon, type };
        renderPatchInSlot(slotSide, icon, type);
      } else if (state.activeSlot === 'visor') {
        state.visorSticker = { id, name, price, icon, type };
        renderPatchInSlot(slotVisor, icon, type);
      }

      // Visual indicator
      card.classList.add('selected');
      setTimeout(() => card.classList.remove('selected'), 300);

      playSound('punch');
      updatePrice();
      showToast(`✨ Añadido: ${name}`);
    });
  });

  function renderPatchInSlot(slotElement, icon, type) {
    if (!slotElement) return;
    slotElement.innerHTML = '';
    const img = document.createElement('div');
    img.className = 'applied-patch';
    img.innerHTML = getPatchSvgIcon(icon, type);
    slotElement.appendChild(img);
  }

  // Reset Studio Button
  const btnReset = document.getElementById('btn-reset-studio');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.crownPatch = null;
      state.sidePin = null;
      state.visorSticker = null;
      if (slotCrown) slotCrown.innerHTML = '<span class="slot-indicator-text">+ Frente</span>';
      if (slotSide) slotSide.innerHTML = '<span class="slot-indicator-text">+ Pin</span>';
      if (slotVisor) slotVisor.innerHTML = '<span class="slot-indicator-text">+ Visera</span>';
      updatePrice();
      playSound('click');
      showToast('Estudio reiniciado. ¡Crea tu combinación!');
    });
  }

  function updatePrice() {
    let total = state.basePrice;
    if (state.crownPatch) total += state.crownPatch.price;
    if (state.sidePin) total += state.sidePin.price;
    if (state.visorSticker) total += state.visorSticker.price;

    const priceEl = document.getElementById('studio-total-price');
    if (priceEl) {
      priceEl.textContent = `$${total} MXN`;
    }

    // Update WhatsApp Button link
    const waBtn = document.getElementById('btn-whatsapp-custom');
    if (waBtn) {
      const itemsList = [];
      if (state.crownPatch) itemsList.push(`• Frente: ${state.crownPatch.name} ($${state.crownPatch.price} MXN)`);
      if (state.sidePin) itemsList.push(`• Lateral: ${state.sidePin.name} ($${state.sidePin.price} MXN)`);
      if (state.visorSticker) itemsList.push(`• Visera: ${state.visorSticker.name} ($${state.visorSticker.price} MXN)`);

      const text = `¡Hola PRONOIA! ✨ Acabo de diseñar mi gorra en el Taller Virtual:\n` +
        `- Modelo: ${state.modelName}\n` +
        `- Color base: ${state.colorName}\n` +
        (itemsList.length ? `- Personalización:\n${itemsList.join('\n')}\n` : `- Sin parches adicionales\n`) +
        `- Total estimado: $${total} MXN\n\n` +
        `¿Me confirmas disponibilidad para iniciar la producción?`;

      waBtn.href = `https://wa.me/5215500000000?text=${encodeURIComponent(text)}`;
    }
  }

  // Initial render
  if (slotCrown) renderPatchInSlot(slotCrown, 'heart', 'chenille');
  if (slotSide) renderPatchInSlot(slotSide, 'bolt', 'pin');
  updatePrice();
}

/* ==========================================================================
   SVG PATCH ICONS GENERATOR (Crisp, zero loading time, tactile vectors)
   ========================================================================== */
function getPatchSvgIcon(icon, type) {
  switch (icon) {
    case 'heart':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <path d="M50 86 C25 68 10 50 10 32 C10 18 22 10 35 10 C43 10 48 14 50 18 C52 14 57 10 65 10 C78 10 90 18 90 32 C90 50 75 68 50 86 Z" fill="#ffffff" stroke="#dc0109" stroke-width="4" stroke-dasharray="3,3"/>
        <path d="M50 80 C30 64 16 48 16 32 C16 22 25 15 35 15 C42 15 47 19 50 24 C53 19 58 15 65 15 C75 15 84 22 84 32 C84 48 70 64 50 80 Z" fill="#dc0109"/>
        <text x="50" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="1">AMOR</text>
      </svg>`;
    case 'smiley':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <circle cx="50" cy="50" r="44" fill="#ffd152" stroke="#141313" stroke-width="5" stroke-dasharray="4,2"/>
        <circle cx="35" cy="38" r="6" fill="#141313"/>
        <circle cx="65" cy="38" r="6" fill="#141313"/>
        <path d="M30 58 Q50 80 70 58" fill="none" stroke="#141313" stroke-width="6" stroke-linecap="round"/>
      </svg>`;
    case 'bolt':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); width:100%; height:100%;">
        <polygon points="58,6 20,54 48,54 42,94 80,44 52,44" fill="#ffd152" stroke="#b8860b" stroke-width="3"/>
        <polygon points="56,12 24,52 48,52 44,84 74,46 52,46" fill="#ffe066"/>
      </svg>`;
    case 'flower':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <circle cx="50" cy="24" r="16" fill="#ff7597"/>
        <circle cx="76" cy="50" r="16" fill="#ff7597"/>
        <circle cx="50" cy="76" r="16" fill="#ff7597"/>
        <circle cx="24" cy="50" r="16" fill="#ff7597"/>
        <circle cx="34" cy="34" r="16" fill="#ffd152"/>
        <circle cx="66" cy="34" r="16" fill="#ffd152"/>
        <circle cx="66" cy="66" r="16" fill="#ffd152"/>
        <circle cx="34" cy="66" r="16" fill="#ffd152"/>
        <circle cx="50" cy="50" r="16" fill="#ffffff" stroke="#141313" stroke-width="2"/>
        <circle cx="45" cy="46" r="3" fill="#141313"/>
        <circle cx="55" cy="46" r="3" fill="#141313"/>
        <path d="M45 54 Q50 58 55 54" fill="none" stroke="#141313" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    case 'eye':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <path d="M10 50 Q50 15 90 50 Q50 85 10 50 Z" fill="#ffffff" stroke="#141313" stroke-width="4"/>
        <circle cx="50" cy="50" r="22" fill="#70c1ff"/>
        <circle cx="50" cy="50" r="12" fill="#141313"/>
        <circle cx="54" cy="46" r="4" fill="#ffffff"/>
        <path d="M50 15 L50 6 M75 25 L82 18 M25 25 L18 18" stroke="#ffd152" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
    case 'letter-p':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <rect x="15" y="15" width="70" height="70" rx="14" fill="#ffffff" stroke="#dc0109" stroke-width="4" stroke-dasharray="3,3"/>
        <text x="50" y="68" font-family="'Fraunces', serif" font-weight="900" font-size="52" fill="#dc0109" text-anchor="middle">P</text>
      </svg>`;
    case 'cherries':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); width:100%; height:100%;">
        <path d="M50 15 Q40 40 32 60" fill="none" stroke="#558b2f" stroke-width="5" stroke-linecap="round"/>
        <path d="M50 15 Q60 40 68 62" fill="none" stroke="#558b2f" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="32" cy="68" rx="18" ry="16" fill="#dc0109"/>
        <ellipse cx="68" cy="70" rx="18" ry="16" fill="#dc0109"/>
        <circle cx="26" cy="62" r="4" fill="#ffffff" opacity="0.6"/>
        <circle cx="62" cy="64" r="4" fill="#ffffff" opacity="0.6"/>
      </svg>`;
    case 'pin-star':
      return `<svg viewBox="0 0 100 100" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); width:100%; height:100%;">
        <polygon points="50,5 64,36 98,38 72,62 80,95 50,76 20,95 28,62 2,38 36,36" fill="#ffd152" stroke="#b8860b" stroke-width="3"/>
        <circle cx="50" cy="50" r="10" fill="#dc0109"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#dc0109"/></svg>`;
  }
}

/* ==========================================================================
   3. HERO MOUSE PARALLAX & 3D TILT
   ========================================================================== */
function initHeroParallax() {
  const stage = document.querySelector('.hero-stage');
  const cap = document.querySelector('.hero-cap-display');
  if (!stage || !cap) return;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / rect.height) * 16;
    const rotY = (x / rect.width) * 20;

    cap.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;
  }, { passive: true });

  stage.addEventListener('mouseleave', () => {
    cap.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================================
   4. EMOTIONAL AUDIO FEEDBACK (Synthesized via Web Audio API)
   Zero external files, instant tactile pops and clicks
   ========================================================================== */
let audioCtx = null;
let audioEnabled = true;

function initAudioFeedback() {
  // Init on first user gesture
  const startAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    window.removeEventListener('click', startAudio);
  };
  window.addEventListener('click', startAudio, { once: true });
}

function playSound(type) {
  if (!audioEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'pop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'punch') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

/* ==========================================================================
   5. UGC COMMUNITY GALLERY FILTER
   ========================================================================== */
function initUgcFilter() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const ugcCards = document.querySelectorAll('.ugc-card');
  if (!filterPills.length || !ugcCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-filter');

      ugcCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
      playSound('pop');
    });
  });
}

/* ==========================================================================
   6. CELEBRATION CONFETTI CANNON
   ========================================================================== */
function initConfettiCannon() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let particles = [];
  const colors = ['#dc0109', '#ffd152', '#ff7597', '#a8e6cf', '#ffffff'];

  window.triggerConfetti = function() {
    playSound('pop');
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.45,
        w: Math.random() * 9 + 4,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        opacity: 1
      });
    }
  };

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42; // gravity
      p.rot += p.rotSpeed;
      p.opacity -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      if (p.opacity <= 0 || p.y > canvas.height) {
        particles.splice(idx, 1);
      }
    });

    requestAnimationFrame(animate);
  }
  animate();

  // Connect to Teaser Subscribe Button
  const teaserForm = document.getElementById('teaser-subscribe-form');
  if (teaserForm) {
    teaserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = teaserForm.querySelector('input').value;
      if (email) {
        window.triggerConfetti();
        showToast('🎉 ¡Bienvenido al Club VIP de Pronoia!');
        teaserForm.reset();
      }
    });
  }
}

/* ==========================================================================
   7. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(msg) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ==========================================================================
   8. BACK TO TOP SCROLL
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('btn-back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playSound('click');
  });
}
