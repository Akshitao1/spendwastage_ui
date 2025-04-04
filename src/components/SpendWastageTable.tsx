import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Box,
  Chip,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SpendWastageAction } from '../types';

interface SpendWastageTableProps {
  actions: SpendWastageAction[];
}

interface JobRowProps {
  action: SpendWastageAction;
}

interface FilterState {
  jobTitle: string[];
  jobRef: string[];
  jobGroup: string[];
  publisher: string[];
  action: string[];
  reason: string[];
}

const JobRow: React.FC<JobRowProps> = ({ action }) => {
  const [open, setOpen] = useState(false);

  const getReason = (action: SpendWastageAction): string => {
    // Return empty string for resumed jobs
    if (action.action === 'RESUME_JOB_PUBLISHER') {
      return '';
    }

    const tgMtdNetSpend = action.stats.TG.tg_mtd_net_spend;
    const tgMtdApplies = action.stats.TG.tg_mtd_applies;
    const applicationPerDollar = action.rules.application_per_dollar;

    if (tgMtdApplies === 0) {
      return "CTA for job is low, No Applies";
    } else if (tgMtdApplies > 0 && (tgMtdNetSpend / tgMtdApplies) > (1/applicationPerDollar)) {
      return "Trading_Group_Pub_CPA is greater than JG_Pub_CPA";
    }
    return "Unknown reason";
  };

  const reason = getReason(action);

  // Create a unique key for each action
  const getUniqueKey = (action: SpendWastageAction) => 
    `${action.job_id}-${action.placement_id}-${action.action}-${action.pause_date}`;

  return (
    <>
      <TableRow 
        sx={{ '& > *': { borderBottom: 'unset' } }}
        key={getUniqueKey(action)}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{action.job_title}</TableCell>
        <TableCell>{action.job_ref_number}</TableCell>
        <TableCell>{action.job_group_name}</TableCell>
        <TableCell>{action.publisher_name}</TableCell>
        <TableCell>{action.action}</TableCell>
        <TableCell>{new Date(action.pause_date).toLocaleDateString()}</TableCell>
        <TableCell align="right">
          {action.action === 'PAUSE_JOB_PUBLISHER' ? action.stats.TG.tg_mtd_applies : '-'}
        </TableCell>
        <TableCell align="right">
          {action.action === 'PAUSE_JOB_PUBLISHER' ? action.stats.TG.tg_mtd_net_spend.toFixed(2) : '-'}
        </TableCell>
        <TableCell align="right">
          {action.action === 'PAUSE_JOB_PUBLISHER' ? action.stats.TG.active_days : '-'}
        </TableCell>
        <TableCell>{reason}</TableCell>
      </TableRow>
      <TableRow key={`${getUniqueKey(action)}-details`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Job Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Job ID</Typography>
                  <Typography variant="body2">{action.job_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Job Group ID</Typography>
                  <Typography variant="body2">{action.job_group_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Job Category</Typography>
                  <Typography variant="body2">{action.job_category}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body2">{`${action.job_city}, ${action.job_state}, ${action.job_country}`}</Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface ClientRowProps {
  clientName: string;
  clientActions: SpendWastageAction[];
}

const ClientRow: React.FC<ClientRowProps> = ({ clientName, clientActions }) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    jobTitle: [],
    jobRef: [],
    jobGroup: [],
    publisher: [],
    action: [],
    reason: []
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<keyof FilterState | null>(null);

  // Calculate statistics
  const uniqueJobGroups = new Set(clientActions.map(action => action.job_group_id)).size;
  const publisherNames = Array.from(new Set(clientActions.map(action => action.publisher_name))).join(', ');
  
  // Calculate counts for resumed and paused jobs
  const resumedJobsCount = clientActions.filter(action => action.action === 'RESUME_JOB_PUBLISHER').length;
  const pausedJobsCount = clientActions.filter(action => action.action === 'PAUSE_JOB_PUBLISHER').length;

  // Get the reason for an action
  const getReason = (action: SpendWastageAction): string => {
    // Only return reasons for paused jobs
    if (action.action !== 'PAUSE_JOB_PUBLISHER') {
      return '';
    }

    const tgMtdNetSpend = action.stats.TG.tg_mtd_net_spend;
    const tgMtdApplies = action.stats.TG.tg_mtd_applies;
    const applicationPerDollar = action.rules.application_per_dollar;

    if (tgMtdApplies === 0) {
      return "CTA for job is low, No Applies";
    } else if (tgMtdApplies > 0 && (tgMtdNetSpend / tgMtdApplies) > (1/applicationPerDollar)) {
      return "Trading_Group_Pub_CPA is greater than JG_Pub_CPA";
    }
    return "Unknown reason";
  };

  // Get distinct reasons with counts and CPA values
  const reasonsWithCounts = clientActions.reduce((acc, action) => {
    const reason = getReason(action);
    // Skip empty reasons (resumed jobs)
    if (!reason) return acc;
    
    if (!acc[reason]) {
      acc[reason] = {
        count: 0,
        tradingGroupCpa: 0,
        jgCpa: 0
      };
    }
    acc[reason].count++;
    
    // Store CPA values for Trading_Group_Pub_CPA reason
    if (reason === "Trading_Group_Pub_CPA is greater than JG_Pub_CPA") {
      const tgMtdNetSpend = action.stats.TG.tg_mtd_net_spend;
      const tgMtdApplies = action.stats.TG.tg_mtd_applies;
      const applicationPerDollar = action.rules.application_per_dollar;
      
      // Calculate Trading_Group_Pub_CPA
      const tradingGroupCpa = tgMtdApplies > 0 ? tgMtdNetSpend / tgMtdApplies : 0;
      // Calculate JG_Pub_CPA
      const jgCpa = 1 / applicationPerDollar;
      
      acc[reason].tradingGroupCpa = tradingGroupCpa;
      acc[reason].jgCpa = jgCpa;
    }
    return acc;
  }, {} as Record<string, { count: number; tradingGroupCpa: number; jgCpa: number }>);

  // Get unique values for each column
  const uniqueValues = {
    jobTitle: Array.from(new Set(clientActions.map(action => action.job_title))),
    jobRef: Array.from(new Set(clientActions.map(action => action.job_ref_number))),
    jobGroup: Array.from(new Set(clientActions.map(action => action.job_group_name))),
    publisher: Array.from(new Set(clientActions.map(action => action.publisher_name))),
    action: Array.from(new Set(clientActions.map(action => action.action))),
    reason: Array.from(new Set(clientActions.map(action => getReason(action)))).filter(Boolean)
  };

  // Filter actions based on current filters
  const filteredActions = clientActions.filter(action => {
    // If no filters are selected for a column, include all values for that column
    if (filters.jobTitle.length > 0 && !filters.jobTitle.includes(action.job_title)) return false;
    if (filters.jobRef.length > 0 && !filters.jobRef.includes(action.job_ref_number)) return false;
    if (filters.jobGroup.length > 0 && !filters.jobGroup.includes(action.job_group_name)) return false;
    if (filters.publisher.length > 0 && !filters.publisher.includes(action.publisher_name)) return false;
    if (filters.action.length > 0 && !filters.action.includes(action.action)) return false;
    if (filters.reason.length > 0 && !filters.reason.includes(getReason(action))) return false;
    return true;
  });

  // Sort filtered actions by action and pause_date in descending order
  const sortedActions = [...filteredActions].sort((a, b) => {
    // First sort by action (RESUME comes first)
    if (a.action === 'RESUME_JOB_PUBLISHER' && b.action !== 'RESUME_JOB_PUBLISHER') return -1;
    if (a.action !== 'RESUME_JOB_PUBLISHER' && b.action === 'RESUME_JOB_PUBLISHER') return 1;
    
    // Then sort by pause_date in descending order
    return new Date(b.pause_date).getTime() - new Date(a.pause_date).getTime();
  });

  // Create a unique key for each action
  const getUniqueKey = (action: SpendWastageAction) => 
    `${action.job_id}-${action.placement_id}-${action.action}-${action.pause_date}`;

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(filter => filter.length > 0);

  const handleFilterChange = (value: string) => {
    if (!activeFilter) return;
    
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[activeFilter].includes(value)) {
        // Remove the value if it's already selected
        newFilters[activeFilter] = newFilters[activeFilter].filter(v => v !== value);
      } else {
        // Add the value if it's not selected
        newFilters[activeFilter] = [...newFilters[activeFilter], value];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      jobTitle: [],
      jobRef: [],
      jobGroup: [],
      publisher: [],
      action: [],
      reason: []
    });
    setAnchorEl(null);
    setActiveFilter(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>, filterKey: keyof FilterState) => {
    setAnchorEl(event.currentTarget);
    setActiveFilter(filterKey);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setActiveFilter(null);
  };

  const FilterMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleFilterClose}
      PaperProps={{
        style: {
          maxHeight: 300,
          width: 250,
        },
      }}
    >
      {activeFilter && uniqueValues[activeFilter].map((value) => (
        <MenuItem key={value} dense>
          <Checkbox
            edge="start"
            checked={filters[activeFilter].includes(value)}
            onChange={() => handleFilterChange(value)}
            size="small"
          />
          <ListItemText primary={value} />
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {clientName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {resumedJobsCount > 0 && (
                <Chip 
                  label={`${resumedJobsCount} Job${resumedJobsCount !== 1 ? 's' : ''} Resumed`} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              )}
              {pausedJobsCount > 0 && (
                <Chip 
                  label={`${pausedJobsCount} Job${pausedJobsCount !== 1 ? 's' : ''} Paused`} 
                  size="small" 
                  color="error" 
                  variant="outlined" 
                />
              )}
              <Chip 
                label={`${uniqueJobGroups} Job Group${uniqueJobGroups !== 1 ? 's' : ''}`} 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
              <Chip 
                label={publisherNames} 
                size="small" 
                color="info" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </TableCell>
        <TableCell colSpan={8}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            width: '100%',
            justifyContent: 'flex-end'
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.7rem',
                color: 'black',
                fontStyle: 'italic'
              }}
            >
              REASON(S):
            </Typography>
            <Box 
              sx={{ 
                height: '80%',
                display: 'flex',
                alignItems: 'center',
                mx: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem',
                  color: 'black',
                  borderLeft: '1px solid',
                  borderColor: 'black',
                  height: '100%',
                  opacity: 0.5
                }}
              />
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 0.25,
              fontSize: '0.65rem',
              alignItems: 'flex-end'
            }}>
              {Object.entries(reasonsWithCounts).map(([reason, data]) => (
                <Typography key={reason} variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  {reason === "Trading_Group_Pub_CPA is greater than JG_Pub_CPA" 
                    ? `Trading_Group_Pub_CPA ${data.tradingGroupCpa.toFixed(2)} is greater than JG_Pub_CPA ${data.jgCpa.toFixed(2)} (${data.count})`
                    : `${reason} (${data.count})`}
                </Typography>
              ))}
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2 
              }}>
                <Typography variant="subtitle2">Jobs Table</Typography>
                {hasActiveFilters && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon color="primary" fontSize="small" />
                    <Typography variant="caption" color="primary">
                      Filters Active
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={clearFilters}
                      sx={{ color: 'grey.500' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Job Title
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'jobTitle')}
                            sx={{ 
                              color: filters.jobTitle.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Job Ref
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'jobRef')}
                            sx={{ 
                              color: filters.jobRef.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Job Group
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'jobGroup')}
                            sx={{ 
                              color: filters.jobGroup.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Publisher
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'publisher')}
                            sx={{ 
                              color: filters.publisher.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Action
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'action')}
                            sx={{ 
                              color: filters.action.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>Pause Date</TableCell>
                    <TableCell align="right">Applies</TableCell>
                    <TableCell align="right">Net Spend</TableCell>
                    <TableCell align="right">Active Days</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Reason
                        <Tooltip title="Filter">
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, 'reason')}
                            sx={{ 
                              color: filters.reason.length > 0 ? 'primary.main' : 'grey.500'
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedActions.map((action) => (
                    <JobRow 
                      key={getUniqueKey(action)} 
                      action={action} 
                    />
                  ))}
                </TableBody>
              </Table>
              <FilterMenu />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const SpendWastageTable: React.FC<SpendWastageTableProps> = ({ actions }) => {
  // Group actions by client name and filter out duplicate jobs
  const groupedActions = actions.reduce((acc, action) => {
    const clientName = action.client_name || 'Unknown Client';
    if (!acc[clientName]) {
      acc[clientName] = [];
    }

    // Check if we already have this job_id and action combination
    const existingJobIndex = acc[clientName].findIndex(
      a => a.job_id === action.job_id && a.action === action.action
    );

    if (existingJobIndex === -1) {
      // If job doesn't exist, add it
      acc[clientName].push(action);
    } else {
      // If job exists, keep the one with the latest pause_date
      const existingJob = acc[clientName][existingJobIndex];
      if (new Date(action.pause_date) > new Date(existingJob.pause_date)) {
        acc[clientName][existingJobIndex] = action;
      }
    }

    return acc;
  }, {} as Record<string, SpendWastageAction[]>);

  if (actions.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No spend wastage actions found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="medium">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Client Name</TableCell>
            <TableCell colSpan={8} />
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedActions).map(([clientName, clientActions]) => (
            <ClientRow key={clientName} clientName={clientName} clientActions={clientActions} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 