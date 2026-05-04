import './style.css';

(() => {
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round = (n, d = 2) => Math.round(n * (10 ** d)) / (10 ** d);

const hexToRgb = (hex) => {
  const v = String(hex || '#000000').replace('#', '').toLowerCase();
  return {
    r: Number.parseInt(v.slice(0, 2), 16) || 0,
    g: Number.parseInt(v.slice(2, 4), 16) || 0,
    b: Number.parseInt(v.slice(4, 6), 16) || 0,
  };
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')).join('')}`;

const rgbToHsv = (r, g, b) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * (((bn - rn) / d) + 2);
    else h = 60 * (((rn - gn) / d) + 4);
  }
  if (h < 0) h += 360;
  return {h, s: max === 0 ? 0 : d / max, v: max};
};

const hsvToRgb = (h, s, v) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0; let g = 0; let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const hslToRgb = (h, s, l) => {
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lig - c / 2;
  let rr = 0; let gg = 0; let bb = 0;
  if (h < 60) [rr, gg, bb] = [c, x, 0];
  else if (h < 120) [rr, gg, bb] = [x, c, 0];
  else if (h < 180) [rr, gg, bb] = [0, c, x];
  else if (h < 240) [rr, gg, bb] = [0, x, c];
  else if (h < 300) [rr, gg, bb] = [x, 0, c];
  else [rr, gg, bb] = [c, 0, x];
  return {
    r: Math.round((rr + m) * 255),
    g: Math.round((gg + m) * 255),
    b: Math.round((bb + m) * 255),
  };
};

const parseColorInput = (rawValue) => {
  const raw = String(rawValue || '').trim().toLowerCase();
  if (!raw) return null;

  const hexCandidate = raw.startsWith('#') ? raw : `#${raw}`;
  if (/^#[0-9a-f]{6}$/.test(hexCandidate)) {
    return {color: hexCandidate, alpha: null};
  }
  if (/^#[0-9a-f]{8}$/.test(hexCandidate)) {
    return {
      color: hexCandidate.slice(0, 7),
      alpha: clamp(parseInt(hexCandidate.slice(7, 9), 16) / 255, 0, 1),
    };
  }

  let m = raw.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/);
  if (m) {
    const r = clamp(Number(m[1]), 0, 255);
    const g = clamp(Number(m[2]), 0, 255);
    const b = clamp(Number(m[3]), 0, 255);
    const a = typeof m[4] !== 'undefined' ? clamp(Number(m[4]), 0, 1) : null;
    return {color: rgbToHex(r, g, b), alpha: a};
  }

  m = raw.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/);
  if (m) {
    const h = clamp(Number(m[1]), 0, 360);
    const s = clamp(Number(m[2]), 0, 100);
    const l = clamp(Number(m[3]), 0, 100);
    const rgb = hslToRgb(h, s, l);
    const a = typeof m[4] !== 'undefined' ? clamp(Number(m[4]), 0, 1) : null;
    return {color: rgbToHex(rgb.r, rgb.g, rgb.b), alpha: a};
  }

  return null;
};

const rgbToHsl = (r, g, b) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * (((bn - rn) / d) + 2);
    else h = 60 * (((rn - gn) / d) + 4);
    if (h < 0) h += 360;
  }
  return {h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100)};
};

const fmtA = (a) => round(a, 2).toString().replace(/\.0$/, '');
const alphaHex = (a) => Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0');
const updateThumbShift = (slider) => {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 1;
  const safeValue = Number.isFinite(value) ? clamp(value, safeMin, safeMax) : safeMin;
  const ratio = (safeValue - safeMin) / (safeMax - safeMin);
  const shift = (ratio - 0.5) * 13;
  slider.style.setProperty('--thumb-shift', `${shift}px`);
};

const toRgba = (stop) => {
  const {r, g, b} = hexToRgb(stop.color);
  return `rgba(${r}, ${g}, ${b}, ${clamp(Number(stop.alpha), 0, 1)})`;
};

