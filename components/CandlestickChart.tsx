'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Candle, Pattern, detectPatterns, filterPatterns } from '@/lib/CandlestickPatterns';

interface CandlestickChartProps {
  data: Candle[];
  symbol?: string;
}

const PATTERN_TYPES = ['Doji', 'Hammer', 'Shooting Star', 'Engulfing'];

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, symbol = 'AAPL' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [hoveredPattern, setHoveredPattern] = useState<Pattern | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Detect patterns when data changes
  useEffect(() => {
    const detected = detectPatterns(data);
    setPatterns(detected);
  }, [data]);

  // Draw chart with pattern highlighting
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const filteredPatterns = filterPatterns(patterns, selectedPatterns);
    const patternIndices = new Set(filteredPatterns.map(p => p.index));

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 900;
    const height = 500;
    const margin = { top: 30, right: 50, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous drawing
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate visible data range based on zoom
    const visibleStart = Math.max(0, Math.floor(data.length * (1 - zoomLevel)));
    const visibleData = data.slice(visibleStart);
    const visibleIndices = visibleData.map((_, idx) => visibleStart + idx);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, visibleData.length - 1])
      .range([0, innerWidth]);

    const yMin = d3.min(visibleData, d => d.low) || 0;
    const yMax = d3.max(visibleData, d => d.high) || 100;
    const yScale = d3.scaleLinear()
      .domain([yMin - (yMax - yMin) * 0.05, yMax + (yMax - yMin) * 0.05])
      .range([innerHeight, 0]);

    // Draw candlesticks
    const candleWidth = Math.min(zoomLevel === 1 ? 15 : 8, innerWidth / visibleData.length * 0.7);
    
    visibleData.forEach((candle, idx) => {
      const originalIdx = visibleIndices[idx];
      const x = xScale(idx) - candleWidth / 2;
      const isBullish = candle.close > candle.open;
      const isHighlighted = patternIndices.has(originalIdx);
      
      const color = isBullish ? '#26a69a' : '#ef5350';
      const highlightColor = isBullish ? '#4caf50' : '#ff6b6b';
      
      const patternAtCandle = patterns.find(p => p.index === originalIdx);
      
      // Group for each candle to handle hover
      const candleGroup = svg.append('g')
        .attr('class', 'candle-group')
        .style('cursor', patternAtCandle ? 'pointer' : 'default');
      
      // Wick (high-low line)
      candleGroup.append('line')
        .attr('x1', xScale(idx))
        .attr('x2', xScale(idx))
        .attr('y1', yScale(candle.high))
        .attr('y2', yScale(candle.low))
        .attr('stroke', isHighlighted ? highlightColor : color)
        .attr('stroke-width', isHighlighted ? 2 : 1);
      
      // Body (open-close rectangle)
      candleGroup.append('rect')
        .attr('x', x)
        .attr('y', yScale(Math.max(candle.open, candle.close)))
        .attr('width', candleWidth)
        .attr('height', Math.max(1, Math.abs(yScale(candle.open) - yScale(candle.close))))
        .attr('fill', isHighlighted ? highlightColor : color)
        .attr('stroke', isHighlighted ? highlightColor : color)
        .attr('stroke-width', isHighlighted ? 2 : 0.5)
        .attr('opacity', isHighlighted ? 1 : 0.8);
      
      // Add hover effect only if there's a pattern
      if (patternAtCandle) {
        candleGroup
          .on('mouseenter', (event) => {
            setHoveredPattern(patternAtCandle);
            const mouseEvent = event as unknown as MouseEvent;
            setMousePosition({ x: mouseEvent.pageX, y: mouseEvent.pageY });
            if (tooltipRef.current) {
              tooltipRef.current.style.display = 'block';
              tooltipRef.current.style.left = `${mouseEvent.pageX + 15}px`;
              tooltipRef.current.style.top = `${mouseEvent.pageY - 40}px`;
            }
          })
          .on('mousemove', (event) => {
            const mouseEvent = event as unknown as MouseEvent;
            if (tooltipRef.current && tooltipRef.current.style.display === 'block') {
              tooltipRef.current.style.left = `${mouseEvent.pageX + 15}px`;
              tooltipRef.current.style.top = `${mouseEvent.pageY - 40}px`;
            }
          })
          .on('mouseleave', () => {
            setHoveredPattern(null);
            if (tooltipRef.current) {
              tooltipRef.current.style.display = 'none';
            }
          });
      }
    });

    // Add axes with dark theme styling
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(10, visibleData.length));
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('color', '#9CA3AF')
      .style('font-size', '12px');

    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
      .call(yAxis)
      .style('color', '#9CA3AF')
      .style('font-size', '12px');

    // Add labels with dark theme
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text('Candle Index');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text('Price ($)');

    // Add title
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5E7EB')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(`${symbol} - Candlestick Chart with Pattern Recognition`);

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .style('color', '#374151')
      .style('stroke-dasharray', '3,3');

  }, [data, patterns, selectedPatterns, zoomLevel, symbol]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      {/* Pattern Filter Controls */}
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <span className="font-semibold text-gray-300 mr-2">🔍 Filter Patterns:</span>
        {PATTERN_TYPES.map(pattern => (
          <button
            key={pattern}
            onClick={() => {
              setSelectedPatterns(prev =>
                prev.includes(pattern)
                  ? prev.filter(p => p !== pattern)
                  : [...prev, pattern]
              );
            }}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
              selectedPatterns.includes(pattern)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {pattern}
          </button>
        ))}
        {selectedPatterns.length > 0 && (
          <button
            onClick={() => setSelectedPatterns([])}
            className="px-3 py-1 rounded-full text-sm bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
          >
            Clear Filters
          </button>
        )}
        
        {/* Zoom Controls */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.2))}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
          >
            Zoom Out
          </button>
          <button
            onClick={() => setZoomLevel(Math.min(1, zoomLevel + 0.2))}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* Pattern Summary */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
        <h3 className="font-semibold text-gray-200 mb-2">
          📊 Detected Patterns ({patterns.length})
          {selectedPatterns.length > 0 && ` - Filtered: ${selectedPatterns.join(', ')}`}
        </h3>
        <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
          {patterns.map((pattern, idx) => {
            const isFiltered = selectedPatterns.length === 0 || selectedPatterns.includes(pattern.type);
            if (!isFiltered) return null;
            
            return (
              <span
                key={idx}
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-all duration-200 ${
                  pattern.direction === 'bullish' ? 'bg-green-900/50 text-green-300' :
                  pattern.direction === 'bearish' ? 'bg-red-900/50 text-red-300' :
                  'bg-yellow-900/50 text-yellow-300'
                } hover:opacity-80 hover:scale-105`}
                onMouseEnter={() => {
                  setHoveredPattern(pattern);
                  if (tooltipRef.current) {
                    tooltipRef.current.style.display = 'block';
                  }
                }}
                onMouseMove={(e) => {
                  if (tooltipRef.current) {
                    tooltipRef.current.style.left = `${e.pageX + 15}px`;
                    tooltipRef.current.style.top = `${e.pageY - 40}px`;
                  }
                }}
                onMouseLeave={() => {
                  setHoveredPattern(null);
                  if (tooltipRef.current) {
                    tooltipRef.current.style.display = 'none';
                  }
                }}
              >
                {pattern.type} #{pattern.index + 1}
                {pattern.direction && (
                  <span className="ml-1">
                    {pattern.direction === 'bullish' ? '🟢' : pattern.direction === 'bearish' ? '🔴' : '⚪'}
                  </span>
                )}
              </span>
            );
          })}
          {patterns.length === 0 && (
            <span className="text-gray-500 text-sm">No patterns detected yet</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg ref={svgRef} className="bg-gray-900 rounded-lg w-full"></svg>
        
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="fixed hidden bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 z-50 pointer-events-none"
          style={{ maxWidth: '300px' }}
        >
          {hoveredPattern && (
            <>
              <div className="font-bold text-lg mb-1">
                {hoveredPattern.type}
                {hoveredPattern.direction === 'bullish' && ' 🟢'}
                {hoveredPattern.direction === 'bearish' && ' 🔴'}
              </div>
              <div className="text-sm text-gray-300 mb-2">{hoveredPattern.description}</div>
              <div className="text-xs text-gray-500">Candle #{hoveredPattern.index + 1}</div>
              <div className="text-xs text-gray-500 mt-1">
                {hoveredPattern.direction === 'bullish' ? '📈 Bullish Signal' : 
                 hoveredPattern.direction === 'bearish' ? '📉 Bearish Signal' : 
                 '⚖️ Neutral Signal'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Bullish Candle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Bearish Candle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-green-400 bg-green-400 opacity-60 rounded"></div>
          <span>Pattern Highlight (Bullish)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-red-400 bg-red-400 opacity-60 rounded"></div>
          <span>Pattern Highlight (Bearish)</span>
        </div>
      </div>
    </div>
  );
};