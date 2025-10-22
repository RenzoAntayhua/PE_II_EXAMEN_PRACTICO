import React, { useState, useEffect } from 'react';
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
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import CompetitorSalesTable from './CompetitorSalesTable';
import BCGTable from './BCGTable';
import BCGBubbleChart from './BCGBubbleChart';

const BCGMatrixSection = ({ projectId, sectionData, onDataUpdate }) => {
  const [bcgData, setBcgData] = useState({
    salesForecast: {
      products: [],
      totalSales: 0
    },
    marketGrowthRates: {
      periods: []
    },
    competitorSales: {
      products: []
    },
    bcgTable: {
      products: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const content = sectionData?.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      if (parsed && parsed.salesForecast && parsed.marketGrowthRates && parsed.competitorSales && parsed.bcgTable) {
        setBcgData(parsed);
      } else {
        setBcgData(prev => ({ ...prev }));
      }
    } catch (error) {
      setBcgData(prev => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  }, [sectionData]);

  useEffect(() => {
    if (!loading) {
      onDataUpdate({ ...sectionData, content: bcgData });
    }
  }, [bcgData]);

  const fetchBCGData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/projects/${projectId}/bcg-matrix`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBcgData(response.data.bcgMatrix);
    } catch (error) {
      console.error('Error fetching BCG data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBCGData = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${projectId}/bcg-matrix`, 
        { bcgData }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSave && onSave();
    } catch (error) {
      console.error('Error saving BCG data:', error);
    }
  };

  // Funciones para manejar productos en la tabla de previsión de ventas
  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: `Producto ${bcgData.salesForecast.products.length + 1}`,
      sales: 0,
      percentage: 0
    };
    
    const updatedData = {
      ...bcgData,
      salesForecast: {
        ...bcgData.salesForecast,
        products: [...bcgData.salesForecast.products, newProduct]
      }
    };
    
    // Agregar producto a otras tablas también
    updatedData.competitorSales.products.push({
      productId: newProduct.id,
      competitors: Array.from({ length: 9 }, (_, i) => ({
        id: `CP${bcgData.salesForecast.products.length + 1}-${i + 1}`,
        name: `CP${bcgData.salesForecast.products.length + 1}-${i + 1}`,
        sales: 0
      })),
      maxCompetitorSales: 0
    });
    
    updatedData.bcgTable.products.push({
      productId: newProduct.id,
      tcm: 0,
      prm: 0,
      salesPercentage: 0
    });
    
    // Asegurar que todos los períodos tengan un valor para el nuevo producto
    updatedData.marketGrowthRates.periods = bcgData.marketGrowthRates.periods.map(period => ({
      ...period,
      productValues: [
        ...period.productValues,
        { productId: newProduct.id, value: 0 }
      ]
    }));

    setBcgData(updatedData);
  };

  const removeProduct = (productId) => {
    const updatedData = {
      ...bcgData,
      salesForecast: {
        ...bcgData.salesForecast,
        products: bcgData.salesForecast.products.filter(p => p.id !== productId)
      },
      competitorSales: {
        products: bcgData.competitorSales.products.filter(p => p.productId !== productId)
      },
      bcgTable: {
        products: bcgData.bcgTable.products.filter(p => p.productId !== productId)
      }
    };
    
    // Actualizar períodos para remover valores del producto eliminado
    updatedData.marketGrowthRates.periods = bcgData.marketGrowthRates.periods.map(period => ({
      ...period,
      productValues: period.productValues.filter(pv => pv.productId !== productId)
    }));
    
    setBcgData(updatedData);
  };

  const updateProductSales = (productId, sales) => {
    const updatedProducts = bcgData.salesForecast.products.map(product =>
      product.id === productId ? { ...product, sales: Number(sales) || 0 } : product
    );
    
    setBcgData({
      ...bcgData,
      salesForecast: {
        ...bcgData.salesForecast,
        products: updatedProducts
      }
    });
  };

  const updateProductName = (productId, name) => {
    const updatedProducts = bcgData.salesForecast.products.map(product =>
      product.id === productId ? { ...product, name } : product
    );
    
    setBcgData({
      ...bcgData,
      salesForecast: {
        ...bcgData.salesForecast,
        products: updatedProducts
      }
    });
  };

  // Funciones para períodos de crecimiento
  const addPeriod = () => {
    const newPeriod = {
      id: Date.now(),
      name: `Período ${bcgData.marketGrowthRates.periods.length + 1}`,
      productValues: bcgData.salesForecast.products.map(product => ({
        productId: product.id,
        value: 0
      }))
    };
    
    setBcgData({
      ...bcgData,
      marketGrowthRates: {
        periods: [...bcgData.marketGrowthRates.periods, newPeriod]
      }
    });
  };

  const removePeriod = (periodId) => {
    setBcgData({
      ...bcgData,
      marketGrowthRates: {
        periods: bcgData.marketGrowthRates.periods.filter(p => p.id !== periodId)
      }
    });
  };

  const updatePeriodValue = (periodId, productId, value) => {
    const updatedPeriods = bcgData.marketGrowthRates.periods.map(period => {
      if (period.id === periodId) {
        let found = false;
        const updatedProductValues = period.productValues.map(pv => {
          if (pv.productId === productId) {
            found = true;
            return { ...pv, value: Number(value) || 0 };
          }
          return pv;
        });
        // Si no existe el registro para el producto, añadirlo
        const finalProductValues = found
          ? updatedProductValues
          : [...updatedProductValues, { productId, value: Number(value) || 0 }];
        return { ...period, productValues: finalProductValues };
      }
      return period;
    });
    
    setBcgData({
      ...bcgData,
      marketGrowthRates: {
        periods: updatedPeriods
      }
    });
  };

  // Función para actualizar ventas de competidores
  const updateCompetitorSales = (productId, competitorId, sales) => {
    const updatedProducts = bcgData.competitorSales.products.map(product => {
      if (product.productId === productId) {
        const updatedCompetitors = product.competitors.map(comp =>
          comp.id === competitorId ? { ...comp, sales: Number(sales) || 0 } : comp
        );
        return { ...product, competitors: updatedCompetitors };
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

  if (loading) {
    return <Typography>Cargando matriz BCG...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon />
          Matriz BCG
        </Typography>
        <Box />
      </Box>

      <Grid container spacing={3}>
        {/* Tabla de Previsión de Ventas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tabla de Previsión de Ventas</Typography>
                <Button startIcon={<AddIcon />} onClick={addProduct}>
                  Agregar Producto
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Productos</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                      <TableCell align="right">Total %</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bcgData.salesForecast.products.map((product) => {
                      const totalSales = bcgData.salesForecast.products.reduce((sum, p) => sum + p.sales, 0);
                      const percentage = totalSales > 0 ? (product.sales / totalSales) * 100 : 0;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <TextField
                              value={product.name}
                              onChange={(e) => updateProductName(product.id, e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={product.sales}
                              onChange={(e) => updateProductSales(product.id, e.target.value)}
                              size="small"
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${percentage.toFixed(2)}%`} 
                              color="primary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              onClick={() => removeProduct(product.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {bcgData.salesForecast.products.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        <Chip label="100%" color="success" />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de Tasas de Crecimiento del Mercado */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tasas de Crecimiento del Mercado</Typography>
                <Button startIcon={<AddIcon />} onClick={addPeriod}>
                  Agregar Período
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Períodos</TableCell>
                      {bcgData.salesForecast.products.map(product => (
                        <TableCell key={product.id} align="center">{product.name}</TableCell>
                      ))}
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bcgData.marketGrowthRates.periods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell>{period.name}</TableCell>
                        {bcgData.salesForecast.products.map(product => {
                          const productValue = period.productValues.find(pv => pv.productId === product.id);
                          return (
                            <TableCell key={product.id} align="center">
                              <TextField
                                type="number"
                                value={productValue?.value || 0}
                                onChange={(e) => updatePeriodValue(period.id, product.id, e.target.value)}
                                size="small"
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => removePeriod(period.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de Ventas de Competidores */}
         <Grid item xs={12}>
           <CompetitorSalesTable 
             bcgData={bcgData}
             setBcgData={setBcgData}
           />
         </Grid>

         {/* Tabla BCG */}
         <Grid item xs={12}>
           <BCGTable 
             bcgData={bcgData}
             setBcgData={setBcgData}
           />
         </Grid>

        {/* Gráfico de Burbujas BCG */}
        <Grid item xs={12}>
          <BCGBubbleChart 
            bcgData={bcgData}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCGMatrixSection;