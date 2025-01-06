import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Link,
} from '@mui/material';
import {
  School as SchoolIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';

const educationalLinks = [
  {
    name: 'Devoir.tn',
    url: 'https://www.devoir.tn',
    description: 'Tunisian educational platform with exams and series',
  },
  {
    name: 'TunisieCollege.net',
    url: 'https://www.tunisiecollege.net',
    description: 'Resources for middle school students',
  },
  {
    name: 'Classi.tn',
    url: 'https://classi.tn',
    description: 'Educational content and exercises',
  },
  {
    name: 'T3alem.tn',
    url: 'https://t3alem.tn',
    description: 'Learning resources and practice materials',
  },
];

function ResourceLinks() {
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          Educational Websites
        </Typography>
        <List>
          {educationalLinks.map((link, index) => (
            <ListItem
              key={index}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {link.name}
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Link>
                }
                secondary={link.description}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default ResourceLinks;
