// frontend/pages/Jornada.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Jornada() {
  const navigate = useNavigate();
  const [questProgress, setQuestProgress] = useState(0);

  // Dados do usuário
  const user = {
    nome: 'João Silva',
    titulo: 'Curador Sereno',
    avatar: 'JS',
    xp: 1250,
    xpProximo: 1500,
    pontos: 450,
    diasAtivo: 15,
    level: 5
  };

  // Quest diária
  const questDiaria = {
    titulo: 'Respirar por 2 minutos',
    descricao: 'Uma pausa consciente para oxigenar o cérebro e reduzir os níveis de cortisol. Encontre um lugar calmo e siga o ritmo.',
    xpGanho: 50,
    progresso: 0,
    total: 100
  };

  // Desafios semanais
  const desafiosSemanais = [
    {
      titulo: '3 Sessões de Mindfulness',
      xp: 150,
      progresso: 2,
      total: 3,
      percentual: 66
    },
    {
      titulo: 'Registrar humor diário',
      xp: 50,
      progresso: 6,
      total: 7,
      percentual: 85
    }
  ];

  // Conquistas recentes
  const conquistas = [
    { titulo: 'Primeiros passos', data: '2 dias atrás', icone: '🌟' },
    { titulo: '5 dias seguidos', data: '1 dia atrás', icone: '🔥' },
    { titulo: 'Mestre da respiração', data: 'Hoje', icone: '🧘' }
  ];

  const handleIniciarQuest = () => {
    // Simular progresso da quest
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setQuestProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          alert('🎉 Parabéns! Você completou a quest e ganhou 50 XP!');
        }, 500);
      }
    }, 500);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Header de boas-vindas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          SUA JORNADA DE BEM-ESTAR
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2 }}>
          Olá, {user.nome}! Vamos começar sua jornada de hoje?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FireIcon />}
            onClick={handleIniciarQuest}
            sx={{ borderRadius: 3 }}
          >
            Iniciar Desafio Diário
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmojiEventsIcon />}
            onClick={() => navigate('/recompensas')}
            sx={{ borderRadius: 3 }}
          >
            Ver Recompensas
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Coluna principal (esquerda) */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Quest Diária */}
          <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2, color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                QUEST DIÁRIA
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {questDiaria.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {questDiaria.descricao}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BoltIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                <Typography variant="caption" color="warning.main">
                  +{questDiaria.xpGanho} XP
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={questProgress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {questProgress}% completo
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Desafios Semanais */}
          <Card sx={{ mb: 3, borderRadius: 4 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Desafios Semanais
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />}>
                  Ver todos
                </Button>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {desafiosSemanais.map((desafio, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {desafio.titulo}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BoltIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" color="warning.main">
                          +{desafio.xp} XP
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={desafio.percentual}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {desafio.progresso} DE {desafio.total} CONCLUSÕES
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                        {desafio.percentual}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Seu equilíbrio semanal */}
          <Card sx={{ borderRadius: 4, bgcolor: 'success.light', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Seu equilíbrio semanal</Typography>
                  <Typography variant="body2">
                    Você está 15% mais calmo que na semana passada. Continue assim!
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'white', color: 'success.main' }}
                >
                  ELOGIOS FEITOS
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  12
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna lateral (direita) */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Perfil do usuário */}
          <Card sx={{ mb: 3, borderRadius: 4, textAlign: 'center' }}>
            <CardContent sx={{ p: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {user.avatar}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.nome}
              </Typography>
              <Chip
                label={user.titulo}
                size="small"
                sx={{ mt: 1, mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">XP atual:</Typography>
                  <Typography variant="body2" fontWeight={600}>{user.xp} / {user.xpProximo}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(user.xp / user.xpProximo) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Próximo Nível: {user.xpProximo}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                    {user.pontos}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">PONTOS</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                    {user.diasAtivo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">DIAS ATIVO</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          <Card sx={{ borderRadius: 4 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Conquistas Recentes
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {conquistas.map((conquista, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: index < conquistas.length - 1 ? 2 : 0
                  }}
                >
                  <Typography variant="h4">{conquista.icone}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {conquista.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conquista.data}
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" />
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EmojiEventsIcon />}
                sx={{ mt: 3, borderRadius: 3 }}
                onClick={() => navigate('/recompensas')}
              >
                Resgatar Pontos
              </Button>
              <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                Troque seus {user.pontos} pts por prêmios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}