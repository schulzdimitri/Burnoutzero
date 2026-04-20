// frontend/pages/Gestor.tsx
import { 
  Box, Typography, Grid, Paper, Alert, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function Gestor() {
  const alertas = [
    { setor: 'TI', funcionario: 'Carlos', indicador: 'Estresse', nivel: 85, dias: 5 },
    { setor: 'RH', funcionario: 'Ana', indicador: 'Burnout', nivel: 78, dias: 3 },
    { setor: 'Vendas', funcionario: 'Pedro', indicador: 'Ansiedade', nivel: 92, dias: 2 },
  ];

  const metricasSetores = [
    { setor: 'TI', engajamento: 85, saude: 'Bom', alertas: 2 },
    { setor: 'RH', engajamento: 92, saude: 'Excelente', alertas: 1 },
    { setor: 'Vendas', engajamento: 67, saude: 'Atenção', alertas: 3 },
    { setor: 'Marketing', engajamento: 78, saude: 'Bom', alertas: 0 },
  ];

  return (
    <Box className="container">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Gerencial
      </Typography>

      <Grid container spacing={3}>
        {/* Alertas Críticos */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningIcon color="error" />
              <Typography variant="h6" color="error">Alertas da Equipe</Typography>
            </Box>
            {alertas.map((alerta, index) => (
              <Alert 
                key={index} 
                severity="warning" 
                sx={{ mb: 1 }}
                action={
                  <Chip 
                    label={`${alerta.dias} dias`} 
                    size="small" 
                    color="warning"
                  />
                }
              >
                <strong>{alerta.setor}:</strong> {alerta.funcionario} - {alerta.indicador} em nível crítico ({alerta.nivel}%)
              </Alert>
            ))}
          </Paper>
        </Grid>

        {/* Cards de Métricas Gerais */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">45</Typography>
              <Typography color="text.secondary">Total de funcionários</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">87%</Typography>
              <Typography color="text.secondary">Engajamento médio</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4">6</Typography>
              <Typography color="text.secondary">Alertas ativos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">92%</Typography>
              <Typography color="text.secondary">Participação</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela por Setor */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Saúde Mental por Setor</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Setor</TableCell>
                    <TableCell>Engajamento</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Alertas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metricasSetores.map((setor, index) => (
                    <TableRow key={index}>
                      <TableCell>{setor.setor}</TableCell>
                      <TableCell>{setor.engajamento}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={setor.saude}
                          color={setor.saude === 'Excelente' ? 'success' : setor.saude === 'Atenção' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={setor.alertas}
                          color={setor.alertas > 0 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}