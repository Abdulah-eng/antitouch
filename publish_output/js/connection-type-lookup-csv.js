/**
 * connection-type-lookup-csv.js
 * =============================
 * Fetches and parses the CSV rules for possible connections between shape types.
 */
'use strict';

const ConnectionTypeLookupCsv = (() => {

  let _lookupRules = [];
  let _isLoaded = false;

  async function load() {
    if (_isLoaded) return;
    try {
      const v = new Date().getTime(); // Cache buster
      const response = await fetch(`data/connection_type_lookup.csv?v=${v}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const csvText = await response.text();
      _parseCsv(csvText);
      _isLoaded = true;
      console.log('[ConnectionLookup] CSV rules loaded. Count:', _lookupRules.length);
    } catch (err) {
      console.warn('[ConnectionLookup] Failed to load CSV. Falling back to DB...', err);
      // DB Fallback handled in the controller wrapper
    }
  }

  function _normalize(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[\s-]/g, '');
  }

  function _parseCsv(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // SourceDeviceType,DestinationDeviceType,PossibleConnections
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;
      
      _lookupRules.push({
        sourceDeviceType: _normalize(parts[0]),
        destinationDeviceType: _normalize(parts[1]),
        possibleConnections: parts[2].split(' OR ').map(c => c.trim())
      });
    }
  }

  function getPossibleConnections(sourceLabel, destLabel) {
    const normSrc = _normalize(sourceLabel);
    const normDst = _normalize(destLabel);

    // Attempt direct match
    const rule = _lookupRules.find(r => 
      r.sourceDeviceType === normSrc && 
      r.destinationDeviceType === normDst
    );

    if (rule) return rule.possibleConnections;

    // Bidirectional fallback?
    const revRule = _lookupRules.find(r => 
      r.sourceDeviceType === normDst && 
      r.destinationDeviceType === normSrc
    );

    if (revRule) return revRule.possibleConnections;

    return null; // Signals fallback to DB
  }

  return { load, getPossibleConnections };
})();
