import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, List, ListItem, ListItemText, 
  Avatar, Chip, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import api from '../services/api';

interface Patient {
  id: number;
  employee: { username: string };
  date: string;
  status: string;
}

interface Insight {
  id: number;
  text: string;
  recommendations: string;
  generated_at: string;
}

export default function Psychologist() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [insightsData, setInsightsData] = useState<Insight[]>([]);
  const [openValidar, setOpenValidar] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const fetchData = async () => {
    try {
      const [acRes, inRes] = await Promise.all([
        api.get('/follow-ups/'),
        api.get('/insights/')
      ]);
      setPatients(acRes.data);
      setInsightsData(inRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchData();
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  const handleValidarClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setOpenValidar(true);
  };

  const handleSalvarValidacao = async () => {
    if (!selectedInsight) return;
    try {
      await api.patch(`/insights/${selectedInsight.id}/validar/`, {
        texto: selectedInsight.text,
        recomendacoes: selectedInsight.recommendations
      });
      setOpenValidar(false);
      void fetchData();
    } catch (err) {
      console.error(err);
    }
  };


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
              {patients.map((paciente: Patient, index: number) => (
                <ListItem key={index} divider>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {paciente.employee?.username?.[0] || 'P'}
                  </Avatar>
                  <ListItemText 
                    primary={paciente.employee?.username || 'Paciente'}
                    secondary={`Início: ${new Date(paciente.date).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={paciente.status}
                    color={paciente.status === 'ativo' ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
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
            {insightsData.map((insight: Insight, index: number) => (
              <Card key={index} sx={{ mb: 2, bgcolor: 'info.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2">Insight Automático</Typography>
                  <Typography variant="body2" sx={{ my: 1 }}>{insight.text}</Typography>
                  <Typography variant="caption" display="block">{new Date(insight.generated_at).toLocaleDateString()}</Typography>
                  <Button size="small" variant="contained" sx={{ mt: 1 }} onClick={() => handleValidarClick(insight)}>
                    Analisar / Validar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de Validação */}
      <Dialog open={openValidar} onClose={() => setOpenValidar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Validar Insight</DialogTitle>
        <DialogContent>
          <TextField
            label="Texto do Insight"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={selectedInsight?.texto || ''}
            onChange={(e) => selectedInsight && setSelectedInsight({ ...selectedInsight, texto: e.target.value })}
          />
          <TextField
            label="Recomendações"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={selectedInsight?.recomendacoes || ''}
            onChange={(e) => selectedInsight && setSelectedInsight({ ...selectedInsight, recomendacoes: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenValidar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarValidacao}>
            Salvar e Validar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}