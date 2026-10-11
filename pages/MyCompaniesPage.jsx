import React, { useState } from 'react';
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
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { CompanyModal } from '../components/company/CompanyModal';
import { CompanyDetailModal } from '../components/company/CompanyDetailModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  formatINR,
  calculateEmploymentDuration,
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

  // Filter companies
  const filteredCompanies = companies.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.department && comp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || comp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleArchive = (comp) => {
    const newStatus = comp.status === 'Current' ? 'Left' : 'Current';
    updateCompany(comp.id, {
      status: newStatus,
      leavingDate: newStatus === 'Current' ? '' : new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Companies & Employment History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your employment history, salary rates, working hours, and tenure calculations
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition self-start sm:self-auto active:scale-95"
        >
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, role, department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          >
            <option value="ALL">All Statuses ({companies.length})</option>
            <option value="Current">Current Companies</option>
            <option value="Left">Past / Left Companies</option>
          </select>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((company) => {
          const tenure = calculateEmploymentDuration(company.joiningDate, company.leavingDate);
          const isActive = company.id === activeCompanyId;

          return (
            <div
              key={company.id}
              className={`rounded-2xl border bg-white dark:bg-dark-900 p-5 shadow-xs transition-all duration-200 flex flex-col justify-between relative ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                      {company.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {company.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {company.role}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${
                      company.status === 'Current'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {company.status}
                  </span>
                </div>

                {/* Duration Snippet */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                      <Calendar size={14} className="text-blue-500" />
                      <span>{tenure.formatted}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {tenure.range}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Monthly Salary</span>
                    <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {formatINR(company.monthlySalary)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Daily Rate</span>
                    <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {formatINR(company.dailySalaryRate)} / day
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Overtime Rate</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {formatINR(company.overtimeRate)} / hr
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Standard Hours</span>
                    <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {company.standardWorkingHours} hrs / day
                    </span>
                  </div>
                </div>

                {company.location && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveCompanyId(company.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{isActive ? 'Active Company' : 'Select'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingCompany(company)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => handleArchive(company)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title={company.status === 'Current' ? 'Mark as Left / Previous' : 'Mark as Current'}
                  >
                    <Archive size={16} />
                  </button>

                  <button
                    onClick={() => setEditingCompany(company)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit company"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(company)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete company"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Building2 size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No companies found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'Try adjusting your search criteria' : 'Add your first company to start tracking attendance and salary'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
          >
            + Add Company
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
        message={`Are you sure you want to delete ${deleteTarget?.name}? All associated attendance, overtime, and payment records for this company will also be removed.`}
        confirmText="Delete Company"
      />
    </div>
  );
}
