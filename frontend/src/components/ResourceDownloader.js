import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';

const websites = [
  { value: 'devoir', label: 'Devoir.tn', url: 'https://www.devoir.tn' },
  { value: 'tunisiecollege', label: 'TunisieCollege.net', url: 'https://www.tunisiecollege.net' },
  { value: 'classi', label: 'Classi.tn', url: 'https://classi.tn' },
  { value: 't3alem', label: 'T3alem.tn', url: 'https://t3alem.tn' },
];

const levels = [
  '7ème année',
  '8ème année',
  '9ème année',
  '1ère année',
  '2ème année',
  '3ème année',
  '4ème année',
  'Bac',
];

const subjects = [
  'Mathématiques',
  'Sciences',
  'Physique',
  'Français',
  'Anglais',
  'Arabe',
  'Histoire-Géo',
  'Informatique',
];

function ResourceDownloader() {
  const [activeWebsite, setActiveWebsite] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/resources/search', {
        params: {
          website: websites[activeWebsite].value,
          query: searchQuery,
          level: selectedLevel,
          subject: selectedSubject,
        },
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url) => {
    try {
      window.open(`http://localhost:5000/api/resources/download?url=${encodeURIComponent(url)}`, '_blank');
    } catch (err) {
      setError('Failed to download the resource');
    }
  };

  const handleWebsiteVisit = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          Educational Resources
        </Typography>

        <Tabs
          value={activeWebsite}
          onChange={(e, newValue) => setActiveWebsite(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {websites.map((website, index) => (
            <Tab
              key={website.value}
              label={website.label}
              icon={
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWebsiteVisit(website.url);
                  }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              }
              iconPosition="end"
            />
          ))}
        </Tabs>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Level"
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={2}>
        {results.map((resource, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {resource.title}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip
                    icon={resource.type === 'exam' ? <AssignmentIcon /> : <BookIcon />}
                    label={resource.type}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={resource.source}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {resource.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(resource.url)}
                  size="small"
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {results.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No results found. Try searching for educational resources.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ResourceDownloader;
