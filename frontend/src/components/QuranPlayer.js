import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  PlaylistPlay as PlaylistIcon,
} from '@mui/icons-material';
import YouTube from 'react-youtube';

const surahs = [
  { start: "0:00", name: "Al-Fatiha", arabic: "الفاتحة" },
  { start: "1:20", name: "Al-Baqarah", arabic: "البقرة" },
  { start: "45:30", name: "Ali 'Imran", arabic: "آل عمران" },
  { start: "1:25:15", name: "An-Nisa", arabic: "النساء" },
  { start: "2:05:45", name: "Al-Ma'idah", arabic: "المائدة" },
  { start: "2:35:20", name: "Al-An'am", arabic: "الأنعام" },
  { start: "3:10:40", name: "Al-A'raf", arabic: "الأعراف" },
  // Add more surahs with their timestamps
];

function QuranPlayer() {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const togglePlay = () => {
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (player) {
      player.setVolume(newValue);
    }
  };

  const handleTimeUpdate = () => {
    if (player) {
      setCurrentTime(player.getCurrentTime());
    }
  };

  const playFromTime = (timeString) => {
    if (player) {
      const [minutes, seconds] = timeString.split(':').map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      player.seekTo(timeInSeconds);
      if (!isPlaying) {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  // Convert time string to seconds for sorting
  const timeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours || 0) * 3600 + minutes * 60 + seconds;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Quran Player
        </Typography>
        <Box sx={{ mb: 2 }}>
          <YouTube
            videoId="HKufFW1wapk"
            opts={opts}
            onReady={onReady}
            onStateChange={(e) => {
              setIsPlaying(e.data === 1);
              handleTimeUpdate();
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton onClick={togglePlay} size="large">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
              <VolumeIcon sx={{ mr: 1 }} />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
                min={0}
                max={100}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PlaylistIcon sx={{ mr: 1 }} />
          Surahs
        </Typography>
        <List>
          {surahs
            .sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start))
            .map((surah, index) => (
            <ListItem
              key={index}
              button
              onClick={() => playFromTime(surah.start)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <PlayIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {surah.name} ({surah.arabic})
                  </Typography>
                }
                secondary={`Start Time: ${surah.start}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default QuranPlayer;
