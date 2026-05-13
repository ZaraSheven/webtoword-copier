// ── Message Router ────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

  // ── Test Connection ────────────────────────────────────────────
  if (msg.action === 'testConnection') {
    (async function() {
      try {
        var url = msg.apiBase.replace(/\/$/, '') + '/chat/completions';
        var res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + msg.apiKey,
            'Accept':        'application/json'
          },
          body: JSON.stringify({
            model:      msg.model,
            max_tokens: 8,
            stream:     false,
            messages:   [{ role: 'user', content: 'Hi' }]
          })
        });
        if (res.ok) {
          sendResponse({ ok: true });
        } else {
          var t = await res.text();
          sendResponse({ ok: false, error: 'HTTP ' + res.status + ': ' + t.slice(0, 120) });
        }
      } catch(e) {
        sendResponse({ ok: false, error: e.message });
      }
    })();
    return true;
  }

  // ── Process HTML ───────────────────────────────────────────────
  if (msg.action === 'processHtml') {
    (async function() {
      try {
        var stored = await chrome.storage.sync.get({
          apiKey:       '',
          apiBase:      'https://opencode.ai/zen/go/v1',
          model:        'deepseek-v4-flash',
          temperature:  0.05,
          maxTokens:    4096,
          timeout:      60,
          customPrompt: ''
        });

        if (!stored.apiKey) {
          sendResponse({ error: 'Please set your API Key in the extension popup first.' });
          return;
        }

        var wordHtml = await callLLM(
          stored.apiKey,
          stored.apiBase,
          stored.model,
          stored.temperature,
          stored.maxTokens,
          stored.customPrompt,
          msg.html
        );

        var plainText = wordHtml
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        sendResponse({ wordHtml: wordHtml, plainText: plainText });

      } catch(e) {
        sendResponse({ error: e.message });
      }
    })();
    return true;
  }

  return false;
});


// ── LLM Call ──────────────────────────────────────────────────────
async function callLLM(apiKey, apiBase, model, temperature, maxTokens, customPrompt, rawHtml) {
  var systemPrompt = (customPrompt && customPrompt.trim())
    ? customPrompt.trim()
    : buildSystemPrompt();

  var url = apiBase.replace(/\/$/, '') + '/chat/completions';

  var res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + apiKey,
      'Accept':        'application/json'
    },
    body: JSON.stringify({
      model:       model,
      temperature: temperature,
      max_tokens:  maxTokens,
      stream:      false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: 'Please convert the following HTML:\n\n' + rawHtml }
      ]
    })
  });

  if (!res.ok) {
    var errText = await res.text();
    throw new Error('API Error ' + res.status + ': ' + errText);
  }

  var data = await res.json();
  var content = data.choices[0].message.content.trim();

  // 清理模型可能包裹的 markdown 代码块
  content = content.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '');
  return content;
}


