/**
 * render-connections.js
 * =====================
 * Responsible for rendering all connections in the diagram.
 */
'use strict';

const RenderConnections = (() => {

  const NS = 'http://www.w3.org/2000/svg';

  function render(svgLayer, canvasData, zoom, width, height) {
    if (!canvasData || !canvasData.Connections) return;

    const shapes = canvasData.Shapes || [];

    canvasData.Connections.forEach(conn => {
      const sourceShape = shapes.find(s => s.ShapeID === conn.SourceItemID);
      const destShape = shapes.find(s => s.ShapeID === conn.DestinationItemID);

      if (!sourceShape || !destShape) return;

      const config = typeof GlobalConnectionDefaults !== 'undefined'
        ? GlobalConnectionDefaults.getDefaults(conn.ConnectionType)
        : { DefaultLineColor: '#6366f1', DefaultLineWidth: 2, DefaultLineType: 'solid', DrawArrows: true };

      // Override with specifics if they exist
      const details = conn.Detail || {};
      const strokeColor = details.LineColor || config.DefaultLineColor || '#6366f1';
      const lineWidth = (details.LineWidth || config.DefaultLineWidth || 2) * zoom;
      const lineType = details.LineType || config.DefaultLineType || 'solid';
      const drawArrows = details.IsDirectional !== undefined ? details.IsDirectional : true;

      let pathPoints = [];
      if (typeof ConnectionShortestPath !== 'undefined') {
        pathPoints = ConnectionShortestPath.computePath(sourceShape, destShape, config);
      } else {
        // Fallback
        pathPoints = [
          { x: sourceShape.WorldX, y: sourceShape.WorldY },
          { x: destShape.WorldX, y: destShape.WorldY }
        ];
      }

      if (pathPoints.length < 2) return;

      // Map to screen coordinates using WorldToScreen transformation
      const screenPoints = pathPoints.map(p => {
        if (typeof WorldToScreen !== 'undefined' && width && height) {
          return WorldToScreen.convert(p.x, p.y, width, height);
        }
        return { x: p.x * zoom, y: p.y * zoom };
      });

      // Build SVG Path Data
      let d = `M ${screenPoints[0].x} ${screenPoints[0].y}`;
      for (let i = 1; i < screenPoints.length; i++) {
        d += ` L ${screenPoints[i].x} ${screenPoints[i].y}`;
      }

      const pathGroup = document.createElementNS(NS, 'g');
      pathGroup.setAttribute('class', 'diagram-connection');
      pathGroup.dataset.connectionId = conn.ConnectionID;

      // Main line
      const pathLine = document.createElementNS(NS, 'path');
      pathLine.setAttribute('d', d);
      pathLine.setAttribute('stroke', strokeColor);
      pathLine.setAttribute('stroke-width', lineWidth);
      pathLine.setAttribute('fill', 'none');

      if (lineType === 'dashed') {
        pathLine.setAttribute('stroke-dasharray', `${6 * zoom},${4 * zoom}`);
      } else if (lineType === 'dotted') {
        pathLine.setAttribute('stroke-dasharray', `${2 * zoom},${4 * zoom}`);
        pathLine.setAttribute('stroke-linecap', 'round');
      }

      pathGroup.appendChild(pathLine);

      // Arrowhead
      if (drawArrows) {
        const lastP = screenPoints[screenPoints.length - 1];
        const prevP = screenPoints[screenPoints.length - 2];
        const angle = Math.atan2(lastP.y - prevP.y, lastP.x - prevP.x);
        
        const arrowSize = 10 * zoom;
        const arrowP1 = {
          x: lastP.x - arrowSize * Math.cos(angle - Math.PI / 6),
          y: lastP.y - arrowSize * Math.sin(angle - Math.PI / 6)
        };
        const arrowP2 = {
          x: lastP.x - arrowSize * Math.cos(angle + Math.PI / 6),
          y: lastP.y - arrowSize * Math.sin(angle + Math.PI / 6)
        };

        const arrowPath = document.createElementNS(NS, 'polygon');
        arrowPath.setAttribute('points', `${lastP.x},${lastP.y} ${arrowP1.x},${arrowP1.y} ${arrowP2.x},${arrowP2.y}`);
        arrowPath.setAttribute('fill', strokeColor);
        pathGroup.appendChild(arrowPath);
      }

      svgLayer.appendChild(pathGroup);
    });
  }

  return { render };

})();
