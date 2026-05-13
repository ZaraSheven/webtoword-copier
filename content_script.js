// ---- 状态 -------------------------------------------------------
let tooltip  = null;
let toast    = null;
let lastRange = null;

// ---- Toast ------------------------------------------------------
function initToast() {
  if (document.getElementById('w2w-toast')) return;
  toast = document.createElement('div');
  toast.id = 'w2w-toast';
  document.body.appendChild(toast);
}

function showToast(msg, duration) {
  duration = duration || 2800;
  if (!toast) initToast();
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, duration);
}

// ---- 悬浮按钮 ---------------------------------------------------
function createTooltip() {
  if (tooltip) tooltip.remove();
  tooltip = document.createElement('div');
  tooltip.id = 'w2w-tooltip';
  tooltip.innerHTML = '<span class="w2w-icon">W</span> Copy format to Word';
  document.body.appendChild(tooltip);
  tooltip.addEventListener('mousedown', handleCopy);
  return tooltip;
}

function positionTooltip(x, y) {
  if (!tooltip) return;
  var tw = tooltip.offsetWidth || 220;
  var th = tooltip.offsetHeight || 34;
  var vw = window.innerWidth;
  var left = x - tw / 2;
  var top  = y - th - 10;
  if (left < 8) left = 8;
  if (left + tw > vw - 8) left = vw - tw - 8;
  if (top < 8) {
    top = window.scrollY + y + 18;
  } else {
    top = top + window.scrollY;
  }
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

function removeTooltip() {
  if (tooltip) { tooltip.remove(); tooltip = null; }
}

// ---- 选区监听 ---------------------------------------------------
document.addEventListener('mouseup', function(e) {
  if (tooltip && tooltip.contains(e.target)) return;
  setTimeout(function() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
      removeTooltip();
      return;
    }
    lastRange = sel.getRangeAt(0).cloneRange();
    createTooltip();
    positionTooltip(e.clientX, e.clientY);
  }, 10);
});

document.addEventListener('mousedown', function(e) {
  if (tooltip && !tooltip.contains(e.target)) removeTooltip();
});

// ---- 提取选区 HTML ----------------------------------------------
function extractSelectionHtml() {
  if (!lastRange) return '';
  var fragment = lastRange.cloneContents();
  var wrapper  = document.createElement('div');
  wrapper.appendChild(fragment);
  inlineComputedStyles(wrapper);
  return wrapper.innerHTML;
}

function inlineComputedStyles(root) {
  var KEEP = [
    'font-size', 'font-weight', 'font-style', 'font-family',
    'color', 'background-color',
    'line-height', 'margin-top', 'margin-bottom',
    'padding', 'border', 'border-collapse',
    'text-align', 'vertical-align',
    'white-space', 'text-decoration'
  ];
  var elements = root.querySelectorAll('*');
  elements.forEach(function(el) {
    try {
      var cs = window.getComputedStyle(el);
      var style = '';
      KEEP.forEach(function(prop) {
        var val = cs.getPropertyValue(prop);
        if (val &&
            val !== 'normal' &&
            val !== 'none' &&
            val !== 'auto' &&
            val !== 'rgba(0, 0, 0, 0)' &&
            val !== 'transparent') {
          style += prop + ':' + val + ';';
        }
      });
      if (style) el.setAttribute('style', style);
      el.removeAttribute('class');
      el.removeAttribute('id');
    } catch(e) {}
  });
}

// ---- 核心：点击处理 ---------------------------------------------
function handleCopy(e) {
  e.preventDefault();
  e.stopPropagation();

  var rawHtml = extractSelectionHtml();
  if (!rawHtml.trim()) {
    showToast('No content selected.');
    return;
  }

  tooltip.classList.add('loading');
  tooltip.innerHTML = '<span class="w2w-spinner"></span> Converting...';

  chrome.runtime.sendMessage(
    { action: 'processHtml', html: rawHtml },
    function(result) {
      if (chrome.runtime.lastError) {
        showToast('Error: ' + chrome.runtime.lastError.message);
        removeTooltip();
        return;
      }
      if (result.error) {
        showToast('Error: ' + result.error);
        removeTooltip();
        return;
      }
      writeToClipboard(result.wordHtml, result.plainText)
        .then(function() {
          showToast('Copied! Press Ctrl+V in Word to paste.');
        })
        .catch(function(err) {
          showToast('Clipboard error: ' + err.message);
        })
        .finally(function() {
          removeTooltip();
        });
    }
  );
}

// ---- 写入剪贴板 -------------------------------------------------
function writeToClipboard(htmlContent, plainText) {
  var htmlBlob = new Blob([htmlContent], { type: 'text/html' });
  var textBlob = new Blob([plainText],   { type: 'text/plain' });
  return navigator.clipboard.write([
    new ClipboardItem({
      'text/html':  htmlBlob,
      'text/plain': textBlob
    })
  ]);
}