// ── System Prompt ─────────────────────────────────────────────────
function buildSystemPrompt() {
  return [
    'You are a professional HTML-to-Word paste format conversion engine.',
    '',
    'OUTPUT REQUIREMENT:',
    'Output a valid HTML string that can be written directly to the system clipboard as text/html.',
    'When pasted into Microsoft Word, all formatting must render perfectly.',
    '',
    '## TEXT AND PARAGRAPHS',
    '<p style="font-family:\'Times New Roman\',serif; font-size:12pt; line-height:1.5; margin-bottom:6pt">',
    '',
    '## HEADINGS',
    '<h1 style="font-family:\'Times New Roman\',serif; font-size:18pt; font-weight:bold; margin-bottom:8pt">',
    '<h2 style="font-family:\'Times New Roman\',serif; font-size:15pt; font-weight:bold; margin-bottom:6pt">',
    '<h3 style="font-family:\'Times New Roman\',serif; font-size:13pt; font-weight:bold; margin-bottom:4pt">',
    '',
    '## CODE BLOCKS',
    '<pre style="font-family:Consolas,\'Courier New\',monospace; font-size:10pt; background-color:#f6f8fa; border:1px solid #d0d7de; padding:10pt; line-height:1.4; white-space:pre-wrap; margin:8pt 0">',
    'Use <span style="color:#specific-color"> for syntax highlighting (VS Code Dark+ theme colors).',
    '',
    '## INLINE CODE',
    '<code style="font-family:Consolas,\'Courier New\',monospace; font-size:10pt; background:#f0f0f0; padding:1px 4px; border-radius:3px">',
    '',
    '## TABLES',
    '<table style="border-collapse:collapse; width:100%; margin:8pt 0">',
    '<th style="border:1px solid #ccc; padding:5pt 8pt; background:#f0f0f0; font-weight:bold">',
    '<td style="border:1px solid #ccc; padding:5pt 8pt">',
    '',
    '## MATH FORMULAS (CRITICAL)',
    'NEVER convert formulas to images or URLs.',
    'ALL math formulas (both inline $...$ and block $$...$$) MUST be converted to OMML',
    '(Office Math Markup Language). Word will recognize and render them as native editable',
    'formulas when pasted.',
    '',
    'Inline formula wrapper:',
    '<span style="mso-element:formula">',
    '  <m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">',
    '    <!-- OMML content -->',
    '  </m:oMath>',
    '</span>',
    '',
    'Block formula wrapper:',
    '<p style="text-align:center; margin:8pt 0">',
    '  <m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">',
    '    <m:oMath>',
    '      <!-- OMML content -->',
    '    </m:oMath>',
    '  </m:oMathPara>',
    '</p>',
    '',
    'OMML element reference:',
    '- Fraction:    <m:f><m:num>numerator</m:num><m:den>denominator</m:den></m:f>',
    '- Superscript: <m:sSup><m:e>base</m:e><m:sup>exp</m:sup></m:sSup>',
    '- Subscript:   <m:sSub><m:e>base</m:e><m:sub>sub</m:sub></m:sSub>',
    '- Square root: <m:rad><m:deg/><m:e>content</m:e></m:rad>',
    '- Summation:   <m:nary><m:naryPr><m:chr m:val="sum"/></m:naryPr><m:sub>lower</m:sub><m:sup>upper</m:sup><m:e>expr</m:e></m:nary>',
    '- Plain text:  <m:r><m:t>text</m:t></m:r>',
    '- Italic var:  <m:r><m:rPr><m:sty m:val="i"/></m:rPr><m:t>x</m:t></m:r>',
    '',
    'Example — convert $E = mc^2$:',
    '<span style="mso-element:formula">',
    '  <m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">',
    '    <m:r><m:rPr><m:sty m:val="i"/></m:rPr><m:t>E</m:t></m:r>',
    '    <m:r><m:t>=</m:t></m:r>',
    '    <m:r><m:rPr><m:sty m:val="i"/></m:rPr><m:t>m</m:t></m:r>',
    '    <m:sSup>',
    '      <m:e><m:r><m:rPr><m:sty m:val="i"/></m:rPr><m:t>c</m:t></m:r></m:e>',
    '      <m:sup><m:r><m:t>2</m:t></m:r></m:sup>',
    '    </m:sSup>',
    '  </m:oMath>',
    '</span>',
    '',
    '## LISTS',
    '<ul style="margin:4pt 0 4pt 20pt; padding:0">',
    '  <li style="font-size:12pt; line-height:1.5; margin-bottom:3pt">',
    '<ol style="margin:4pt 0 4pt 20pt; padding:0">',
    '  <li style="font-size:12pt; line-height:1.5; margin-bottom:3pt">',
    '',
    '## IMAGES',
    'Keep <img> tags, add style="max-width:100%; display:block; margin:8pt auto"',
    '',
    '## CLEANUP RULES',
    '- Remove all <script>, <style>, <nav>, <header>, <footer>, <iframe>, <noscript> tags',
    '- Remove all class and id attributes',
    '- All styles must be inline; no external or embedded CSS',
    '',
    '## OUTPUT FORMAT',
    'Output the HTML content directly.',
    'Do NOT wrap in markdown code blocks. No explanations.'
  ].join('\n');
}
