import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { SpendWastageAction } from '../types';

interface TotalJobMetricsTableProps {
  actions: SpendWastageAction[];
}

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

export const TotalJobMetricsTable: React.FC<TotalJobMetricsTableProps> = ({ actions }) => {
  // First, get unique jobs by job_id and action, keeping only the latest record for each
  const uniqueJobs = actions.reduce((acc, action) => {
    const key = `${action.job_id}-${action.action}`;
    if (!acc[key] || new Date(action.pause_date) > new Date(acc[key].pause_date)) {
      acc[key] = action;
    }
    return acc;
  }, {} as Record<string, SpendWastageAction>);

  // Convert back to array and calculate metrics
  const metrics = Object.values(uniqueJobs).reduce((acc, action) => {
    const reason = getReason(action);
    const key = `${action.action}-${reason}`;

    if (!acc[key]) {
      acc[key] = {
        action: action.action,
        reason: reason,
        jobCount: 0,
        totalApplies: 0,
        totalNetSpend: 0
      };
    }

    acc[key].jobCount++;
    if (action.action === 'PAUSE_JOB_PUBLISHER') {
      acc[key].totalApplies += action.stats.TG.tg_mtd_applies;
      acc[key].totalNetSpend += action.stats.TG.tg_mtd_net_spend;
    }

    return acc;
  }, {} as Record<string, {
    action: string;
    reason: string;
    jobCount: number;
    totalApplies: number;
    totalNetSpend: number;
  }>);

  // Sort metrics: paused jobs first, then resumed jobs, and by reason alphabetically
  const sortedMetrics = Object.values(metrics).sort((a, b) => {
    if (a.action === 'PAUSE_JOB_PUBLISHER' && b.action !== 'PAUSE_JOB_PUBLISHER') return -1;
    if (a.action !== 'PAUSE_JOB_PUBLISHER' && b.action === 'PAUSE_JOB_PUBLISHER') return 1;
    return a.reason.localeCompare(b.reason);
  });

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Total Job Metrics
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Job Count</TableCell>
              <TableCell align="right">Total Applies</TableCell>
              <TableCell align="right">Total Net Spend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMetrics.map((metric, index) => (
              <TableRow key={index}>
                <TableCell>{metric.action}</TableCell>
                <TableCell>{metric.reason}</TableCell>
                <TableCell align="right">{metric.jobCount}</TableCell>
                <TableCell align="right">
                  {metric.action === 'PAUSE_JOB_PUBLISHER' ? metric.totalApplies : '-'}
                </TableCell>
                <TableCell align="right">
                  {metric.action === 'PAUSE_JOB_PUBLISHER' ? metric.totalNetSpend.toFixed(2) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}; 