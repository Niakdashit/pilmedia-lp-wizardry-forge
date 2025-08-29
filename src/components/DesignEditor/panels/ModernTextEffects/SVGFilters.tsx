import React from 'react';

const SVGFilters: React.FC = () => {
  return (
    <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Wave distortion filter */}
        <filter id="wave-svg-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="10">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" result="turbulence"/>
          </feDisplacementMap>
        </filter>

        {/* Ripple distortion filter */}
        <filter id="ripple-svg-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="ripple" scale="8">
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="ripple"/>
          </feDisplacementMap>
        </filter>

        {/* Glow filter */}
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Drop shadow filter */}
        <filter id="drop-shadow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>

        {/* Bevel filter */}
        <filter id="bevel-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feSpecularLighting result="specOut" in="blur" specularConstant="1.5" specularExponent="20" lighting-color="#bbbbbb">
            <fePointLight x="-5000" y="-10000" z="20000"/>
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
        </filter>

        {/* Emboss filter */}
        <filter id="emboss-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feConvolveMatrix order="3" kernelMatrix="1 1 0 1 0.7 -1 0 -1 -1"/>
        </filter>

        {/* Chrome effect gradients */}
        <linearGradient id="chrome-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#eee', stopOpacity:1}} />
          <stop offset="25%" style={{stopColor:'#ccc', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#fff', stopOpacity:1}} />
          <stop offset="75%" style={{stopColor:'#ddd', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#bbb', stopOpacity:1}} />
        </linearGradient>

        {/* Gold gradient */}
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#b8860b', stopOpacity:1}} />
          <stop offset="25%" style={{stopColor:'#ffd700', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#ffff00', stopOpacity:1}} />
          <stop offset="75%" style={{stopColor:'#ffd700', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#b8860b', stopOpacity:1}} />
        </linearGradient>

        {/* Holographic gradient */}
        <linearGradient id="holographic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#ff0080', stopOpacity:1}} />
          <stop offset="25%" style={{stopColor:'#ff8c00', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#40e0d0', stopOpacity:1}} />
          <stop offset="75%" style={{stopColor:'#ff0080', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#8a2be2', stopOpacity:1}} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SVGFilters;