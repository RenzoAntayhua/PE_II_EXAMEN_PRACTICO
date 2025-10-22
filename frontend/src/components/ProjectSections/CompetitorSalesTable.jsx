import React from 'react';
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
  TextField,
  Card,
  CardContent,
  Chip
} from '@mui/material';

const CompetitorSalesTable = ({ bcgData, setBcgData }) => {
  const updateCompetitorSales = (productId, competitorIndex, sales) => {
    const updatedProducts = bcgData.competitorSales.products.map(product => {
      if (product.productId === productId) {
        const updatedCompetitors = product.competitors.map((comp, idx) =>
          idx === competitorIndex ? { ...comp, sales: Number(sales) || 0 } : comp
        );
        
        // Calcular el mayor valor de ventas entre competidores
        const maxSales = Math.max(...updatedCompetitors.map(c => c.sales));
        
        return { 
          ...product, 
          competitors: updatedCompetitors,
          maxCompetitorSales: maxSales
        };
      }
      return product;
    });
    
    setBcgData({
      ...bcgData,
      competitorSales: {
        products: updatedProducts
      }
    });
  };

  const getProductName = (productId) => {
    const product = bcgData.salesForecast.products.find(p => p.id === productId);
    return product ? product.name : `Producto ${productId}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Niveles de Venta de los Competidores de Cada Producto
        </Typography>
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Competidor</TableCell>
                {bcgData.salesForecast.products.map(product => (
                  <TableCell key={product.id} align="center" colSpan={2}>
                    {product.name}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                {bcgData.salesForecast.products.map(product => (
                  <React.Fragment key={product.id}>
                    <TableCell align="center" sx={{ backgroundColor: 'grey.100' }}>
                      Empresa
                    </TableCell>
                    <TableCell align="center" sx={{ backgroundColor: 'grey.100' }}>
                      Ventas
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Generar 9 filas de competidores para cada producto */}
              {Array.from({ length: 9 }, (_, competitorIndex) => (
                <TableRow key={competitorIndex}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Competidor {competitorIndex + 1}
                  </TableCell>
                  {bcgData.salesForecast.products.map((product, productIndex) => {
                    const competitorProduct = bcgData.competitorSales.products.find(
                      cp => cp.productId === product.id
                    );
                    
                    const competitorId = `CP${productIndex + 1}-${competitorIndex + 1}`;
                    const competitor = competitorProduct?.competitors?.[competitorIndex];
                    
                    return (
                      <React.Fragment key={product.id}>
                        <TableCell align="center">
                          {competitorId}
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={competitor?.sales || 0}
                            onChange={(e) => updateCompetitorSales(
                              product.id, 
                             competitorIndex, 
                              e.target.value
                            )}
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
              
              {/* Fila final con el mayor valor */}
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                  Mayor
                </TableCell>
                {bcgData.salesForecast.products.map(product => {
                  const competitorProduct = bcgData.competitorSales.products.find(
                    cp => cp.productId === product.id
                  );
                  
                  const maxSales = competitorProduct?.maxCompetitorSales || 0;
                  
                  return (
                    <React.Fragment key={product.id}>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Máximo
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={maxSales.toLocaleString()} 
                          color="secondary" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default CompetitorSalesTable;