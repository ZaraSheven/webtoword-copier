// ══ Provider + Model Data ══════════════════════════════════════════
var PROVIDERS = {
  opencode: {
    label:  'OpenCode Zen',
    base:   'https://opencode.ai/zen/go/v1',
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', tag: 'Fast' },
      { id: 'deepseek-v3',       label: 'DeepSeek V3',       tag: 'Smart' },
      { id: 'deepseek-r1',       label: 'DeepSeek R1',       tag: 'Reason' }
    ]
  },
  openai: {
    label:  'OpenAI',
    base:   'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o',       label: 'GPT-4o',       tag: 'Best' },
      { id: 'gpt-4o-mini',  label: 'GPT-4o Mini',  tag: 'Fast' },
      { id: 'gpt-4.1',      label: 'GPT-4.1',      tag: 'New' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', tag: 'Cheap' }
    ]
  },
  deepseek: {
    label:  'DeepSeek',
    base:   'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', tag: 'Fast' },
      { id: 'deepseek-v4-pro',   label: 'DeepSeek V4 Pro',   tag: 'Smart' },
      { id: 'deepseek-chat',     label: 'DeepSeek Chat',     tag: 'Stable' },
      { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', tag: 'Reason' }
    ]
  },
  gemini: {
    label:  'Google Gemini',
    base:   'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2.5-flash',   label: 'Gemini 2.5 Flash', tag: 'Fast' },
      { id: 'gemini-2.5-pro',     label: 'Gemini 2.5 Pro',   tag: 'Best' },
      { id: 'gemini-2.0-flash',   label: 'Gemini 2.0 Flash', tag: 'Stable' }
    ]
  },
  groq: {
    label:  'Groq',
    base:   'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B',    tag: 'Fast' },
      { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',     tag: 'Ultra' },
      { id: 'openai/gpt-oss-120b',     label: 'GPT-OSS 120B',     tag: 'New' }
    ]
  },
  openrouter: {
    label:  'OpenRouter',
    base:   'https://openrouter.ai/api/v1',
    models: [
      { id: 'openai/gpt-4o',                    label: 'GPT-4o',              tag: 'OpenAI' },
      { id: 'anthropic/claude-sonnet-4',         label: 'Claude Sonnet 4',     tag: 'Anthropic' },
      { id: 'google/gemini-2.5-flash',           label: 'Gemini 2.5 Flash',    tag: 'Google' },
      { id: 'deepseek/deepseek-v3.2',            label: 'DeepSeek V3.2',       tag: 'DeepSeek' },
      { id: 'meta-llama/llama-3.3-70b-versatile',label: 'Llama 3.3 70B',      tag: 'Meta' }
    ]
  },
  custom: {
    label:  'Custom',
    base:   '',
    models: []
  }
};

// ══ DOM Refs ══════════════════════════════════════════════════════
var $ = function(id) { return document.getElementById(id); };

var currentProvider  = 'opencode';
var currentModel     = 'deepseek-v4-flash';

