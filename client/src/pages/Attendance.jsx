import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  useTheme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { getMyAttendance, checkIn, checkOut } from '../features/attendance/attendanceSlice';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'on-leave', label: 'On Leave' },
];

const Attendance = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { attendance, todayAttendance, loading } = useSelector((state) => state.attendance);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  // Fetch attendance data on component mount
  useEffect(() => {
    dispatch(getMyAttendance());
  }, [dispatch]);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      await dispatch(getMyAttendance());
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (todayAttendance?._id) {
      try {
        await dispatch(checkOut(todayAttendance._id)).unwrap();
        await dispatch(getMyAttendance());
      } catch (error) {
        console.error('Check-out failed:', error);
      }
    }
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort attendance data
  const filteredAttendance = React.useMemo(() => {
    return attendance
      .filter((record) => {
        // Filter by status
        const statusMatch = statusFilter === 'all' || record.status === statusFilter;
        
        // Filter by date range
        const recordDate = new Date(record.date);
        const dateMatch = isWithinInterval(recordDate, {
          start: dateFilter.startDate,
          end: dateFilter.endDate,
        });

        // Filter by search term (date or notes)
        const searchMatch = 
          searchTerm === '' ||
          format(recordDate, 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        return statusMatch && dateMatch && searchMatch;
      })
      .sort((a, b) => {
        // Sort by selected column
        let comparison = 0;
        if (orderBy === 'date') {
          comparison = new Date(a.date) - new Date(b.date);
        } else if (orderBy === 'checkIn' && a.checkIn && b.checkIn) {
          comparison = new Date(a.checkIn) - new Date(b.checkIn);
        } else if (orderBy === 'checkOut' && a.checkOut && b.checkOut) {
          comparison = new Date(a.checkOut) - new Date(b.checkOut);
        } else if (orderBy === 'totalHours' && a.totalHours && b.totalHours) {
          comparison = parseFloat(a.totalHours) - parseFloat(b.totalHours);
        } else if (orderBy === 'status') {
          comparison = a.status.localeCompare(b.status);
        }
        
        // Apply sort order
        return order === 'asc' ? comparison : -comparison;
      });
  }, [attendance, statusFilter, dateFilter, searchTerm, order, orderBy]);

  // Get status chip color
  const getStatusChip = (status) => {
    switch (status) {
      case 'present':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Present"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case 'late':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Late"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
      case 'absent':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Absent"
            color="error"
            size="small"
            variant="outlined"
          />
        );
      case 'half-day':
        return (
          <Chip
            icon={<AccessTimeIcon />}
            label="Half Day"
            color="info"
            size="small"
            variant="outlined"
          />
        );
      case 'on-leave':
        return (
          <Chip
            label="On Leave"
            color="secondary"
            size="small"
            variant="outlined"
          />
        );
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return format(new Date(timeString), 'hh:mm a');
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Check if today's attendance is recorded
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const hasCheckedOutToday = todayAttendance?.checkIn && todayAttendance?.checkOut;
  const isTodayWeekend = [0, 6].includes(new Date().getDay());

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          My Attendance
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(getMyAttendance())} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccessTimeIcon />}
            onClick={hasCheckedInToday ? handleCheckOut : handleCheckIn}
            disabled={loading || hasCheckedOutToday || isTodayWeekend}
            sx={{ minWidth: 150 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : hasCheckedInToday ? (
              'Check Out'
            ) : hasCheckedOutToday ? (
              'Checked Out Today'
            ) : isTodayWeekend ? (
              'Weekend'
            ) : (
              'Check In'
            )}
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filters" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by date or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateFilter.startDate}
                  onChange={(date) =>
                    setDateFilter({ ...dateFilter, startDate: date })
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateFilter.endDate}
                  onChange={(date) =>
                    setDateFilter({ ...dateFilter, endDate: date })
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'desc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'checkIn'}
                      direction={orderBy === 'checkIn' ? order : 'desc'}
                      onClick={() => handleRequestSort('checkIn')}
                    >
                      Check In
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'checkOut'}
                      direction={orderBy === 'checkOut' ? order : 'desc'}
                      onClick={() => handleRequestSort('checkOut')}
                    >
                      Check Out
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'totalHours'}
                      direction={orderBy === 'totalHours' ? order : 'desc'}
                      onClick={() => handleRequestSort('totalHours')}
                    >
                      Total Hours
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading attendance records...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => {
                      const recordDate = new Date(record.date);
                      const isToday = isSameDay(recordDate, new Date());
                      
                      return (
                        <TableRow 
                          key={record._id}
                          hover
                          sx={{
                            backgroundColor: isToday ? theme.palette.action.selected : 'inherit',
                            '&:hover': {
                              backgroundColor: isToday 
                                ? theme.palette.action.selectedHover 
                                : theme.palette.action.hover,
                            },
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatDate(record.date)}
                              </Typography>
                              {isToday && (
                                <Chip 
                                  label="Today" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {format(recordDate, 'EEEE')}
                          </TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
                          <TableCell>{formatTime(record.checkIn)}</TableCell>
                          <TableCell>{formatTime(record.checkOut)}</TableCell>
                          <TableCell>
                            {record.totalHours ? `${record.totalHours} hrs` : '--'}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{
                                maxWidth: 200,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {record.notes || '--'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredAttendance.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Attendance;
