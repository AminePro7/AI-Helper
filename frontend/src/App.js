import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Stack,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  List,
  CssBaseline,
  useTheme,
  Switch,
  Tooltip,
  Zoom,
  Fade,
} from '@mui/material';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import {
  Translate as TranslateIcon,
  School as SchoolIcon,
  Slideshow as SlideshowIcon,
  PlayArrow as PlayArrowIcon,
  ListAlt as ListAltIcon,
  ContentCopy as ContentCopyIcon,
  SwapHoriz as SwapHorizIcon,
  Add as AddIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Menu as MenuIcon,
  Language as LanguageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from './config';
import TodoList from './components/TodoList';
import QuranPlayer from './components/QuranPlayer';
import ResourceLinks from './components/ResourceLinks';
import Timer from './components/Timer';
import { translations } from './translations';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'muiltr',
});

const drawerWidth = 240;

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [sidebarOpen, setSidebarOpen] = useState(localStorage.getItem('sidebarOpen') !== 'false');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = translations[language];
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState(0);
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [concept, setConcept] = useState('');
  const [conceptLanguage, setConceptLanguage] = useState('english');
  const [explanation, setExplanation] = useState('');
  const [presentationTopic, setPresentationTopic] = useState('');
  const [presentationType, setPresentationType] = useState('powerpoint');
  const [presentationLanguage, setPresentationLanguage] = useState('english');
  const [presentationContent, setPresentationContent] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [todoTimeFrame, setTodoTimeFrame] = useState('week');
  const [todoLanguage, setTodoLanguage] = useState('english');
  const [todoList, setTodoList] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
    { value: 'english', label: 'English' },
  ];

  const presentationTypes = [
    { value: 'powerpoint', label: 'PowerPoint' },
    { value: 'project', label: 'Project Report' },
  ];

  const timeFrames = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'semester', label: 'Semester' },
  ];

  const menuItems = [
    { icon: <TranslateIcon />, text: t.translate },
    { icon: <SchoolIcon />, text: t.explainConcept },
    { icon: <SlideshowIcon />, text: t.generatePresentation },
    { icon: <ListAltIcon />, text: t.todoList },
    { icon: <PlayArrowIcon />, text: t.quranPlayer },
    { icon: <ContentCopyIcon />, text: t.educationalLinks },
    { icon: <TimerIcon />, text: t.timers },
  ];

  const customTheme = createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: darkMode ? '#121212' : '#f5f5f5',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
  },
    typography: {
      fontFamily: isRtl 
        ? '"Noto Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minHeight: 48,
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t.appTitle}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((menuItem, index) => (
          <ListItem button selected={activeTab === index} onClick={() => setActiveTab(index)} key={index}>
            <ListItemIcon>
              {menuItem.icon}
            </ListItemIcon>
            <ListItemText primary={menuItem.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Stack spacing={1}>
          <Tooltip title={language === 'en' ? t.switchToArabic : t.switchToEnglish}>
            <Button
              startIcon={<LanguageIcon />}
              onClick={toggleLanguage}
              fullWidth
              variant="outlined"
            >
              {language === 'en' ? 'عربي' : 'English'}
            </Button>
          </Tooltip>
          <Tooltip title={darkMode ? t.lightMode : t.darkMode}>
            <Button
              startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              onClick={toggleDarkMode}
              fullWidth
              variant="outlined"
            >
              {darkMode ? t.lightMode : t.darkMode}
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  const handleTranslate = async () => {
    if (!inputText || !targetLanguage) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/translate`, {
        text: inputText,
        targetLanguage,
      });
      setTranslatedText(response.data.translatedText);
    } catch (err) {
      setError(err.response?.data?.error || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!concept) {
      setError('Please enter a concept to explain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/explain`, {
        concept,
        language: conceptLanguage,
      });
      setExplanation(response.data.explanation);
    } catch (err) {
      setError(err.response?.data?.error || 'Explanation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePresentation = async () => {
    if (!presentationTopic) {
      setError('Please enter a topic for the presentation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/generate-presentation`, {
        topic: presentationTopic,
        language: presentationLanguage,
        presentationType: presentationType,
      });
      setPresentationContent(response.data.presentationContent);
    } catch (err) {
      setError(err.response?.data?.error || 'Presentation generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleDeleteSubject = (subjectToDelete) => {
    setSubjects(subjects.filter((subject) => subject !== subjectToDelete));
  };

  const handleGenerateTodos = async () => {
    if (subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/generate-todos`, {
        subjects,
        timeFrame: todoTimeFrame,
        language: todoLanguage,
      });
      setTodoList(response.data.todos);
    } catch (err) {
      setError(err.response?.data?.error || 'Todo list generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
              ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={isMobile ? handleDrawerToggle : toggleSidebar}
                sx={{ mr: 2 }}
              >
                {isMobile ? (
                  <MenuIcon />
                ) : (
                  sidebarOpen ? (
                    isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />
                  ) : (
                    <MenuIcon />
                  )
                )}
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                {[t.translate, t.explainConcept, t.generatePresentation, t.todoList, t.quranPlayer, t.educationalLinks, t.timers][activeTab]}
              </Typography>
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{
              width: { sm: sidebarOpen ? drawerWidth : 0 },
              flexShrink: { sm: 0 },
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="persistent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
              open={sidebarOpen}
            >
              {drawer}
            </Drawer>
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
              mt: { xs: 8, sm: 8 },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box>
                {activeTab === 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label={t.inputText}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />

                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>{t.targetLanguage}</InputLabel>
                      <Select
                        value={targetLanguage}
                        label={t.targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleTranslate}
                      disabled={loading}
                      sx={{ mt: 2 }}
                      startIcon={loading ? <CircularProgress size={20} /> : <SwapHorizIcon />}
                    >
                      {loading ? t.translating : t.translate}
                    </Button>

                    {translatedText && (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          label={t.translation}
                          value={translatedText}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <IconButton
                          onClick={() => copyToClipboard(translatedText)}
                          sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                )}
                {activeTab === 1 && (
                  <Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={t.concept}
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder={t.conceptPlaceholder}
                    />

                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>{t.conceptLanguage}</InputLabel>
                      <Select
                        value={conceptLanguage}
                        label={t.conceptLanguage}
                        onChange={(e) => setConceptLanguage(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleExplain}
                      disabled={loading}
                      sx={{ mt: 2 }}
                      startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
                    >
                      {loading ? t.explaining : t.explainConcept}
                    </Button>

                    {explanation && (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={8}
                          variant="outlined"
                          label={t.explanation}
                          value={explanation}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <IconButton
                          onClick={() => copyToClipboard(explanation)}
                          sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                )}
                {activeTab === 2 && (
                  <Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={t.presentationTopic}
                      value={presentationTopic}
                      onChange={(e) => setPresentationTopic(e.target.value)}
                      placeholder={t.presentationTopicPlaceholder}
                    />

                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>{t.presentationType}</InputLabel>
                      <Select
                        value={presentationType}
                        label={t.presentationType}
                        onChange={(e) => setPresentationType(e.target.value)}
                      >
                        {presentationTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>{t.presentationLanguage}</InputLabel>
                      <Select
                        value={presentationLanguage}
                        label={t.presentationLanguage}
                        onChange={(e) => setPresentationLanguage(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleGeneratePresentation}
                      disabled={loading}
                      sx={{ mt: 2 }}
                      startIcon={loading ? <CircularProgress size={20} /> : <SlideshowIcon />}
                    >
                      {loading ? t.generating : t.generatePresentation}
                    </Button>

                    {presentationContent && (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={12}
                          variant="outlined"
                          label={t.presentationContent}
                          value={presentationContent}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <IconButton
                          onClick={() => copyToClipboard(presentationContent)}
                          sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                )}
                {activeTab === 3 && <TodoList />}
                {activeTab === 4 && <QuranPlayer />}
                {activeTab === 5 && <ResourceLinks />}
                {activeTab === 6 && <Timer language={language} t={translations[language]} />}
                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