// ══ Tab Switching ═════════════════════════════════════════════════
document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
    tab.classList.add('active');
    $('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ══ Provider Card Click ═══════════════════════════════════════════
document.querySelectorAll('.provider-card').forEach(function(card) {
  card.addEventListener('click', function() {
    document.querySelectorAll('.provider-card').forEach(function(c) {
      c.classList.remove('selected');
    });
    card.classList.add('selected');
    currentProvider = card.dataset.provider;
    applyProvider(currentProvider, null);
  });
});

function applyProvider(provider, savedModel) {
  var preset = PROVIDERS[provider];
  if (!preset) return;

  // Base URL display
  if (provider === 'custom') {
    $('baseUrlDisplay').style.display = 'none';
    $('customUrlGroup').style.display = 'block';
  } else {
    $('baseUrlDisplay').style.display = 'flex';
    $('customUrlGroup').style.display = 'none';
    $('baseUrlText').textContent = preset.base;
  }

  // Model chips
  renderModelChips(preset.models, savedModel);
}

function renderModelChips(models, savedModel) {
  var container = $('modelChips');
  container.innerHTML = '';

  if (!models || models.length === 0) {
    container.innerHTML =
      '<input type="text" id="customModelInput" placeholder="Enter model name, e.g. gpt-4o" ' +
      'style="width:100%; border:1.5px solid #e0e4ed; border-radius:8px; padding:8px 11px; font-size:12.5px; outline:none">';
    if (savedModel) {
      var el = $('customModelInput');
      if (el) el.value = savedModel;
    }
    return;
  }

  models.forEach(function(m) {
    var chip = document.createElement('div');
    chip.className = 'model-chip';
    chip.dataset.modelId = m.id;
    chip.innerHTML = m.label +
      '<span class="chip-badge">' + m.tag + '</span>';

    var isSelected = savedModel
      ? m.id === savedModel
      : models.indexOf(m) === 0;

    if (isSelected) {
      chip.classList.add('selected');
      currentModel = m.id;
    }

    chip.addEventListener('click', function() {
      document.querySelectorAll('.model-chip').forEach(function(c) {
        c.classList.remove('selected');
      });
      chip.classList.add('selected');
      currentModel = m.id;
    });

    container.appendChild(chip);
  });

  // If no chip matched savedModel, select first
  if (!container.querySelector('.model-chip.selected') && models.length > 0) {
    container.querySelector('.model-chip').classList.add('selected');
    currentModel = models[0].id;
  }
}

function getSelectedModel() {
  var customInput = $('customModelInput');
  if (customInput) return customInput.value.trim();
  var selected = document.querySelector('.model-chip.selected');
  return selected ? selected.dataset.modelId : currentModel;
}

function getBaseUrl() {
  if (currentProvider === 'custom') {
    return ($('customApiBase').value || '').trim();
  }
  return PROVIDERS[currentProvider].base;
}

// ══ API Key Toggle ════════════════════════════════════════════════
$('toggleKey').addEventListener('click', function() {
  var inp = $('apiKey');
  if (inp.type === 'password') {
    inp.type = 'text';
    $('toggleKey').textContent = '🙈';
  } else {
    inp.type = 'password';
    $('toggleKey').textContent = '👁';
  }
});

$('apiKey').addEventListener('input', function() {
  updateKeyBadge($('apiKey').value.trim());
});

function updateKeyBadge(key) {
  var badge = $('keyBadge');
  if (key.length > 8) {
    badge.textContent = 'Set';
    badge.className = 'badge badge-ok';
  } else {
    badge.textContent = 'Not Set';
    badge.className = 'badge badge-warn';
  }
}

// ══ Test Connection ═══════════════════════════════════════════════
$('testBtn').addEventListener('click', function() {
  var key   = $('apiKey').value.trim();
  var base  = getBaseUrl();
  var model = getSelectedModel();

  if (!key)   { showStatus('API Key is required.', 'error'); return; }
  if (!base)  { showStatus('Base URL is required.', 'error'); return; }
  if (!model) { showStatus('Please select or enter a model.', 'error'); return; }

  $('testBtn').disabled = true;
  showStatus('Testing connection...', 'info');

  chrome.runtime.sendMessage(
    { action: 'testConnection', apiKey: key, apiBase: base, model: model },
    function(res) {
      $('testBtn').disabled = false;
      if (res && res.ok) {
        showStatus('Connection successful! Model is responding.', 'success');
      } else {
        showStatus('Failed: ' + (res ? res.error : 'No response from background.'), 'error');
      }
    }
  );
});

// ══ Save ══════════════════════════════════════════════════════════
$('saveBtn').addEventListener('click', function() {
  var key   = $('apiKey').value.trim();
  var base  = getBaseUrl();
  var model = getSelectedModel();

  if (!key)   { showStatus('API Key cannot be empty.', 'error'); return; }
  if (!base)  { showStatus('Base URL cannot be empty.', 'error'); return; }
  if (!model) { showStatus('Please select or enter a model.', 'error'); return; }

  chrome.storage.sync.set({
    apiKey:   key,
    apiBase:  base,
    model:    model,
    provider: currentProvider
  }, function() {
    showStatus('Settings saved successfully.', 'success');
    updateAbout(currentProvider, model, base);
  });
});

// ══ Advanced Tab ══════════════════════════════════════════════════
$('temperature').addEventListener('input', function() {
  $('tempVal').textContent = parseFloat($('temperature').value).toFixed(2);
});

$('saveAdvBtn').addEventListener('click', function() {
  chrome.storage.sync.set({
    temperature:  parseFloat($('temperature').value),
    maxTokens:    parseInt($('maxTokens').value),
    timeout:      parseInt($('timeout').value),
    customPrompt: $('customPrompt').value.trim()
  }, function() {
    showAdvStatus('Advanced settings saved.', 'success');
  });
});

$('resetAdvBtn').addEventListener('click', function() {
  $('temperature').value  = 0.05;
  $('tempVal').textContent = '0.05';
  $('maxTokens').value    = '4096';
  $('timeout').value      = '60';
  $('customPrompt').value = '';
  chrome.storage.sync.set({
    temperature: 0.05, maxTokens: 4096, timeout: 60, customPrompt: ''
  }, function() {
    showAdvStatus('Reset to defaults.', 'success');
  });
});

// ══ Status Helpers ════════════════════════════════════════════════
function showStatus(msg, type) {
  var bar = $('statusBar');
  bar.className = 'status-bar show ' + type;
  $('statusMsg').textContent = msg;
  if (type !== 'info') {
    setTimeout(function() { bar.classList.remove('show'); }, 4500);
  }
}

function showAdvStatus(msg, type) {
  var bar = $('advStatusBar');
  bar.className = 'status-bar show ' + type;
  $('advStatusMsg').textContent = msg;
  setTimeout(function() { bar.classList.remove('show'); }, 3000);
}

// ══ About Panel ═══════════════════════════════════════════════════
function updateAbout(provider, model, base) {
  $('about-provider').textContent = PROVIDERS[provider]
    ? PROVIDERS[provider].label : provider;
  $('about-model').textContent    = model || '—';
  $('about-base').textContent     = base  || '—';
  $('about-status').textContent   = 'Ready';
}

// ══ Load Saved Settings ═══════════════════════════════════════════
chrome.storage.sync.get({
  apiKey:       '',
  apiBase:      'https://opencode.ai/zen/go/v1',
  model:        'deepseek-v4-flash',
  provider:     'opencode',
  temperature:  0.05,
  maxTokens:    4096,
  timeout:      60,
  customPrompt: ''
}, function(d) {
  // Restore API key
  $('apiKey').value = d.apiKey;
  updateKeyBadge(d.apiKey);

  // Restore advanced
  $('temperature').value   = d.temperature;
  $('tempVal').textContent = parseFloat(d.temperature).toFixed(2);
  $('maxTokens').value     = String(d.maxTokens);
  $('timeout').value       = String(d.timeout);
  $('customPrompt').value  = d.customPrompt;

  // Restore provider card highlight
  currentProvider = d.provider || 'opencode';
  document.querySelectorAll('.provider-card').forEach(function(c) {
    c.classList.toggle('selected', c.dataset.provider === currentProvider);
  });

  // Restore custom URL if needed
  if (currentProvider === 'custom') {
    $('customApiBase').value = d.apiBase;
  }

  // Render provider + models
  applyProvider(currentProvider, d.model);

  // Update about tab
  updateAbout(currentProvider, d.model, d.apiBase);
});
