import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Archive,
  Search,
  Briefcase,
  Timer,
  LayoutGrid,
  List,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { CompanyModal } from '../components/company/CompanyModal';
import { CompanyDetailModal } from '../components/company/CompanyDetailModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  formatINR,
  formatDate,
  calculateEmploymentDuration,
  calculateTotalExperience,
} from '../utils/workTrackCalculations';

export function MyCompaniesPage() {
  const {
    companies,
    activeCompanyId,
    setActiveCompanyId,
    deleteCompany,
    updateCompany,
  } = useWorkTrack();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Summary statistics
  const totalStats = useMemo(() => {
    const activeCount = companies.filter(
      (c) => c.status === 'Active' || c.status === 'Current' || !c.leavingDate
    ).length;
    const leftCount = companies.length - activeCount;
    const totalExp = calculateTotalExperience(companies);

    return {
      total: companies.length,
      activeCount,
      leftCount,
      totalExpFormatted: totalExp.formatted || '0 days',
    };
  }, [companies]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        comp.name?.toLowerCase().includes(q) ||
        comp.role?.toLowerCase().includes(q) ||
        comp.department?.toLowerCase().includes(q) ||
        comp.location?.toLowerCase().includes(q);

      const isActive =
        comp.status === 'Active' || comp.status === 'Current' || !comp.leavingDate;

      let matchesStatus = true;
      if (statusFilter === 'Active') {
        matchesStatus = isActive;
      } else if (statusFilter === 'Left') {
        matchesStatus = !isActive;
      }

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const toggleCurrentlyWorking = (comp) => {
    const currentlyActive =
      comp.status === 'Active' || comp.status === 'Current' || !comp.leavingDate;
    const nextActive = !currentlyActive;

    updateCompany(comp.id, {
      status: nextActive ? 'Active' : 'Left Company',
      isCurrentlyWorking: nextActive,
      leavingDate: nextActive ? '' : new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Profile Management
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {companies.length} {companies.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Company Profile Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Add and manage your employment history, joining & leaving dates, tenure duration in years, months & days, and compensation rates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition self-start sm:self-auto active:scale-95"
        >
          <Plus size={18} />
          <span>Add Company Profile</span>
        </button>
      </div>

      {/* Overview Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Companies
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalStats.total}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Saved in persistent storage
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Active Companies
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalStats.activeCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Currently working
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Left Company
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Archive size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 mt-2">
            {totalStats.leftCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Past employment records
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Total Career Tenure
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 truncate">
            {totalStats.totalExpFormatted}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Cumulative experience
          </span>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, role, department, location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-dark-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'Active'
                  ? 'bg-white dark:bg-dark-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Active ({totalStats.activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('Left')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'Left'
                  ? 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Left ({totalStats.leftCount})
            </button>
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-dark-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Detailed Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => {
            const isActiveCompany = company.id === activeCompanyId;
            const isCurrentlyWorking =
              company.status === 'Active' ||
              company.status === 'Current' ||
              !company.leavingDate;

            const tenure = calculateEmploymentDuration(
              company.joiningDate,
              isCurrentlyWorking ? '' : company.leavingDate
            );

            return (
              <div
                key={company.id}
                className={`rounded-3xl border bg-white dark:bg-dark-900 p-5 sm:p-6 shadow-xs transition-all duration-200 flex flex-col justify-between relative hover:shadow-lg ${
                  isActiveCompany
                    ? 'border-blue-500 ring-2 ring-blue-500/25 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-950/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header: Avatar, Name, Role & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-blue-500/20">
                        {company.name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                            {company.name}
                          </h4>
                          {isActiveCompany && (
                            <span
                              className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
                              title="Active Tracking Selection"
                            />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                          {company.role || 'Employee'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border shrink-0 flex items-center gap-1.5 ${
                        isCurrentlyWorking
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCurrentlyWorking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{isCurrentlyWorking ? 'Active' : 'Left Company'}</span>
                    </span>
                  </div>

                  {/* Employment Duration Highlight Banner */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-cyan-50/40 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/20 border border-blue-200/70 dark:border-blue-800/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <Timer size={13} />
                        <span>Employment Duration</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        {tenure.range}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                      {tenure.formatted}
                    </div>

                    {tenure.isValid && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 dark:bg-dark-900 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                          {tenure.years}y
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 dark:bg-dark-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                          {tenure.months}m
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 dark:bg-dark-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/40">
                          {tenure.days}d
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Joining & Leaving Dates Display */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-dark-950/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Joining Date
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {formatDate(company.joiningDate, 'DD MMM YYYY')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-dark-950/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Leaving Date
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {isCurrentlyWorking
                          ? 'Present'
                          : formatDate(company.leavingDate, 'DD MMM YYYY')}
                      </span>
                    </div>
                  </div>

                  {/* Rates Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Monthly Salary</span>
                      <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                        {formatINR(company.monthlySalary)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Overtime Rate</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                        {formatINR(company.overtimeRate)}/hr
                      </span>
                    </div>
                  </div>

                  {company.location && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{company.location}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Edit, Delete, View, Select) */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveCompanyId(company.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      isActiveCompany
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>{isActiveCompany ? 'Active Selection' : 'Select'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingCompany(company)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="View Complete Company Profile"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => toggleCurrentlyWorking(company)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title={isCurrentlyWorking ? 'Mark as Left Company' : 'Mark as Active / Currently Working'}
                    >
                      <Archive size={16} />
                    </button>

                    <button
                      onClick={() => setEditingCompany(company)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Company Profile"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(company)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete Company Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Leaving Date</th>
                  <th className="py-3.5 px-4">Employment Duration</th>
                  <th className="py-3.5 px-4">Monthly Salary</th>
                  <th className="py-3.5 px-4">Overtime Rate</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCompanies.map((comp) => {
                  const isActiveCompany = comp.id === activeCompanyId;
                  const isCurrentlyWorking =
                    comp.status === 'Active' || comp.status === 'Current' || !comp.leavingDate;
                  const tenure = calculateEmploymentDuration(
                    comp.joiningDate,
                    isCurrentlyWorking ? '' : comp.leavingDate
                  );

                  return (
                    <tr
                      key={comp.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-dark-950/40 transition ${
                        isActiveCompany ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {comp.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {comp.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {comp.role || 'Employee'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border inline-flex items-center gap-1.5 ${
                            isCurrentlyWorking
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCurrentlyWorking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isCurrentlyWorking ? 'Active' : 'Left Company'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(comp.joiningDate, 'DD MMM YYYY')}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {isCurrentlyWorking ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Present
                          </span>
                        ) : (
                          formatDate(comp.leavingDate, 'DD MMM YYYY')
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        <div>
                          <span>{tenure.formatted}</span>
                          <span className="block text-[10px] font-semibold text-slate-400">
                            {tenure.range}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {formatINR(comp.monthlySalary)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {formatINR(comp.overtimeRate)}/hr
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveCompanyId(comp.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              isActiveCompany
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600'
                            }`}
                            title="Select as Active"
                          >
                            {isActiveCompany ? 'Active' : 'Select'}
                          </button>

                          <button
                            onClick={() => setViewingCompany(comp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => setEditingCompany(comp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Record"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(comp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">
            No company profiles found
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm
              ? 'No companies match your current search or status filter. Try clearing filters.'
              : 'Add your first company profile to track employment dates, tenure calculation, and attendance.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            + Add Company Profile
          </button>
        </div>
      )}

      {/* Modals */}
      <CompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <CompanyModal
        isOpen={Boolean(editingCompany)}
        companyToEdit={editingCompany}
        onClose={() => setEditingCompany(null)}
      />

      <CompanyDetailModal
        isOpen={Boolean(viewingCompany)}
        company={viewingCompany}
        onClose={() => setViewingCompany(null)}
        onEdit={(comp) => {
          setViewingCompany(null);
          setEditingCompany(comp);
        }}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCompany(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Company Profile"
        message={`Are you sure you want to delete ${deleteTarget?.name}? All associated attendance, overtime, and payment records for this company will also be permanently removed.`}
        confirmText="Delete Profile"
      />
    </div>
  );
}

export default MyCompaniesPage;
