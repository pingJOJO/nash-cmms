import React from 'react';
import { Priority, WorkOrderStatus, AssetStatus } from '../../types/cmms';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'HIGH':
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white uppercase tracking-wider shadow-xs">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white uppercase tracking-wider shadow-xs">
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-cyan-600 text-white uppercase tracking-wider shadow-xs">
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 uppercase tracking-wider">
          None
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          <span>In Progress</span>
        </div>
      );
    case 'ON_HOLD':
      return (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
          <span>On Hold</span>
        </div>
      );
    case 'OPEN':
      return (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100" />
          <span>Open</span>
        </div>
      );
    case 'COMPLETED':
      return (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-100" />
          <span>Completed</span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>{status}</span>
        </div>
      );
  }
};

export const AssetStatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  switch (status) {
    case 'OPERATIONAL':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider">
          OPERATIONAL
        </span>
      );
    case 'DOWN':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-rose-600 text-white uppercase tracking-wider">
          DOWN
        </span>
      );
    case 'EMERGENCY_SHUTDOWN':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-red-900 text-white uppercase tracking-wider">
          EMERGENCY SHUTDOWN
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-slate-500 text-white uppercase tracking-wider">
          IN STORAGE
        </span>
      );
  }
};