const getGradientParts = (state) => state.stops
  .slice()
  .sort((a, b) => a.position - b.position)
  .map((stop) => `${toRgba(stop)} ${round(stop.position, 2)}%`)
  .join(', ');

const getLinearGradientCss = (state) => `linear-gradient(${state.angle}deg, ${getGradientParts(state)})`;

const getGradientCss = (state) => {
  const parts = getGradientParts(state);

  if (state.type === 'radial') {
    return `radial-gradient(circle at center, ${parts})`;
  }

  return `linear-gradient(${state.angle}deg, ${parts})`;
};

const parseState = (raw) => {
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.stops) || !value.stops.length) throw new Error('invalid');
    return {
      type: value.type === 'radial' ? 'radial' : 'linear',
      angle: clamp(Number(value.angle) || 90, 0, 360),
      stops: value.stops.map((stop) => ({
        position: clamp(Number(stop.position) || 0, 0, 100),
        color: /^#[0-9a-f]{6}$/i.test(String(stop.color || '')) ? String(stop.color).toLowerCase() : '#538e4c',
        alpha: clamp(Number(stop.alpha) || 1, 0, 1),
      })).sort((a, b) => a.position - b.position),
    };
  } catch (_e) {
    return {
      type: 'linear',
      angle: 90,
      stops: [
        {position: 0, color: '#538e4c', alpha: 1},
        {position: 100, color: '#d20000', alpha: 1},
      ],
    };
  }
};

