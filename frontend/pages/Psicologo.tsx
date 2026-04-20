// frontend/pages/Psicologo.tsx
import { 
  Box, Typography, Grid, Paper, List, ListItem, ListItemText, 
  Avatar, Chip, Card, CardContent 
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';

export default function Psicologo() {
  const pacientes = [
    { nome: 'João Silva', ultimaConsulta: '2026-01-15', status: 'melhora', nivel: 'moderado' },
    { nome: 'Maria Santos', ultimaConsulta: '2026-01-14', status: 'estavel', nivel: 'leve' },
    { nome: 'Pedro Costa', ultimaConsulta: '2026-01-13', status: 'atencao', nivel: 'grave' },
    { nome: 'Ana Oliveira', ultimaConsulta: '2026-01-12', status: 'melhora', nivel: 'moderado' },
  ];

  const insights = [
    { paciente: 'João Silva', insight: 'Apresentou melhora significativa nos níveis de ansiedade', data: '2026-01-15' },
    { paciente: 'Maria Santos', insight: 'Recomendar exercícios de respiração', data: '2026-01-14' },
  ];

  return (
    <Box className="container">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard do Psicólogo
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de resumo */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">12</Typography>
              <Typography color="text.secondary">Pacientes ativos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">8</Typography>
              <Typography color="text.secondary">Em melhora</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">24</Typography>
              <Typography color="text.secondary">Consultas/mês</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">3</Typography>
              <Typography color="text.secondary">Requerem atenção</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Pacientes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PeopleIcon color="primary" />
              <Typography variant="h6">Meus Pacientes</Typography>
            </Box>
            <List>
              {pacientes.map((paciente, index) => (
                <ListItem key={index} divider>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {paciente.nome[0]}
                  </Avatar>
                  <ListItemText 
                    primary={paciente.nome}
                    secondary={`Última consulta: ${paciente.ultimaConsulta}`}
                  />
                  <Chip 
                    label={paciente.nivel}
                    color={paciente.nivel === 'grave' ? 'error' : paciente.nivel === 'moderado' ? 'warning' : 'success'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={paciente.status}
                    variant="outlined"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Insights Recentes */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Insights Gerados</Typography>
            {insights.map((insight, index) => (
              <Card key={index} sx={{ mb: 2, bgcolor: 'info.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2">{insight.paciente}</Typography>
                  <Typography variant="body2" sx={{ my: 1 }}>{insight.insight}</Typography>
                  <Typography variant="caption">{insight.data}</Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}