import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const priorities = [
  { value: 'high', label: 'High', color: 'error' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'low', label: 'Low', color: 'success' },
];

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function TodoList() {
  const [subjects, setSubjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [todoForm, setTodoForm] = useState({
    title: '',
    priority: 'medium',
    estimated_time: '',
    deadline: '',
    notes: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchSubjects();
    fetchTodos();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      const url = selectedSubject
        ? `${config.apiUrl}/todos?subject_id=${selectedSubject}`
        : `${config.apiUrl}/todos`;
      const response = await axios.get(url);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      await axios.post(`${config.apiUrl}/subjects`, { name: newSubject });
      setNewSubject('');
      fetchSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await axios.delete(`${config.apiUrl}/subjects/${subjectId}`);
      fetchSubjects();
      if (selectedSubject === subjectId) {
        setSelectedSubject('');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleOpenTodoDialog = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      setTodoForm({
        title: todo.title,
        priority: todo.priority,
        estimated_time: todo.estimated_time || '',
        deadline: todo.deadline || '',
        notes: todo.notes || '',
        status: todo.status,
      });
    } else {
      setEditingTodo(null);
      setTodoForm({
        title: '',
        priority: 'medium',
        estimated_time: '',
        deadline: '',
        notes: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseTodoDialog = () => {
    setOpenDialog(false);
    setEditingTodo(null);
  };

  const handleSubmitTodo = async () => {
    try {
      if (editingTodo) {
        await axios.put(`${config.apiUrl}/todos/${editingTodo.id}`, todoForm);
      } else {
        await axios.post(`${config.apiUrl}/todos`, {
          ...todoForm,
          subject_id: selectedSubject,
        });
      }
      handleCloseTodoDialog();
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`${config.apiUrl}/todos/${todoId}`);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Subjects
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              label="New Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSubject}
            >
              Add Subject
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {subjects.map((subject) => (
        <Paper key={subject.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              {subject.name}
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedSubject(subject.id);
                  handleOpenTodoDialog();
                }}
                sx={{ mr: 1 }}
              >
                Add Todo
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeleteSubject(subject.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {todos
              .filter((todo) => todo.subject_id === subject.id)
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((todo) => (
                <Grid item xs={12} sm={6} md={4} key={todo.id}>
                  <Card 
                    sx={{ 
                      borderLeft: 4,
                      borderColor: (theme) => {
                        switch (todo.priority) {
                          case 'high':
                            return theme.palette.error.main;
                          case 'medium':
                            return theme.palette.warning.main;
                          case 'low':
                            return theme.palette.success.main;
                          default:
                            return theme.palette.grey[500];
                        }
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {todo.title}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={todo.priority.toUpperCase()}
                          color={
                            priorities.find((p) => p.value === todo.priority)?.color
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={statuses.find(s => s.value === todo.status)?.label}
                          variant="outlined"
                          size="small"
                          color={todo.status === 'completed' ? 'success' : 'default'}
                        />
                      </Box>
                      {todo.estimated_time && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {todo.estimated_time}
                          </Typography>
                        </Box>
                      )}
                      {todo.deadline && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <EventIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {todo.deadline}
                          </Typography>
                        </Box>
                      )}
                      {todo.notes && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                          {todo.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenTodoDialog(todo)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTodo(todo.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            {todos.filter((todo) => todo.subject_id === subject.id).length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No todos yet. Click "Add Todo" to create one.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}

      {subjects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No subjects yet. Add a subject to get started.
          </Typography>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseTodoDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTodo ? 'Edit Todo' : 'New Todo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={todoForm.title}
              onChange={(e) =>
                setTodoForm({ ...todoForm, title: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={todoForm.priority}
                label="Priority"
                onChange={(e) =>
                  setTodoForm({ ...todoForm, priority: e.target.value })
                }
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={todoForm.status}
                label="Status"
                onChange={(e) =>
                  setTodoForm({ ...todoForm, status: e.target.value })
                }
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Estimated Time"
              value={todoForm.estimated_time}
              onChange={(e) =>
                setTodoForm({ ...todoForm, estimated_time: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Deadline"
              type="date"
              value={todoForm.deadline}
              onChange={(e) =>
                setTodoForm({ ...todoForm, deadline: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={todoForm.notes}
              onChange={(e) =>
                setTodoForm({ ...todoForm, notes: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTodoDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitTodo}
            variant="contained"
            disabled={!todoForm.title}
          >
            {editingTodo ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TodoList;
