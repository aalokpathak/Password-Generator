(() => {
  'use strict';

  /* ============================================================
     Elements
     ============================================================ */
  const modeSwitch      = document.querySelector('.mode-switch');
  const modeRandomBtn   = document.getElementById('modeRandomBtn');
  const modePassphraseBtn = document.getElementById('modePassphraseBtn');
  const panelRandom     = document.getElementById('panelRandom');
  const panelPassphrase = document.getElementById('panelPassphrase');

  const lengthInput   = document.getElementById('length');
  const lengthValue   = document.getElementById('lengthValue');
  const uppercaseEl   = document.getElementById('uppercase');
  const lowercaseEl   = document.getElementById('lowercase');
  const numbersEl     = document.getElementById('numbers');
  const symbolsEl     = document.getElementById('symbols');
  const excludeAmbiguousEl = document.getElementById('excludeAmbiguous');
  const customExcludeEl = document.getElementById('customExclude');

  const wordCountInput = document.getElementById('wordCount');
  const wordCountValue = document.getElementById('wordCountValue');
  const separatorEl    = document.getElementById('separator');
  const capitalizeEl   = document.getElementById('capitalize');
  const appendNumberEl = document.getElementById('appendNumber');

  const errorMsg      = document.getElementById('errorMsg');
  const generateBtn   = document.getElementById('generateBtn');
  const passwordDisplay = document.getElementById('passwordDisplay');
  const copyBtn        = document.getElementById('copyBtn');
  const copyIcon        = document.getElementById('copyIcon');

  const strengthBox   = document.getElementById('strength');
  const dialFill       = document.getElementById('dialFill');
  const strengthLabel = document.getElementById('strengthLabel');
  const strengthBits  = document.getElementById('strengthBits');

  const historyBox   = document.getElementById('history');
  const historyList  = document.getElementById('historyList');

  let mode = 'random';
  let currentPassword = '';
  const historyEntries = [];
  const MAX_HISTORY = 5;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Word list — for Passphrase mode
     ============================================================ */
  const WORDLIST = [
    'anchor','beacon','cinder','delta','ember','falcon','granite','harbor','ionic','jasper',
    'kestrel','lantern','marble','nectar','onyx','pebble','quartz','ridge','summit','timber',
    'umbra','velvet','willow','xenon','yonder','zephyr','amber','birch','coral','driftwood',
    'echo','forge','glacier','hollow','ivory','juniper','knoll','lagoon','meadow','nimbus',
    'orbit','plume','quiver','raven','sable','thicket','underbrush','vale','wren','yarrow',
    'basalt','copper','dune','ferrous','grove','horizon','indigo','jetty','keel','lattice',
    'mica','nettle','opal','pinnacle','quartzite','ridgeline','shale','tundra','ultramarine','vapor',
    'wharf','yield','zenith','arbor','bramble','current','dusk','estuary','fjord','gable',
    'haze','islet','kiln','loam','mesa','notch','outpost','prairie','quay','reef',
    'saddle','trellis','undertow','vista','warden','yew','ash','bluff','cove','dell'
  ];

  /* ============================================================
     Secure random helpers (Web Crypto)
     ============================================================ */
  function secureRandomInt(maxExclusive) {
    const maxUint32 = 0xFFFFFFFF;
    const limit = maxUint32 - (maxUint32 % maxExclusive);
    let rand;
    do {
      rand = crypto.getRandomValues(new Uint32Array(1))[0];
    } while (rand > limit);
    return rand % maxExclusive;
  }

  function secureShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pick(arr) {
    return arr[secureRandomInt(arr.length)];
  }

  /* ============================================================
     Mode switching
     ============================================================ */
  function setMode(next) {
    mode = next;
    const isRandom = mode === 'random';
    modeRandomBtn.classList.toggle('is-active', isRandom);
    modePassphraseBtn.classList.toggle('is-active', !isRandom);
    modeRandomBtn.setAttribute('aria-selected', String(isRandom));
    modePassphraseBtn.setAttribute('aria-selected', String(!isRandom));
    panelRandom.hidden = !isRandom;
    panelPassphrase.hidden = isRandom;
    modeSwitch.dataset.active = mode;
    clearError();
  }
  modeRandomBtn.addEventListener('click', () => setMode('random'));
  modePassphraseBtn.addEventListener('click', () => setMode('passphrase'));

  /* ============================================================
     Slider labels
     ============================================================ */
  lengthInput.addEventListener('input', () => { lengthValue.textContent = lengthInput.value; });
  wordCountInput.addEventListener('input', () => { wordCountValue.textContent = wordCountInput.value; });

  /* ============================================================
     Error helper
     ============================================================ */
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.hidden = false;
  }
  function clearError() {
    errorMsg.hidden = true;
    errorMsg.textContent = '';
  }

  /* ============================================================
     Random password generation
     ============================================================ */
  const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'l', 'I']);

  function buildPools() {
    const raw = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      number: '0123456789',
      symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    };
    const excludeAmbiguous = excludeAmbiguousEl.checked;
    const customExcludeSet = new Set(customExcludeEl.value.split('').filter(Boolean));

    const filterChars = (str) => str.split('').filter(ch => {
      if (excludeAmbiguous && AMBIGUOUS.has(ch)) return false;
      if (customExcludeSet.has(ch)) return false;
      return true;
    });

    return {
      upper:  uppercaseEl.checked ? filterChars(raw.upper) : [],
      lower:  lowercaseEl.checked ? filterChars(raw.lower) : [],
      number: numbersEl.checked   ? filterChars(raw.number) : [],
      symbol: symbolsEl.checked   ? filterChars(raw.symbol) : []
    };
  }

  function generateRandomPassword() {
    const length = parseInt(lengthInput.value, 10);
    const pools = buildPools();
    const activeCategories = Object.values(pools).filter(p => p.length > 0);

    if (activeCategories.length === 0) {
      showError('Select at least one character set — or loosen your exclusions.');
      return null;
    }

    const combined = activeCategories.flat();
    const chars = [];

    // guarantee at least one char from each active, non-empty category
    activeCategories.forEach(pool => chars.push(pick(pool)));

    while (chars.length < length) {
      chars.push(pick(combined));
    }

    secureShuffle(chars);
    const trimmed = chars.slice(0, length);

    const poolSizes = {
      upper: pools.upper.length,
      lower: pools.lower.length,
      number: pools.number.length,
      symbol: pools.symbol.length
    };
    const poolSize = Object.values(poolSizes).reduce((a, b) => a + b, 0);
    const bits = length * Math.log2(Math.max(poolSize, 1));

    return { text: trimmed.join(''), bits };
  }

  /* ============================================================
     Passphrase generation
     ============================================================ */
  function generatePassphrase() {
    const wordCount = parseInt(wordCountInput.value, 10);
    const separator = separatorEl.value;
    const capitalize = capitalizeEl.checked;
    const appendNumber = appendNumberEl.checked;

    const words = [];
    for (let i = 0; i < wordCount; i++) {
      let w = pick(WORDLIST);
      if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
      words.push(w);
    }

    let bits = wordCount * Math.log2(WORDLIST.length);
    let text = words.join(separator);

    if (appendNumber) {
      const num = secureRandomInt(100);
      text += (separator || '') + String(num).padStart(2, '0');
      bits += Math.log2(100);
    }

    return { text, bits };
  }

  /* ============================================================
     Strength meter
     ============================================================ */
  function updateStrength(bits) {
    strengthBox.hidden = false;

    const pathLength = dialFill.getTotalLength();
    dialFill.style.strokeDasharray = `${pathLength}`;

    const pct = Math.min(bits / 120, 1);
    const offset = pathLength * (1 - pct);
    dialFill.style.strokeDashoffset = `${offset}`;

    let label, colorVar;
    if (bits < 35)      { label = 'Weak';     colorVar = 'var(--rust)'; }
    else if (bits < 60) { label = 'Fair';     colorVar = 'var(--amber)'; }
    else if (bits < 90) { label = 'Strong';   colorVar = 'var(--sage)'; }
    else                { label = 'Fortress'; colorVar = 'var(--brass-bright)'; }

    dialFill.style.stroke = colorVar;
    strengthLabel.textContent = label;
    strengthLabel.style.color = colorVar;
    strengthBits.textContent = `${Math.round(bits)} bits of entropy`;
  }

  /* ============================================================
     Output rendering (odometer-style reveal)
     ============================================================ */
  const RANDOM_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  function classifyChar(ch) {
    if (/[0-9]/.test(ch)) return 'output__char--num';
    if (/[a-zA-Z]/.test(ch)) return '';
    return 'output__char--sym';
  }

  function renderPassword(text) {
    passwordDisplay.innerHTML = '';
    const spans = [];

    text.split('').forEach((ch) => {
      const span = document.createElement('span');
      span.className = `output__char ${classifyChar(ch)}`.trim();
      span.textContent = reduceMotion ? ch : RANDOM_GLYPHS[secureRandomInt(RANDOM_GLYPHS.length)];
      passwordDisplay.appendChild(span);
      spans.push(span);
    });

    if (reduceMotion) return;

    spans.forEach((span, i) => {
      const finalChar = text[i];
      let ticks = 0;
      const maxTicks = 4 + secureRandomInt(4);
      const delay = i * 14;

      setTimeout(() => {
        const interval = setInterval(() => {
          ticks++;
          if (ticks >= maxTicks) {
            clearInterval(interval);
            span.textContent = finalChar;
            span.classList.add('is-rolling');
          } else {
            span.textContent = RANDOM_GLYPHS[secureRandomInt(RANDOM_GLYPHS.length)];
          }
        }, 28);
      }, delay);
    });
  }

  /* ============================================================
     History
     ============================================================ */
  function addToHistory(text, bits) {
    historyEntries.unshift({ text, bits, id: Date.now() });
    if (historyEntries.length > MAX_HISTORY) historyEntries.pop();
    renderHistory();
  }

  function maskPassword(text) {
    if (text.length <= 6) return text[0] + '••••';
    return text.slice(0, 3) + '••••' + text.slice(-2);
  }

  function renderHistory() {
    if (historyEntries.length === 0) {
      historyBox.hidden = true;
      return;
    }
    historyBox.hidden = false;
    historyList.innerHTML = '';
    historyEntries.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'history__item';
      li.tabIndex = 0;
      li.innerHTML = `<span>${maskPassword(entry.text)}</span><span>${Math.round(entry.bits)} bits</span>`;
      li.addEventListener('click', () => copyText(entry.text));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyText(entry.text); }
      });
      historyList.appendChild(li);
    });
  }

  /* ============================================================
     Copy to clipboard
     ============================================================ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied();
    } catch (err) {
      showError('Could not copy — your browser blocked clipboard access.');
    }
  }

  function flashCopied() {
    copyBtn.classList.add('is-copied');
    copyIcon.innerHTML = '<path d="M4 10.5l3.5 3.5L16 5.5" fill="none" />';
    setTimeout(() => {
      copyBtn.classList.remove('is-copied');
      copyIcon.innerHTML = '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M4.5 12.5h-1a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1"/>';
    }, 1600);
  }

  copyBtn.addEventListener('click', () => {
    if (currentPassword) copyText(currentPassword);
  });

  /* ============================================================
     Generate
     ============================================================ */
  function generate() {
    clearError();
    const result = mode === 'random' ? generateRandomPassword() : generatePassphrase();
    if (!result) return;

    currentPassword = result.text;
    renderPassword(result.text);
    updateStrength(result.bits);
    addToHistory(result.text, result.bits);
    copyBtn.disabled = false;
  }

  generateBtn.addEventListener('click', generate);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement !== customExcludeEl) {
      generate();
    }
  });

  /* ============================================================
     Init
     ============================================================ */
  setMode('random');
  generate();
})();
