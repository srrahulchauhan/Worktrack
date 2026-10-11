import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { formatINR } from '../../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function PaymentModal({
  isOpen,
  onClose,
  paymentToEdit = null,
  isPartialPaymentMode = false,
}) {
  const { companies, activeCompany, addPayment, updatePayment, addPartialPayment } = useWorkTrack();

  const [formData, setFormData] = useState({
    companyId: activeCompany?.id || '',
    salaryMonth: dayjs().format('YYYY-MM'),
    expectedSalary: '75000',
    overtimeEarnings: '0',
    bonuses: '0',
    deductions: '0',
    amountReceived: '0',
    paymentDate: dayjs().format('YYYY-MM-DD'),
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer (NEFT)',
    notes: '',
  });

  const [partialData, setPartialData] = useState({
    amount: '',
    date: dayjs().format('YYYY-MM-DD'),
    method: 'Bank Transfer (NEFT)',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentToEdit) {
      setFormData({
        companyId: paymentToEdit.companyId,
        salaryMonth: paymentToEdit.salaryMonth,
        expectedSalary: paymentToEdit.expectedSalary?.toString() || '0',
        overtimeEarnings: paymentToEdit.overtimeEarnings?.toString() || '0',
        bonuses: paymentToEdit.bonuses?.toString() || '0',
        deductions: paymentToEdit.deductions?.toString() || '0',
        amountReceived: paymentToEdit.amountReceived?.toString() || '0',
        paymentDate: paymentToEdit.paymentDate || dayjs().format('YYYY-MM-DD'),
        paymentStatus: paymentToEdit.paymentStatus || 'Pending',
        paymentMethod: paymentToEdit.paymentMethod || 'Bank Transfer',
        notes: paymentToEdit.notes || '',
      });
      // Default partial amount to pending amount
      const pending = Math.max(0, (paymentToEdit.netExpectedSalary || 0) - (paymentToEdit.amountReceived || 0));
      setPartialData({
        amount: pending > 0 ? pending.toString() : '',
        date: dayjs().format('YYYY-MM-DD'),
        method: 'Bank Transfer (NEFT)',
        notes: 'Partial installment payment',
      });
    } else {
      const comp = activeCompany || companies[0];
      setFormData({
        companyId: comp?.id || '',
        salaryMonth: dayjs().format('YYYY-MM'),
        expectedSalary: comp?.monthlySalary?.toString() || '60000',
        overtimeEarnings: '0',
        bonuses: '0',
        deductions: '0',
        amountReceived: '0',
        paymentDate: dayjs().format('YYYY-MM-DD'),
        paymentStatus: 'Pending',
        paymentMethod: 'Bank Transfer (NEFT)',
        notes: '',
      });
    }
    setError('');
  }, [paymentToEdit, isOpen, activeCompany, companies]);

  const expected = Number(formData.expectedSalary) || 0;
  const ot = Number(formData.overtimeEarnings) || 0;
  const bonus = Number(formData.bonuses) || 0;
  const deduct = Number(formData.deductions) || 0;
  const netExpected = expected + ot + bonus - deduct;
  const received = Number(formData.amountReceived) || 0;
  const pending = Math.max(0, netExpected - received);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isPartialPaymentMode && paymentToEdit) {
      const pAmt = Number(partialData.amount) || 0;
      if (pAmt <= 0) {
        setError('Please enter a valid installment amount.');
        return;
      }
      addPartialPayment(paymentToEdit.id, partialData);
      onClose();
      return;
    }

    if (!formData.companyId) {
      setError('Please select a company.');
      return;
    }

    if (paymentToEdit) {
      updatePayment(paymentToEdit.id, formData);
    } else {
      addPayment(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isPartialPaymentMode
                  ? 'Record Payment Installment'
                  : paymentToEdit
                  ? 'Edit Salary Payment Record'
                  : 'Add Salary Payment Tracker'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPartialPaymentMode
                  ? `Pending salary: ${formatINR(pending)}`
                  : 'Track expected vs credited salary and payment status'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Partial Payment Mode */}
        {isPartialPaymentMode && paymentToEdit ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 block">
                  Outstanding Pending
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatINR(pending)}
                </span>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                Month: <span className="font-bold text-slate-700 dark:text-slate-200">{paymentToEdit.salaryMonth}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Installment Amount (₹) *
              </label>
              <input
                type="number"
                value={partialData.amount}
                onChange={(e) => setPartialData({ ...partialData, amount: e.target.value })}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={partialData.date}
                  onChange={(e) => setPartialData({ ...partialData, date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={partialData.method}
                  onChange={(e) => setPartialData({ ...partialData, method: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Installment Notes
              </label>
              <input
                type="text"
                value={partialData.notes}
                onChange={(e) => setPartialData({ ...partialData, notes: e.target.value })}
                placeholder="e.g. 1st installment, advance salary adjustment..."
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
              >
                Add Installment
              </button>
            </div>
          </form>
        ) : (
          /* Full Record Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Calculation Ribbon */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Expected</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">{formatINR(netExpected)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Received</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{formatINR(received)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending</span>
                <span className={`text-sm font-bold mt-0.5 block ${pending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {formatINR(pending)}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company *
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => {
                    const compId = e.target.value;
                    const comp = companies.find((c) => c.id === compId);
                    setFormData((prev) => ({
                      ...prev,
                      companyId: compId,
                      expectedSalary: comp?.monthlySalary?.toString() || prev.expectedSalary,
                    }));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Month */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Salary Month (YYYY-MM) *
                </label>
                <input
                  type="month"
                  value={formData.salaryMonth}
                  onChange={(e) => setFormData({ ...formData, salaryMonth: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Base Expected Salary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Expected Salary (₹)
                </label>
                <input
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Overtime Earnings */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overtime Earnings (₹)
                </label>
                <input
                  type="number"
                  value={formData.overtimeEarnings}
                  onChange={(e) => setFormData({ ...formData, overtimeEarnings: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Bonuses / Incentives */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bonuses / Performance Incentives (₹)
                </label>
                <input
                  type="number"
                  value={formData.bonuses}
                  onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Deductions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deductions (PF, Tax, etc.) (₹)
                </label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received So Far (₹)
                </label>
                <input
                  type="number"
                  value={formData.amountReceived}
                  onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment / Expected Date
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Reference ID
              </label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Salary credited via corporate account ref: TXN893247..."
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
              >
                {paymentToEdit ? 'Update Payment' : 'Save Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
