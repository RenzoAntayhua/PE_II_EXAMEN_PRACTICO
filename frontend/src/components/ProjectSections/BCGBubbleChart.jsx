import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import * as d3 from 'd3';

const BCGBubbleChart = ({ bcgData }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!bcgData.bcgTable.products.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar el SVG

    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    // Configurar el SVG
    svg
      .attr("width", width)
      .attr("height", height);

    // Crear escalas
    const xScale = d3.scaleLinear()
      .domain([0, 2.5]) // PRM range
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(20, d3.max(bcgData.bcgTable.products, d => d.tcm) + 5)]) // TCM range
      .range([height - margin.bottom, margin.top]);

    // Escala para el tamaño de las burbujas basada en el porcentaje de ventas
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(bcgData.bcgTable.products, d => d.salesPercentage)])
      .range([5, 30]);

    // Dibujar líneas divisorias
    // Línea vertical en PRM = 1
    svg.append("line")
      .attr("x1", xScale(1))
      .attr("x2", xScale(1))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Línea horizontal en TCM = 10
    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(10))
      .attr("y2", yScale(10))
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Añadir cuadrantes con colores de fondo
    const quadrants = [
      { x: margin.left, y: margin.top, width: xScale(1) - margin.left, height: yScale(10) - margin.top, color: "#fff3cd", label: "❓", name: "Interrogación" },
      { x: xScale(1), y: margin.top, width: width - margin.right - xScale(1), height: yScale(10) - margin.top, color: "#d1ecf1", label: "⭐", name: "Estrella" },
      { x: margin.left, y: yScale(10), width: xScale(1) - margin.left, height: height - margin.bottom - yScale(10), color: "#f8d7da", label: "🐕", name: "Perro" },
      { x: xScale(1), y: yScale(10), width: width - margin.right - xScale(1), height: height - margin.bottom - yScale(10), color: "#d4edda", label: "🐄", name: "Vaca" }
    ];

    quadrants.forEach(quad => {
      svg.append("rect")
        .attr("x", quad.x)
        .attr("y", quad.y)
        .attr("width", quad.width)
        .attr("height", quad.height)
        .attr("fill", quad.color)
        .attr("opacity", 0.3);

      // Añadir etiquetas de cuadrantes
      svg.append("text")
        .attr("x", quad.x + quad.width / 2)
        .attr("y", quad.y + 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .text(quad.label);

      svg.append("text")
        .attr("x", quad.x + quad.width / 2)
        .attr("y", quad.y + 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(quad.name);
    });

    // Dibujar ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // Etiquetas de los ejes
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 5})`)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("PRM (Posición Relativa en el Mercado)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("TCM (Tasa de Crecimiento del Mercado)");

    // Crear tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Dibujar burbujas para cada producto
    const bubbles = svg.selectAll(".bubble")
      .data(bcgData.bcgTable.products)
      .enter()
      .append("g")
      .attr("class", "bubble");

    bubbles.append("circle")
      .attr("cx", d => xScale(d.prm))
      .attr("cy", d => yScale(d.tcm))
      .attr("r", d => radiusScale(d.salesPercentage))
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
      .attr("opacity", 0.7)
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        const productName = bcgData.salesForecast.products.find(p => p.id === d.productId)?.name || 'Producto';
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>${productName}</strong><br/>
          TCM: ${d.tcm.toFixed(2)}<br/>
          PRM: ${d.prm.toFixed(2)}<br/>
          % Ventas: ${d.salesPercentage.toFixed(2)}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Añadir etiquetas de productos en las burbujas
    bubbles.append("text")
      .attr("x", d => xScale(d.prm))
      .attr("y", d => yScale(d.tcm))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d, i) => `P${i + 1}`);

    // Cleanup function
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };

  }, [bcgData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Gráfico de Burbujas BCG
        </Typography>
        
        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <svg ref={svgRef}></svg>
        </Paper>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Interpretación:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • <strong>Tamaño de burbuja:</strong> Representa el porcentaje de ventas del producto
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • <strong>Eje X (PRM):</strong> Posición Relativa en el Mercado (vs. competidor más fuerte)
          </Typography>
          <Typography variant="body2">
            • <strong>Eje Y (TCM):</strong> Tasa de Crecimiento del Mercado (promedio por períodos)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BCGBubbleChart;