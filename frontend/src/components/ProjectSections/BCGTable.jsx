import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip
} from '@mui/material';

const BCGTable = ({ bcgData, setBcgData }) => {
  // Calcular automáticamente los valores de la tabla BCG
  useEffect(() => {
    const updatedBcgProducts = bcgData.salesForecast.products.map(product => {
      // Calcular TCM (promedio de valores período-producto)
      const productPeriodValues = bcgData.marketGrowthRates.periods
        .flatMap(period => 
          period.productValues.filter(pv => pv.productId === product.id)
        )
        .map(pv => pv.value);
      
      const tcm = productPeriodValues.length > 0 
        ? productPeriodValues.reduce((sum, val) => sum + val, 0) / productPeriodValues.length 
        : 0;

      // Calcular PRM usando la fórmula especificada
      const competitorProduct = bcgData.competitorSales.products.find(
        cp => cp.productId === product.id
      );
      
      const maxCompetitorSales = competitorProduct?.maxCompetitorSales || 0;
      let prm = 0;
      
      if (maxCompetitorSales === 0) {
        prm = 0;
      } else {
        const ratio = product.sales / maxCompetitorSales;
        prm = ratio > 2 ? 2 : ratio;
      }

      // Calcular %S/VTAS (porcentaje de ventas)
      const totalSales = bcgData.salesForecast.products.reduce((sum, p) => sum + p.sales, 0);
      const salesPercentage = totalSales > 0 ? (product.sales / totalSales) * 100 : 0;

      return {
        productId: product.id,
        tcm: tcm,
        prm: prm,
        salesPercentage: salesPercentage
      };
    });

    // Actualizar solo si hay cambios
    const currentBcgProducts = bcgData.bcgTable.products;
    const hasChanges = JSON.stringify(updatedBcgProducts) !== JSON.stringify(currentBcgProducts);
    
    if (hasChanges) {
      setBcgData({
        ...bcgData,
        bcgTable: {
          products: updatedBcgProducts
        }
      });
    }
  }, [
    bcgData.salesForecast.products,
    bcgData.marketGrowthRates.periods,
    bcgData.competitorSales.products
  ]);

  const getProductName = (productId) => {
    const product = bcgData.salesForecast.products.find(p => p.id === productId);
    return product ? product.name : `Producto ${productId}`;
  };

  const getBCGCategory = (tcm, prm) => {
    // Determinar la categoría BCG basada en TCM y PRM
    if (tcm >= 10 && prm >= 1) {
      return { category: 'Estrella', color: 'success', icon: '⭐' };
    } else if (tcm >= 10 && prm < 1) {
      return { category: 'Interrogación', color: 'warning', icon: '❓' };
    } else if (tcm < 10 && prm >= 1) {
      return { category: 'Vaca', color: 'info', icon: '🐄' };
    } else {
      return { category: 'Perro', color: 'error', icon: '🐕' };
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tabla BCG
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>BCG</TableCell>
                {bcgData.salesForecast.products.map(product => (
                  <TableCell key={product.id} align="center" sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Fila TCM */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'white' }}>
                  TCM
                </TableCell>
                {bcgData.bcgTable.products.map(bcgProduct => (
                  <TableCell key={bcgProduct.productId} align="center">
                    <Chip 
                      label={bcgProduct.tcm.toFixed(2)} 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Fila PRM */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'secondary.light', color: 'white' }}>
                  PRM
                </TableCell>
                {bcgData.bcgTable.products.map(bcgProduct => (
                  <TableCell key={bcgProduct.productId} align="center">
                    <Chip 
                      label={bcgProduct.prm.toFixed(2)} 
                      color="secondary" 
                      variant="outlined"
                    />
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Fila %S/VTAS */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'success.light', color: 'white' }}>
                  % S/VTAS
                </TableCell>
                {bcgData.bcgTable.products.map(bcgProduct => (
                  <TableCell key={bcgProduct.productId} align="center">
                    <Chip 
                      label={`${bcgProduct.salesPercentage.toFixed(2)}%`} 
                      color="success" 
                      variant="outlined"
                    />
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Fila de Categoría BCG */}
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Categoría
                </TableCell>
                {bcgData.bcgTable.products.map(bcgProduct => {
                  const category = getBCGCategory(bcgProduct.tcm, bcgProduct.prm);
                  return (
                    <TableCell key={bcgProduct.productId} align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4">{category.icon}</Typography>
                        <Chip 
                          label={category.category} 
                          color={category.color}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Leyenda */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Leyenda:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<span>⭐</span>} label="Estrella (TCM≥10, PRM≥1)" color="success" size="small" />
            <Chip icon={<span>❓</span>} label="Interrogación (TCM≥10, PRM<1)" color="warning" size="small" />
            <Chip icon={<span>🐄</span>} label="Vaca (TCM<10, PRM≥1)" color="info" size="small" />
            <Chip icon={<span>🐕</span>} label="Perro (TCM<10, PRM<1)" color="error" size="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BCGTable;