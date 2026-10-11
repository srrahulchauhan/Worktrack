import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Building2,
  History,
  TrendingUp,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { PaymentModal } from '../components/payments/PaymentModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PaymentStatusBadge } from '../components/common/Badge';
import { formatINR, formatDate } from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function SalaryPaymentsPage() {
  const {
    payments,
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    deletePayment,
  } = useWorkTrack();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [partialPaymentTarget, setPartialPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedHistoryPayment, setSelectedHistoryPayment] = useState(null);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      return !activeCompanyId || p.companyId === activeCompanyId;
    }).sort((a, b) => b.salaryMonth.localeCompare(a.salaryMonth));
  }, [payments, activeCompanyId]);

  // Aggregate totals
  const totalNetExpected = filteredPayments.reduce(
    (s, p) => s + (Number(p.netExpectedSalary) || 0),
    0
  );
  const totalReceived = filteredPayments.reduce(
    (s, p) => s + (Number(p.amountReceived) || 0),
    0
  );
  const totalPending = Math.max(0, totalNetExpected - totalReceived);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Salary Payments & Disbursements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track expected vs credited salary, deductions, bonuses, and partial installment receipts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Record New Month Salary</span>
        </button>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Net Expected Salary
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {formatINR(totalNetExpected)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            Base + OT + Bonuses − Deductions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Total Amount Received
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatINR(totalReceived)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            Credited into bank accounts
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${
          totalPending > 0
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/40'
            : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800'
        }`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${
            totalPending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
          }`}>
            Pending / Due Salary
          </span>
          <span className={`text-2xl font-black mt-1 block ${
            totalPending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
          }`}>
            {formatINR(totalPending)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            {totalPending > 0 ? 'Awaiting company disbursement' : 'All salaries fully settled'}
          </span>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Filter Company:</span>
          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {filteredPayments.length} records found
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-dark-950/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Month</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4 text-right">Base Salary</th>
                <th className="py-3.5 px-4 text-right">OT Pay</th>
                <th className="py-3.5 px-4 text-right">Net Expected</th>
                <th className="py-3.5 px-4 text-right">Received</th>
                <th className="py-3.5 px-4 text-right font-black">Pending</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400">
                    <CreditCard size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No salary payment records found</p>
                    <p className="text-xs mt-0.5">Click "Record New Month Salary" to create an entry</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const pending = Math.max(0, (p.netExpectedSalary || 0) - (p.amountReceived || 0));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-950/40">
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {p.salaryMonth}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {p.companyName}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        {formatINR(p.expectedSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-amber-600 dark:text-amber-400 font-medium">
                        {p.overtimeEarnings > 0 ? formatINR(p.overtimeEarnings) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {formatINR(p.netExpectedSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(p.amountReceived)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-extrabold text-rose-600 dark:text-rose-400">
                        {pending > 0 ? formatINR(pending) : '₹0'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <PaymentStatusBadge status={p.paymentStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {p.paymentDate ? formatDate(p.paymentDate, 'DD MMM YYYY') : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {pending > 0 && (
                            <button
                              onClick={() => setPartialPaymentTarget(p)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 hover:bg-blue-100 transition"
                              title="Add partial installment"
                            >
                              + Installment
                            </button>
                          )}

                          {p.paymentHistory && p.paymentHistory.length > 0 && (
                            <button
                              onClick={() => setSelectedHistoryPayment(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="View installment history"
                            >
                              <History size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => setEditingPayment(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit payment"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete payment"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partial Payment History Modal */}
      {selectedHistoryPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment History & Installments
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHistoryPayment.companyName} • Month: {selectedHistoryPayment.salaryMonth}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {(selectedHistoryPayment.paymentHistory || []).map((h, idx) => (
                <div
                  key={h.id || idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {formatINR(h.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {formatDate(h.date, 'DD MMM YYYY')} • {h.method}
                    </span>
                    {h.notes && <span className="text-[10px] text-slate-400 block mt-0.5">{h.notes}</span>}
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedHistoryPayment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <PaymentModal
        isOpen={Boolean(editingPayment)}
        paymentToEdit={editingPayment}
        onClose={() => setEditingPayment(null)}
      />

      <PaymentModal
        isOpen={Boolean(partialPaymentTarget)}
        paymentToEdit={partialPaymentTarget}
        isPartialPaymentMode={true}
        onClose={() => setPartialPaymentTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePayment(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Salary Payment Record"
        message={`Are you sure you want to remove the salary payment record for ${deleteTarget?.salaryMonth}?`}
        confirmText="Delete Record"
      />
    </div>
  );
}
