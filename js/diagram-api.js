/**
 * diagram-api.js
 * ==============
 * Handles HTTP communication with the ASP.NET Core backend.
 */

'use strict';

const DiagramApi = (() => {

  const BASE_URL = '/api/DiagramCanvas';

  async function saveDiagram(dto) {
    try {
      const response = await fetch(`${BASE_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dto)
      });

      if (!response.ok) throw new Error('Failed to save diagram to DB.');
      
      const result = await response.json();
      console.log('[DiagramApi] Save successful:', result);
      return result;

    } catch (err) {
      console.error('[DiagramApi] Save error:', err);
      return null;
    }
  }

  async function loadDiagram(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to load diagram from DB.');
      
      return await response.json();

    } catch (err) {
      console.error('[DiagramApi] Load error:', err);
      return null;
    }
  }

  async function listDiagrams() {
    try {
      const response = await fetch(`${BASE_URL}/list`);
      if (!response.ok) throw new Error('Failed to list diagrams.');
      
      return await response.json();

    } catch (err) {
      console.error('[DiagramApi] List error:', err);
      return [];
    }
  }

  return { saveDiagram, loadDiagram, listDiagrams };

})();
