/**
 * build-diagram-json.js
 * =====================
 */

'use strict';

const BuildDiagramJson = (() => {

  function build() {
    const diagram = CanvasState.getActiveDiagram();
    if (!diagram) return null;

    // Deep clone to avoid side effects
    const payload = JSON.parse(JSON.stringify(diagram));
    
    // Add export metadata
    payload.ExportedAt = new Date().toISOString();
    payload.EngineVersion = '2.0.0';

    return payload;
  }

  return { build };

})();
