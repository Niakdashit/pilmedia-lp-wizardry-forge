import React, { useEffect } from 'react';
import SVGFilters from './SVGFilters';

const SVGFiltersProvider: React.FC = () => {
  useEffect(() => {
    // Inject SVG filters into DOM
    const svgContainer = document.getElementById('svg-filters-container');
    if (!svgContainer) {
      const container = document.createElement('div');
      container.id = 'svg-filters-container';
      container.style.position = 'absolute';
      container.style.width = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }
  }, []);

  return <SVGFilters />;
};

export default SVGFiltersProvider;