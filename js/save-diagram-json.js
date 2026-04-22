/**
 * save-diagram-json.js
 * =====================
 */

'use strict';

const SaveDiagramJson = (() => {

  function save() {
    const payload = BuildDiagramJson.build();
    if (!payload) return;

    const jsonText = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.DiagramName.replace(/\s+/g, '_')}_${payload.DiagramID.slice(-4)}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    console.log('[SaveJSON] Diagram exported to file.');
  }

  /**
   * attachListeners
   */
  function init() {
     const btn = document.getElementById('btn-save-json');
     if (btn) btn.addEventListener('click', save);
  }

  return { init, save };

})();
