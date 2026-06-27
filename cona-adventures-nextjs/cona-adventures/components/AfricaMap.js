// components/AfricaMap.js
// D3-powered SVG map. Loads TopoJSON from CDN via useEffect (client only).
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const CONGO_ID  = 180; // DR Congo ISO numeric
const NAMIBIA_ID = 516;

export default function AfricaMap({ onCountrySelect }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const { t } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !svgRef.current) return;

    let cancelled = false;

    async function init() {
      // Dynamically import d3 and topojson (browser-only)
      const [d3, topojson] = await Promise.all([
        import('d3'),
        import('topojson-client'),
      ]);

      if (cancelled) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width  = 520;
      const height = 580;

      const projection = d3.geoMercator()
        .center([20, 0])
        .scale(420)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      let world;
      try {
        world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      } catch {
        // Fallback: render placeholder text
        svg.append('text')
          .attr('x', width / 2).attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--muted)')
          .attr('font-size', '14px')
          .text('Map unavailable offline');
        return;
      }

      if (cancelled) return;

      const countries = topojson.feature(world, world.objects.countries);

      // Africa bounding box filter (rough lat/lon)
      const africaFeatures = countries.features.filter((f) => {
        try {
          const [cx, cy] = d3.geoCentroid(f);
          return cx > -20 && cx < 55 && cy > -35 && cy < 38;
        } catch {
          return false;
        }
      });

      const highlights = {
        [CONGO_ID]:   { label: '🌿 DR Congo',  color: '#2C7A70', hover: '#3a9a90' },
        [NAMIBIA_ID]: { label: '🏜 Namibia',   color: '#C0532F', hover: '#e06040' },
      };

      svg.selectAll('path')
        .data(africaFeatures)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d) => highlights[d.id]?.color ?? '#1a2a1e')
        .attr('stroke', '#2a3f2e')
        .attr('stroke-width', 0.5)
        .style('cursor', (d) => highlights[d.id] ? 'pointer' : 'default')
        .on('mouseover', function (event, d) {
          const info = highlights[d.id];
          if (!info) return;
          d3.select(this).attr('fill', info.hover);
          const tooltip = tooltipRef.current;
          if (tooltip) {
            tooltip.textContent = info.label;
            tooltip.style.opacity = '1';
            tooltip.style.left = `${event.offsetX + 12}px`;
            tooltip.style.top  = `${event.offsetY - 10}px`;
          }
        })
        .on('mousemove', function (event) {
          const tooltip = tooltipRef.current;
          if (tooltip && tooltip.style.opacity === '1') {
            tooltip.style.left = `${event.offsetX + 12}px`;
            tooltip.style.top  = `${event.offsetY - 10}px`;
          }
        })
        .on('mouseout', function (event, d) {
          const info = highlights[d.id];
          if (!info) return;
          d3.select(this).attr('fill', info.color);
          const tooltip = tooltipRef.current;
          if (tooltip) tooltip.style.opacity = '0';
        })
        .on('click', (event, d) => {
          if (d.id === CONGO_ID)   onCountrySelect?.('congo');
          if (d.id === NAMIBIA_ID) onCountrySelect?.('namibia');
        });
    }

    init();
    return () => { cancelled = true; };
  }, [mounted, onCountrySelect]);

  return (
    <div style={{ marginTop: 40 }}>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: '0.75rem',
          marginBottom: 8,
          letterSpacing: '0.1em',
          fontFamily: "'Cinzel', serif",
        }}
      >
        {t('clickCountry')}
      </p>
      <div className="africa-map-wrap">
        <svg id="africa-svg" ref={svgRef} viewBox="0 0 520 580" />
        <div ref={tooltipRef} className="map-tooltip" />
      </div>
      <div className="map-cta-row">
        <button className="map-btn-congo"   onClick={() => onCountrySelect?.('congo')}>🌿 DR CONGO</button>
        <button className="map-btn-both"    onClick={() => onCountrySelect?.('both')}>✦ {t('bothCountries')}</button>
        <button className="map-btn-namibia" onClick={() => onCountrySelect?.('namibia')}>🏜 NAMIBIA</button>
      </div>
    </div>
  );
}