document.querySelectorAll('[data-gradient-color-input]').forEach((root) => {
  if (!(root instanceof HTMLElement) || root.dataset.gcfInit === '1') return;
  root.dataset.gcfInit = '1';

  const hidden = root.querySelector('[data-gradient-hidden]');
  const preview = root.querySelector('[data-gradient-preview]');
  const cssOutput = root.querySelector('[data-gradient-css-output]');
  const toggle = root.querySelector('[data-gradient-toggle]');
  const pop = root.querySelector('[data-gradient-pop]');
  const typeButtons = Array.from(root.querySelectorAll('[data-gradient-type-btn]'));
  const reverseBtn = root.querySelector('[data-gradient-reverse]');
  const rotateBtn = root.querySelector('[data-gradient-rotate]');
  const track = root.querySelector('[data-gradient-track]');
  const stopLayer = root.querySelector('[data-gradient-stop-layer]');
  const addStopBtn = root.querySelector('[data-gradient-add-stop]');
  const rows = root.querySelector('[data-gradient-stop-rows]');

  const colorPop = root.querySelector('[data-stop-color-picker]');
  const cpSv = root.querySelector('[data-cp-sv]');
  const cpSvHandle = root.querySelector('[data-cp-sv-handle]');
  const cpEyedropper = root.querySelector('[data-cp-eyedropper]');
  const cpPreviewDot = root.querySelector('[data-cp-preview-dot]');
  const cpHue = root.querySelector('[data-cp-hue]');
  const cpAlpha = root.querySelector('[data-cp-alpha]');
  const cpGrid = root.querySelector('[data-cp-channel-grid]');
  const cpModePrev = root.querySelector('[data-cp-mode-prev]');
  const cpModeNext = root.querySelector('[data-cp-mode-next]');
  const cpWrap1 = root.querySelector('[data-cp-cwrap="1"]');
  const cpWrap2 = root.querySelector('[data-cp-cwrap="2"]');
  const cpWrap3 = root.querySelector('[data-cp-cwrap="3"]');
  const cpWrap4 = root.querySelector('[data-cp-cwrap="4"]');
  const cpInput1 = root.querySelector('[data-cp-cinput="1"]');
  const cpInput2 = root.querySelector('[data-cp-cinput="2"]');
  const cpInput3 = root.querySelector('[data-cp-cinput="3"]');
  const cpInput4 = root.querySelector('[data-cp-cinput="4"]');
  const cpLabel1 = root.querySelector('[data-cp-clabel="1"]');
  const cpLabel2 = root.querySelector('[data-cp-clabel="2"]');
  const cpLabel3 = root.querySelector('[data-cp-clabel="3"]');
  const cpLabel4 = root.querySelector('[data-cp-clabel="4"]');

  if (!hidden || !preview || !toggle || !pop || !typeButtons.length || !reverseBtn || !rotateBtn || !track || !stopLayer || !addStopBtn || !rows || !colorPop || !cpSv || !cpSvHandle || !cpHue || !cpAlpha || !cpGrid || !cpModePrev || !cpModeNext || !cpWrap1 || !cpWrap2 || !cpWrap3 || !cpWrap4 || !cpInput1 || !cpInput2 || !cpInput3 || !cpInput4 || !cpLabel1 || !cpLabel2 || !cpLabel3 || !cpLabel4 || !cpEyedropper || !cpPreviewDot) {
    return;
  }

  document.body.appendChild(pop);
  document.body.appendChild(colorPop);

  let state = parseState(hidden.value || '');
  let selected = 0;
  let draggingIndex = null;

  let cpIndex = null;
  let cpH = 0;
  let cpS = 0;
  let cpV = 0;
  let cpA = 1;
  const cpModes = ['hex', 'rgb', 'rgba', 'hsl', 'hsla'];
  let cpModeIndex = 0;
  let syncingCpInputs = false;

  const positionPop = () => {
    const rect = toggle.getBoundingClientRect();
    pop.style.left = `${Math.max(8, rect.left)}px`;
    pop.style.top = `${Math.max(8, rect.top - pop.offsetHeight - 8)}px`;
  };

  const positionColorPop = (anchor) => {
    const rect = anchor.getBoundingClientRect();
    colorPop.style.left = `${Math.max(8, rect.left - colorPop.offsetWidth - 10)}px`;
    colorPop.style.top = `${Math.max(8, rect.top)}px`;
  };

  const commit = () => {
    hidden.value = JSON.stringify(state);
    const css = getGradientCss(state);
    preview.style.background = css;
    track.style.background = css;
    if (cssOutput) {
      cssOutput.textContent = getLinearGradientCss(state);
      cssOutput.title = cssOutput.textContent;
    }
  };

  const renderRows = () => {
    rows.innerHTML = '';

    state.stops.forEach((stop, index) => {
      const row = document.createElement('div');
      row.className = 'gcf-row-item';
      if (index === selected) row.classList.add('is-active');

      row.innerHTML = `
        <input type="number" class="text gcf-row-pos" min="0" max="100" step="1" value="${Math.round(stop.position)}">
        <button type="button" class="gcf-row-color" aria-label="Pick stop color"><span></span></button>
        <input type="text" class="text gcf-row-hex" value="${stop.color.toUpperCase()}">
        <input type="text" class="text gcf-row-alpha" value="${Math.round(stop.alpha * 100)}%">
        <button type="button" class="gcf-row-remove" aria-label="Remove stop">−</button>
      `;

      const posInput = row.querySelector('.gcf-row-pos');
      const colorBtn = row.querySelector('.gcf-row-color');
      const colorSwatch = row.querySelector('.gcf-row-color span');
      const hexInput = row.querySelector('.gcf-row-hex');
      const alphaInput = row.querySelector('.gcf-row-alpha');
      const removeBtn = row.querySelector('.gcf-row-remove');

      colorSwatch.style.background = toRgba(stop);

      row.addEventListener('click', (e) => {
        const interactive = e.target && typeof e.target.closest === 'function'
          ? e.target.closest('input, button, textarea, select, a')
          : null;
        if (interactive) {
          return;
        }
        selected = index;
        renderAll();
      });

      posInput.addEventListener('input', () => {
        stop.position = clamp(Number(posInput.value) || 0, 0, 100);
        state.stops.sort((a, b) => a.position - b.position);
        selected = state.stops.indexOf(stop);
        renderAll();
      });

      hexInput.addEventListener('change', (e) => {
        e.stopPropagation();
        const parsed = parseColorInput(hexInput.value);
        if (!parsed) return;
        stop.color = parsed.color;
        if (parsed.alpha !== null) {
          stop.alpha = parsed.alpha;
        }
        renderAll();
      });

      alphaInput.addEventListener('change', (e) => {
        e.stopPropagation();
        const raw = String(alphaInput.value || '').replace('%', '').trim();
        const percent = clamp(Number(raw), 0, 100);
        if (Number.isNaN(percent)) return;
        stop.alpha = percent / 100;
        renderAll();
      });

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.stops.length <= 2) return;
        state.stops.splice(index, 1);
        selected = clamp(selected, 0, state.stops.length - 1);
        renderAll();
      });

      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openColorPicker(index, colorBtn);
      });

      rows.appendChild(row);
    });
  };

  const renderStops = () => {
    stopLayer.innerHTML = '';

    state.stops.forEach((stop, index) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'gcf-stop';
      if (index === selected) marker.classList.add('is-active');
      marker.style.left = `${stop.position}%`;
      marker.innerHTML = '<span></span>';
      marker.querySelector('span').style.background = toRgba(stop);

      marker.addEventListener('click', (e) => {
        e.preventDefault();
        selected = index;
        renderAll();
      });

      marker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        draggingIndex = index;
        selected = index;
      });

      stopLayer.appendChild(marker);
    });
  };

  const renderAll = () => {
    typeButtons.forEach((button) => {
      const isActive = button.dataset.gradientTypeBtn === state.type;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('is-inactive', !isActive);
    });
    commit();
    renderStops();
    renderRows();
  };

  const openPicker = () => {
    pop.hidden = false;
    positionPop();
  };

  const closePicker = () => {
    pop.hidden = true;
    closeColorPicker();
  };

  const openColorPicker = (index, anchor) => {
    cpIndex = index;
    const stop = state.stops[index];
    const rgb = hexToRgb(stop.color);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    cpH = hsv.h;
    cpS = hsv.s;
    cpV = hsv.v;
    cpA = stop.alpha;
    colorPop.hidden = false;
    positionColorPop(anchor);
    renderColorPicker();
  };

  const closeColorPicker = () => {
    colorPop.hidden = true;
    cpIndex = null;
  };

  const renderColorPicker = () => {
    const rgb = hsvToRgb(cpH, cpS, cpV);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cpMode = cpModes[cpModeIndex];

    cpSv.style.backgroundColor = `hsl(${Math.round(cpH)} 100% 50%)`;
    cpSvHandle.style.left = `${cpS * 100}%`;
    cpSvHandle.style.top = `${(1 - cpV) * 100}%`;

    syncingCpInputs = true;
    cpHue.value = String(Math.round(cpH));
    cpAlpha.value = String(Math.round(cpA * 100));
    updateThumbShift(cpHue);
    updateThumbShift(cpAlpha);
    cpGrid.dataset.mode = cpMode;
    cpWrap1.style.display = '';
    cpWrap2.style.display = cpMode === 'hex' ? 'none' : '';
    cpWrap3.style.display = cpMode === 'hex' ? 'none' : '';
    cpWrap4.style.display = (cpMode === 'rgba' || cpMode === 'hsla') ? '' : 'none';

    if (cpMode === 'hex') {
      cpInput1.value = cpA < 1 ? `${hex.toUpperCase()}${alphaHex(cpA).toUpperCase()}` : hex.toUpperCase();
      cpLabel1.textContent = 'HEX';
    } else if (cpMode === 'rgb') {
      cpInput1.value = String(rgb.r);
      cpInput2.value = String(rgb.g);
      cpInput3.value = String(rgb.b);
      cpLabel1.textContent = 'R';
      cpLabel2.textContent = 'G';
      cpLabel3.textContent = 'B';
    } else if (cpMode === 'rgba') {
      cpInput1.value = String(rgb.r);
      cpInput2.value = String(rgb.g);
      cpInput3.value = String(rgb.b);
      cpInput4.value = fmtA(cpA);
      cpLabel1.textContent = 'R';
      cpLabel2.textContent = 'G';
      cpLabel3.textContent = 'B';
      cpLabel4.textContent = 'A';
    } else if (cpMode === 'hsl') {
      cpInput1.value = String(hsl.h);
      cpInput2.value = String(hsl.s);
      cpInput3.value = String(hsl.l);
      cpLabel1.textContent = 'H';
      cpLabel2.textContent = 'S';
      cpLabel3.textContent = 'L';
    } else {
      cpInput1.value = String(hsl.h);
      cpInput2.value = String(hsl.s);
      cpInput3.value = String(hsl.l);
      cpInput4.value = fmtA(cpA);
      cpLabel1.textContent = 'H';
      cpLabel2.textContent = 'S';
      cpLabel3.textContent = 'L';
      cpLabel4.textContent = 'A';
    }
    syncingCpInputs = false;
    cpPreviewDot.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${cpA})`;
    cpAlpha.style.setProperty('--slider-track', `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`);

    if (cpIndex !== null && state.stops[cpIndex]) {
      state.stops[cpIndex].color = hex;
      state.stops[cpIndex].alpha = cpA;
      renderAll();
    }
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (pop.hidden) openPicker();
    else closePicker();
  });

  typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextType = button.dataset.gradientTypeBtn === 'radial' ? 'radial' : 'linear';
      if (state.type === nextType) {
        return;
      }
      state.type = nextType;
      renderAll();
    });
  });

  reverseBtn.addEventListener('click', () => {
    state.stops = state.stops
      .map((stop) => ({...stop, position: 100 - stop.position}))
      .sort((a, b) => a.position - b.position);
    selected = clamp(selected, 0, state.stops.length - 1);
    renderAll();
  });

  rotateBtn.addEventListener('click', () => {
    state.angle = (state.angle + 45) % 360;
    renderAll();
  });

  addStopBtn.addEventListener('click', () => {
    const prev = state.stops[selected] || state.stops[0];
    const next = state.stops[selected + 1] || prev;
    const position = next === prev ? clamp(prev.position + 10, 0, 100) : ((prev.position + next.position) / 2);
    state.stops.push({position, color: prev.color, alpha: prev.alpha});
    state.stops.sort((a, b) => a.position - b.position);
    selected = state.stops.findIndex((stop) => stop.position === position);
    renderAll();
  });

  track.addEventListener('mousedown', (e) => {
    const rect = track.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const source = state.stops[selected] || state.stops[0];
    state.stops.push({position: x * 100, color: source.color, alpha: source.alpha});
    state.stops.sort((a, b) => a.position - b.position);
    selected = state.stops.findIndex((stop) => Math.abs(stop.position - x * 100) < 0.0001);
    renderAll();
  });

  document.addEventListener('mousemove', (e) => {
    if (draggingIndex === null) return;
    const rect = track.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const stop = state.stops[draggingIndex];
    if (!stop) return;
    stop.position = x * 100;
    state.stops.sort((a, b) => a.position - b.position);
    draggingIndex = state.stops.indexOf(stop);
    selected = draggingIndex;
    renderAll();
  });

  document.addEventListener('mouseup', () => {
    draggingIndex = null;
  });

  cpHue.addEventListener('input', () => {
    cpH = clamp(Number(cpHue.value) || 0, 0, 360);
    renderColorPicker();
  });

  cpAlpha.addEventListener('input', () => {
    cpA = clamp((Number(cpAlpha.value) || 0) / 100, 0, 1);
    renderColorPicker();
  });

  const applyCpInputs = () => {
    if (syncingCpInputs) return;
    const mode = cpModes[cpModeIndex];

    if (mode === 'hex') {
      const parsed = parseColorInput(cpInput1.value);
      if (!parsed) return;
      const rgb = hexToRgb(parsed.color);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      cpH = hsv.h;
      cpS = hsv.s;
      cpV = hsv.v;
      if (parsed.alpha !== null) cpA = parsed.alpha;
      renderColorPicker();
      return;
    }

    if (mode === 'rgb' || mode === 'rgba') {
      const r = clamp(Number(cpInput1.value), 0, 255);
      const g = clamp(Number(cpInput2.value), 0, 255);
      const b = clamp(Number(cpInput3.value), 0, 255);
      if ([r, g, b].some((x) => Number.isNaN(x))) return;
      if (mode === 'rgba') {
        const aa = clamp(Number(cpInput4.value), 0, 1);
        if (Number.isNaN(aa)) return;
        cpA = aa;
      }
      const hsv = rgbToHsv(r, g, b);
      cpH = hsv.h;
      cpS = hsv.s;
      cpV = hsv.v;
      renderColorPicker();
      return;
    }

    const hh = clamp(Number(cpInput1.value), 0, 360);
    const ss = clamp(Number(cpInput2.value), 0, 100);
    const ll = clamp(Number(cpInput3.value), 0, 100);
    if ([hh, ss, ll].some((x) => Number.isNaN(x))) return;
    if (mode === 'hsla') {
      const aa = clamp(Number(cpInput4.value), 0, 1);
      if (Number.isNaN(aa)) return;
      cpA = aa;
    }
    const rgb = hslToRgb(hh, ss, ll);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    cpH = hsv.h;
    cpS = hsv.s;
    cpV = hsv.v;
    renderColorPicker();
  };

  [cpInput1, cpInput2, cpInput3, cpInput4].forEach((input) => {
    input.addEventListener('change', applyCpInputs);
  });

  cpModePrev.addEventListener('click', () => {
    cpModeIndex = (cpModeIndex - 1 + cpModes.length) % cpModes.length;
    renderColorPicker();
  });

  cpModeNext.addEventListener('click', () => {
    cpModeIndex = (cpModeIndex + 1) % cpModes.length;
    renderColorPicker();
  });

  cpEyedropper.addEventListener('click', async () => {
    if (typeof EyeDropper === 'undefined') return;
    try {
      const result = await new EyeDropper().open();
      const parsed = parseColorInput(result.sRGBHex || '#000000');
      if (!parsed) return;
      const rgb = hexToRgb(parsed.color);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      cpH = hsv.h;
      cpS = hsv.s;
      cpV = hsv.v;
      if (parsed.alpha !== null) cpA = parsed.alpha;
      renderColorPicker();
    } catch (_e) {
      // cancelled
    }
  });

  let draggingSv = false;
  const updateSv = (e) => {
    const rect = cpSv.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    cpS = x;
    cpV = 1 - y;
    renderColorPicker();
  };

  cpSv.addEventListener('mousedown', (e) => {
    draggingSv = true;
    updateSv(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (!draggingSv) return;
    updateSv(e);
  });

  document.addEventListener('mouseup', () => {
    draggingSv = false;
  });

  document.addEventListener('mousedown', (e) => {
    const target = e.target;
    if (pop.hidden) return;

    // Close only the stop color picker if user clicked outside it
    // but still inside the main gradient modal.
    if (!colorPop.hidden) {
      const clickedStopColorButton = target && typeof target.closest === 'function'
        ? target.closest('.gcf-row-color')
        : null;
      if (!colorPop.contains(target) && !clickedStopColorButton) {
        closeColorPicker();
      }
    }

    // Close the whole gradient modal if clicked fully outside it.
    if (!toggle.contains(target) && !pop.contains(target) && !colorPop.contains(target)) {
      closePicker();
    }
  });

  window.addEventListener('resize', () => {
    if (!pop.hidden) positionPop();
  });

  window.addEventListener('scroll', () => {
    if (!pop.hidden) positionPop();
  }, true);

  renderAll();
});
})();
