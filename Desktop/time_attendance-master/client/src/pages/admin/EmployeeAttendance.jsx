import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Today as TodayIcon,
  EventBusy as EventBusyIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const EmployeeAttendance = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: endOfMonth(new Date())
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual data from your API
  const [employee, setEmployee] = useState({
    id: employeeId,
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Software Developer',
    department: 'Engineering',
    joinDate: '2022-01-15',
    status: 'active'
  });

  // Mock attendance data
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, date: '2023-07-10', checkIn: '09:05', checkOut: '18:15', status: 'present', hoursWorked: '9h 10m', late: '5m' },
    { id: 2, date: '2023-07-09', checkIn: '09:15', checkOut: '18:00', status: 'present', hoursWorked: '8h 45m', late: '15m' },
    { id: 3, date: '2023-07-08', checkIn: '09:00', checkOut: '17:45', status: 'present', hoursWorked: '8h 45m', late: '0m' },
    { id: 4, date: '2023-07-07', checkIn: '09:30', checkOut: '18:30', status: 'present', hoursWorked: '9h 0m', late: '30m' },
    { id: 5, date: '2023-07-06', checkIn: '-', checkOut: '-', status: 'absent', hoursWorked: '0h 0m', late: '-' },
    { id: 6, date: '2023-07-05', checkIn: '09:10', checkOut: '17:50', status: 'present', hoursWorked: '8h 40m', late: '10m' },
    { id: 7, date: '2023-07-04', checkIn: '09:00', checkOut: '18:00', status: 'present', hoursWorked: '9h 0m', late: '0m' },
    { id: 8, date: '2023-07-03', checkIn: '09:20', checkOut: '18:10', status: 'present', hoursWorked: '8h 50m', late: '20m' },
    { id: 9, date: '2023-07-02', checkIn: '-', checkOut: '-', status: 'weekend', hoursWorked: '0h 0m', late: '-' },
    { id: 10, date: '2023-07-01', checkIn: '-', checkOut: '-', status: 'weekend', hoursWorked: '0h 0m', late: '-' },
  ]);

  const filteredData = attendanceData.filter(record => {
    // Filter by status
    if (statusFilter !== 'all' && record.status !== statusFilter) {
      return false;
    }
    
    // Filter by date range
    const recordDate = new Date(record.date);
    if (dateRange.startDate && recordDate < dateRange.startDate) return false;
    if (dateRange.endDate && recordDate > dateRange.endDate) return false;
    
    // Filter by search term (date)
    if (searchTerm && !record.date.includes(searchTerm)) {
      return false;
    }
    
    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (date, type) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    // Refresh data from API
    console.log('Refreshing data...');
    // Add your API call here
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting data...');
    toast.success('Export started successfully');
  };

  const getStatusChip = (status) => {
    const statusMap = {
      present: { label: 'Present', color: 'success' },
      absent: { label: 'Absent', color: 'error' },
      late: { label: 'Late', color: 'warning' },
      weekend: { label: 'Weekend', color: 'info' },
      holiday: { label: 'Holiday', color: 'secondary' },
      'on-leave': { label: 'On Leave', color: 'info' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    
    return (
      <Chip 
        label={statusInfo.label} 
        size="small" 
        color={statusInfo.color} 
        variant="outlined"
      />
    );
  };

  // Calculate summary stats
  const summaryStats = {
    totalDays: attendanceData.length,
    present: attendanceData.filter(r => r.status === 'present').length,
    absent: attendanceData.filter(r => r.status === 'absent').length,
    late: attendanceData.filter(r => r.late && r.late !== '0m' && r.late !== '-').length,
    averageHours: '8.5h'
  };

  return (
    <Box>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 1 }}
        >
          Back to Employees
        </Button>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="/admin/employees" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/employees');
            }}
            underline="hover"
          >
            Employees
          </Link>
          <Typography color="text.primary">
            {employee.name}'s Attendance
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {employee.name}'s Attendance
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Days</Typography>
              <Typography variant="h5">{summaryStats.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Present</Typography>
              <Typography variant="h5" color="success.main">
                {summaryStats.present} <small style={{ fontSize: '0.7em', color: 'gray' }}>days</small>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Absent</Typography>
              <Typography variant="h5" color="error.main">
                {summaryStats.absent} <small style={{ fontSize: '0.7em', color: 'gray' }}>days</small>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Hours</Typography>
              <Typography variant="h5">{summaryStats.averageHours}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by date..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              InputProps={{
                startAdornment: (
                  <FilterListIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
              <MenuItem value="late">Late</MenuItem>
              <MenuItem value="on-leave">On Leave</MenuItem>
              <MenuItem value="holiday">Holiday</MenuItem>
              <MenuItem value="weekend">Weekend</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hours Worked</TableCell>
              <TableCell>Late By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => {
                  const recordDate = new Date(record.date);
                  const dayName = format(recordDate, 'EEEE');
                  
                  return (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          {record.date}
                        </Box>
                      </TableCell>
                      <TableCell>{dayName}</TableCell>
                      <TableCell>
                        {record.checkIn !== '-' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                            {record.checkIn}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut !== '-' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                            {record.checkOut}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(record.status)}
                      </TableCell>
                      <TableCell>{record.hoursWorked}</TableCell>
                      <TableCell>{record.late}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => console.log('View details:', record.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default EmployeeAttendance;
