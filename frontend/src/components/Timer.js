import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const Timer = ({ language, t }) => {
  const [timers, setTimers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [timerName, setTimerName] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const savedTimers = localStorage.getItem('timers');
    if (savedTimers) {
      setTimers(JSON.parse(savedTimers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timers', JSON.stringify(timers));
  }, [timers]);

  const handleAddTimer = () => {
    if (!timerName || (!hours && !minutes && !seconds)) {
      setNotification({
        open: true,
        message: t.timerValidationError,
        severity: 'error',
      });
      return;
    }

    const totalSeconds = 
      (parseInt(hours || 0) * 3600) +
      (parseInt(minutes || 0) * 60) +
      parseInt(seconds || 0);

    const newTimer = {
      id: Date.now(),
      name: timerName,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
    };

    setTimers([...timers, newTimer]);
    handleCloseDialog();
    setNotification({
      open: true,
      message: t.timerCreated,
      severity: 'success',
    });
  };

  const handleDeleteTimer = (id) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const toggleTimer = (id) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        return { ...timer, isRunning: !timer.isRunning };
      }
      return timer;
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        let updated = false;
        const newTimers = prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            updated = true;
            return { ...timer, remaining: timer.remaining - 1 };
          }
          if (timer.isRunning && timer.remaining === 0) {
            // Timer completed
            new Audio('/notification.mp3').play().catch(console.error);
            return { ...timer, isRunning: false };
          }
          return timer;
        });
        return updated ? newTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimerName('');
    setHours('');
    setMinutes('');
    setSeconds('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">{t.timers}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          {t.addTimer}
        </Button>
      </Box>

      <Stack spacing={2}>
        {timers.map((timer) => (
          <Card key={timer.id}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6">{timer.name}</Typography>
                <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                  {formatTime(timer.remaining)}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => toggleTimer(timer.id)} color="primary">
                  {timer.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={() => handleDeleteTimer(timer.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogTitle>{t.addNewTimer}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label={t.timerName}
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t.hours}
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t.minutes}
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                inputProps={{ min: 0, max: 59 }}
              />
              <TextField
                label={t.seconds}
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                inputProps={{ min: 0, max: 59 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t.cancel}</Button>
          <Button onClick={handleAddTimer} variant="contained">{t.add}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Timer;
