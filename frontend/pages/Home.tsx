// frontend/pages/Jornada.tsx
import { useState, useEffect, useRef } from 'react';
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
  TrendingUp as TrendingUpIcon,
  Bolt as BoltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

// Animações de respiração
const breathIn = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0.3; }
`;

const breathOut = keyframes`
  0% { transform: scale(1.8); opacity: 0.3; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const WORD_INTERVAL_MS = 60 * 60 * 1000;
const DAILY_WORDS = [
  'calma',
  'foco',
  'pausa',
  'respirar',
  'equilíbrio',
  'presença',
  'silêncio',
  'leveza',
  'cuidado',
  'ritmo'
];

const moodOptions = [
  { label: 'Muito mal', icon: '😣' },
  { label: 'Mal', icon: '😕' },
  { label: 'Neutro', icon: '😐' },
  { label: 'Bem', icon: '🙂' },
  { label: 'Muito bem', icon: '😁' }
];

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
};

const randomWord = () => DAILY_WORDS[Math.floor(Math.random() * DAILY_WORDS.length)];

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
  color: string;
}

const BreathingExercise = ({ onComplete }: { onComplete: (xp: number) => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const TOTAL_DURATION = 60; // 1 minuto em segundos
  const INHALE_DURATION = 4;
  const HOLD_DURATION = 3;
  const EXHALE_DURATION = 3;
  const intervalRef = useRef<number | null>(null);

  const phases: Record<'inhale' | 'hold' | 'exhale', BreathingPhase> = {
    inhale: {
      name: 'Inspirar',
      duration: INHALE_DURATION,
      instruction: 'Inspire contando até 4',
      color: 'primary.main'
    },
    hold: {
      name: 'Reter',
      duration: HOLD_DURATION,
      instruction: 'Segure a respiração por 3 segundos',
      color: 'warning.main'
    },
    exhale: {
      name: 'Expirar',
      duration: EXHALE_DURATION,
      instruction: 'Expire lentamente em 3 segundos',
      color: 'success.main'
    }
  };

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTotalTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= TOTAL_DURATION) {
          if (!xpAwarded) {
            onComplete(50);
            setXpAwarded(true);
          }
          setIsActive(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return TOTAL_DURATION;
        }
        return newTime;
      });

      setPhaseTime((prev) => {
        const newPhaseTime = prev + 1;

        if (currentPhase === 'inhale' && newPhaseTime >= INHALE_DURATION) {
          setCurrentPhase('hold');
          return 0;
        }
        if (currentPhase === 'hold' && newPhaseTime >= HOLD_DURATION) {
          setCurrentPhase('exhale');
          return 0;
        }
        if (currentPhase === 'exhale' && newPhaseTime >= EXHALE_DURATION) {
          setCurrentPhase('inhale');
          setCyclesCompleted((prev) => prev + 1);
          return 0;
        }

        return newPhaseTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, currentPhase, onComplete, xpAwarded]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setTotalTime(0);
    setCyclesCompleted(0);
    setXpAwarded(false);
  };

  const progress = (totalTime / TOTAL_DURATION) * 100;
  const phaseProgress = (phaseTime / phases[currentPhase].duration) * 100;
  const currentPhaseInfo = phases[currentPhase];

  return (
    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            RESPIRAÇÃO GUIADA
          </Typography>
        </Box>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Respiração • 1min
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {currentPhaseInfo.instruction}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Fase</Typography>
                <Typography variant="body2" color="text.secondary">{phaseTime} / {phases[currentPhase].duration}s</Typography>
              </Box>
              <LinearProgress variant="determinate" value={phaseProgress} sx={{ height: 8, borderRadius: 2 }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Tempo</Typography>
                <Typography variant="body2" color="text.secondary">{Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2,'0')} / 1:00</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2 }} />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', width: 120 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: currentPhaseInfo.color === 'primary.main' ? 'rgba(33,150,243,0.3)' : currentPhaseInfo.color === 'warning.main' ? 'rgba(255,193,7,0.3)' : 'rgba(76,175,80,0.3)',
                border: '3px solid',
                borderColor: currentPhaseInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1,
                animation: isActive ? (currentPhase === 'exhale' ? `${breathOut} ${EXHALE_DURATION}s ease-in-out infinite` : `${breathIn} ${currentPhase === 'hold' ? HOLD_DURATION : INHALE_DURATION}s ease-in-out infinite`) : 'none'
              }}
            >
              <Typography variant="h6" sx={{ color: currentPhaseInfo.color }}>{phaseTime}s</Typography>
            </Box>

            <Box>
              {!isActive ? (
                <Button variant="contained" onClick={handleStart} sx={{ borderRadius: 3 }}>
                  Iniciar
                </Button>
              ) : (
                <Button variant="contained" onClick={handlePause} sx={{ borderRadius: 3 }}>
                  Pausar
                </Button>
              )}
              <Button variant="text" onClick={handleReset} sx={{ display: 'block', mt: 1 }}>Reiniciar</Button>
            </Box>
          </Box>
        </Box>

        {progress === 100 && (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              ✓ Sessão concluída — +50 XP
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.dark', mt: 1, display: 'block' }}>
              Ciclos: {cyclesCompleted}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DailyWordsMission = ({ onCompleteXp }: { onCompleteXp: (xp: number) => void }) => {
  const STORAGE_KEY = 'burnout-zero-daily-words';
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [nextWordAt, setNextWordAt] = useState<number>(Date.now());
  const [completed, setCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const stored = readStorage<{
      collectedWords: string[];
      currentWord: string | null;
      nextWordAt: number;
      completed: boolean;
      xpAwarded: boolean;
    }>(STORAGE_KEY, {
      collectedWords: [],
      currentWord: null,
      nextWordAt: Date.now(),
      completed: false,
      xpAwarded: false
    });

    setCollectedWords(stored.collectedWords);
    setCurrentWord(stored.currentWord);
    setNextWordAt(stored.nextWordAt);
    setCompleted(stored.completed);
    setXpAwarded(stored.xpAwarded);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (completed) {
      return;
    }

    if (!currentWord && Date.now() >= nextWordAt) {
      setCurrentWord(randomWord());
    }
  }, [completed, currentWord, nextWordAt, tick]);

  useEffect(() => {
    writeStorage(STORAGE_KEY, {
      collectedWords,
      currentWord,
      nextWordAt,
      completed,
      xpAwarded
    });
  }, [collectedWords, currentWord, nextWordAt, completed, xpAwarded]);

  const handleRecordWord = () => {
    if (!currentWord || completed) {
      return;
    }

    const nextCollected = [...collectedWords, currentWord];
    const isFinished = nextCollected.length >= 5;

    setCollectedWords(nextCollected);
    setCurrentWord(null);
  setNextWordAt(Date.now() + WORD_INTERVAL_MS);

    if (isFinished && !xpAwarded) {
      setCompleted(true);
      setXpAwarded(true);
      onCompleteXp(75);
    }
  };

  const remainingMs = Math.max(0, nextWordAt - Date.now());
  const progress = (collectedWords.length / 5) * 100;

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Missão Diária: Palavras
          </Typography>
        </Box>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {collectedWords.length} / 5 palavras
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Anote a palavra atual e junte 5 em ordem para concluir a missão.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2 }} />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Próxima palavra em
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {currentWord ? 'agora' : `${Math.floor(remainingMs / 60000)}:${String(Math.ceil((remainingMs % 60000) / 1000)).padStart(2, '0')}`}
            </Typography>
            <Button
              variant="contained"
              onClick={handleRecordWord}
              disabled={!currentWord || completed}
              sx={{ borderRadius: 2, mt: 1 }}
            >
              Registrar palavra
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Palavra atual
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            {currentWord ?? 'Palavra registrada'}
          </Typography>
        </Box>

        {completed && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              ✓ Missão concluída — +75 XP
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const MoodChallenge = ({ onCompleteXp }: { onCompleteXp: (xp: number) => void }) => {
  const STORAGE_KEY = 'burnout-zero-mood-challenge';
  const todayKey = getLocalDateKey();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [claimedDate, setClaimedDate] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const stored = readStorage<{ selectedMood: string | null; claimedDate: string | null }>(STORAGE_KEY, {
      selectedMood: null,
      claimedDate: null
    });

    setSelectedMood(stored.selectedMood);
    setClaimedDate(stored.claimedDate);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEY, {
      selectedMood,
      claimedDate
    });
  }, [selectedMood, claimedDate]);

  const claimedToday = claimedDate === todayKey;

  const handleSelectMood = (label: string) => {
    if (claimedToday) {
      return;
    }

    setSelectedMood(label);
    setClaimedDate(todayKey);
    onCompleteXp(50);
  };

  if (!isExpanded) {
    return (
      <Card
        variant="outlined"
        onClick={() => setIsExpanded(true)}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'grey.50',
          mt: 2,
          cursor: 'pointer',
          minHeight: 140,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Registrar humor diário
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Clique para abrir as 5 reações e registrar seu estado.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {claimedToday ? `Registrado hoje: ${selectedMood}` : '1 vez por dia • +50 XP'}
            </Typography>
            <Typography variant="h5">{selectedMood ? '✅' : '🙂'}</Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registrar humor diário
          </Typography>
          <Button size="small" onClick={() => setIsExpanded(false)}>
            Recolher
          </Button>
        </Box>
      </Box>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escolha 1 reação por dia. +50 XP ao registrar.
        </Typography>
        <Grid container spacing={1.5}>
          {moodOptions.map((mood) => (
            <Grid size={{ xs: 4, sm: 2 }} key={mood.label}>
              <Button
                fullWidth
                variant={selectedMood === mood.label ? 'contained' : 'outlined'}
                onClick={() => handleSelectMood(mood.label)}
                disabled={claimedToday}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  flexDirection: 'column',
                  textTransform: 'none'
                }}
              >
                <Typography variant="h6">{mood.icon}</Typography>
                <Typography variant="caption">{mood.label}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
        {selectedMood && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
            Humor registrado: {selectedMood}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const StreakChallenge = ({ onCompleteXp }: { onCompleteXp: (xp: number) => void }) => {
  const STORAGE_KEY = 'burnout-zero-streak';
  const todayKey = getLocalDateKey();
  const yesterdayKey = getYesterdayKey();
  const [streakDays, setStreakDays] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [claimedDate, setClaimedDate] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStorage<{ streakDays: number; lastClaimDate: string | null; claimedDate: string | null }>(STORAGE_KEY, {
      streakDays: 0,
      lastClaimDate: null,
      claimedDate: null
    });

    setStreakDays(stored.streakDays);
    setLastClaimDate(stored.lastClaimDate);
    setClaimedDate(stored.claimedDate);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEY, {
      streakDays,
      lastClaimDate,
      claimedDate
    });
  }, [streakDays, lastClaimDate, claimedDate]);

  const claimedToday = claimedDate === todayKey;

  const handleClaim = () => {
    if (claimedToday) {
      return;
    }

    const nextStreak = lastClaimDate === yesterdayKey ? streakDays + 1 : 1;
    setStreakDays(nextStreak);
    setLastClaimDate(todayKey);
    setClaimedDate(todayKey);
    onCompleteXp(10);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        🔥 {streakDays}
      </Typography>
      <Button variant="contained" onClick={handleClaim} disabled={claimedToday} sx={{ borderRadius: 2 }}>
        +1 dia
      </Button>
    </Box>
  );
};

const WaterChallenge = ({ onGainXp }: { onGainXp: (xp: number) => void }) => {
  const SIP_ML = 200;
  const TARGET_ML = 3000;
  const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

  const [totalMl, setTotalMl] = useState(0);
  const [lastSipTime, setLastSipTime] = useState<number | null>(null);
  const [waterXp, setWaterXp] = useState(0);
  const [, setTick] = useState(0); // force update for countdown

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  const elapsed = lastSipTime ? now - lastSipTime : Infinity;
  const remainingMs = Math.max(0, COOLDOWN_MS - elapsed);

  const canSip = totalMl < TARGET_ML && (lastSipTime === null || elapsed >= COOLDOWN_MS);

  const handleSip = () => {
    if (!canSip) return;
    setTotalMl((v) => Math.min(TARGET_ML, v + SIP_ML));
    setLastSipTime(Date.now());
    setWaterXp((x) => x + 5);
    onGainXp(5);
  };

  const formatMs = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const progress = (totalMl / TARGET_ML) * 100;

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Desafio: Beber Água (3L)
          </Typography>
        </Box>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {totalMl / 1000}L / 3L
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2, mt: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Goles: {Math.floor(totalMl / SIP_ML)} • +5 XP por gole
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSip}
              disabled={!canSip}
              sx={{ borderRadius: 2 }}
            >
              Beber 200ml
            </Button>
            {!canSip && lastSipTime && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Próximo gole em {formatMs(remainingMs)}
              </Typography>
            )}
          </Box>
        </Box>
        {waterXp > 0 && (
          <Typography variant="body2" color="success.main">
            XP ganho: +{waterXp}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default function Jornada() {
  const navigate = useNavigate();

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

  const [totalXp, setTotalXp] = useState(user.xp);
  const [selectedConquestIndex, setSelectedConquestIndex] = useState<number | null>(null);
  const [isDailyExpanded, setIsDailyExpanded] = useState(true);
  const [isWeeklyExpanded, setIsWeeklyExpanded] = useState(true);
  const [isConquestExpanded, setIsConquestExpanded] = useState(true);

  const handleGainXp = (xp: number) => {
    setTotalXp((prev) => prev + xp);
  };

  // Desafios semanais
  const desafiosSemanais = [
    {
      titulo: '3 Sessões de Mindfulness',
      xp: 150,
      progresso: 2,
      total: 3,
      percentual: 66
    }
  ];

  // Conquistas recentes
  const conquistas = [
    { titulo: 'Primeiros passos', data: '2 dias atrás', icone: '🌟' },
    { titulo: 'Mestre da respiração', data: 'Hoje', icone: '🧘' }
  ];

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
            variant="outlined"
            startIcon={<EmojiEventsIcon />}
            onClick={() => navigate('/recompensas')}
            sx={{ borderRadius: 2 }}
          >
            Ver Recompensas
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Coluna principal (esquerda) */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Desafios Diários: Respiração + Água */}
            <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
              <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2, color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Desafios Diários
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setIsDailyExpanded(!isDailyExpanded)}
                    sx={{ color: 'white' }}
                    endIcon={isDailyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                  </Button>
                </Box>
              </Box>
              {isDailyExpanded && (
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <BreathingExercise onComplete={handleGainXp} />
                    <WaterChallenge onGainXp={handleGainXp} />
                    <DailyWordsMission onCompleteXp={handleGainXp} />
                  </Box>
                </CardContent>
              )}
            </Card>

          {/* Desafios Semanais */}
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
            <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2, color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Desafios Semanais
                </Typography>
                <Button
                  size="small"
                  onClick={() => setIsWeeklyExpanded(!isWeeklyExpanded)}
                  sx={{ color: 'white' }}
                  endIcon={isWeeklyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                </Button>
              </Box>
            </Box>
            {isWeeklyExpanded && (
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {desafiosSemanais.map((desafio, index) => (
                    <Grid size={{ xs: 12 }} key={index}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'grey.50',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
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
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <MoodChallenge onCompleteXp={handleGainXp} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            )}
          </Card>

          {/* Seu equilíbrio semanal */}
          <Card sx={{ borderRadius: 2, bgcolor: 'success.light', color: 'white' }}>
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
          <Card sx={{ mb: 3, borderRadius: 2, textAlign: 'center' }}>
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
                  <Typography variant="body2" fontWeight={600}>{totalXp} / {user.xpProximo}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (totalXp / user.xpProximo) * 100)}
                  sx={{ height: 8, borderRadius: 2 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Próximo Nível: {user.xpProximo}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, gap: 1 }}>
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
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                    {user.level}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">NÍVEL</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}>
            <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2, color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Conquistas Recentes
                </Typography>
                <Button
                  size="small"
                  onClick={() => setIsConquestExpanded(!isConquestExpanded)}
                  sx={{ color: 'white' }}
                  endIcon={isConquestExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                </Button>
              </Box>
            </Box>
            {isConquestExpanded && (
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {conquistas.map((conquista, index) => (
                  <Grid size={{ xs: 12 }} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={() => setSelectedConquestIndex(selectedConquestIndex === index ? null : index)}
                    >
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {conquista.icone}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {conquista.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conquista.data}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {selectedConquestIndex !== null && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'success.light' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {conquistas[selectedConquestIndex].titulo}
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    {conquistas[selectedConquestIndex].data}
                  </Typography>
                </Box>
              )}
              <StreakChallenge onCompleteXp={handleGainXp} />
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EmojiEventsIcon />}
                sx={{ mt: 3, borderRadius: 2 }}
                onClick={() => navigate('/recompensas')}
              >
                Resgatar Pontos
              </Button>
              <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                Troque seus {user.pontos} pts por prêmios
              </Typography>
            </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}