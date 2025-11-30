// FILE: src/components/portfolio/PropertyForm.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AddPropertyForm, PortfolioProperty } from '../../types/portfolio';
import { validatePropertyForm, calculateTotalMonthlyExpenses } from '../../utils/portfolioHelpers';
import { formatDateForInput } from '../../utils/portfolioHelpers';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: AddPropertyForm) => Promise<void>;
  initialData?: PortfolioProperty;
  mode?: 'create' | 'edit';
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<AddPropertyForm>({
    address: '',
    purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    down_payment: 0,
    loan_amount: 0,
    interest_rate: 0,
    loan_term_years: 30,
    monthly_rent: 0,
    monthly_expenses: {
      property_tax: 0,
      insurance: 0,
      maintenance: 0,
      property_management: 0,
      utilities: 0,
      hoa: 0,
      other: 0,
    },
    closing_costs: 0,
    renovation_costs: 0,
    current_value: 0,
    notes: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        address: initialData.address,
        purchase_price: initialData.financials.purchase_price,
        purchase_date: formatDateForInput(initialData.financials.purchase_date),
        down_payment: initialData.financials.down_payment,
        loan_amount: initialData.financials.loan_amount,
        interest_rate: initialData.financials.interest_rate,
        loan_term_years: initialData.financials.loan_term_years,
        monthly_rent: initialData.financials.monthly_rent,
        monthly_expenses: {
          property_tax: initialData.financials.monthly_expenses.property_tax,
          insurance: initialData.financials.monthly_expenses.insurance,
          maintenance: initialData.financials.monthly_expenses.maintenance,
          property_management: initialData.financials.monthly_expenses.property_management,
          utilities: initialData.financials.monthly_expenses.utilities || 0,
          hoa: initialData.financials.monthly_expenses.hoa || 0,
          other: initialData.financials.monthly_expenses.other || 0,
        },
        closing_costs: initialData.financials.closing_costs,
        renovation_costs: initialData.financials.renovation_costs,
        current_value: initialData.financials.current_value,
        notes: initialData.notes || '',
        tags: initialData.tags || [],
      });
    } else {
      setFormData({
        address: '',
        purchase_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        down_payment: 0,
        loan_amount: 0,
        interest_rate: 0,
        loan_term_years: 30,
        monthly_rent: 0,
        monthly_expenses: {
          property_tax: 0,
          insurance: 0,
          maintenance: 0,
          property_management: 0,
          utilities: 0,
          hoa: 0,
          other: 0,
        },
        closing_costs: 0,
        renovation_costs: 0,
        current_value: 0,
        notes: '',
        tags: [],
      });
    }
    setTagInput('');
    setErrors({});
  }, [initialData, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePropertyForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Failed to save property' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      monthly_expenses: {
        ...formData.monthly_expenses,
        [field]: value,
      },
    });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const totalExpenses = calculateTotalMonthlyExpenses(formData.monthly_expenses);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add Property' : 'Edit Property'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main St, City, State ZIP"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Purchase Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.purchase_price || ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.purchase_price ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.purchase_price && <p className="mt-1 text-sm text-red-500">{errors.purchase_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <input
                type="number"
                value={formData.down_payment || ''}
                onChange={(e) => setFormData({ ...formData, down_payment: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.down_payment ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.down_payment && <p className="mt-1 text-sm text-red-500">{errors.down_payment}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount
              </label>
              <input
                type="number"
                value={formData.loan_amount || ''}
                onChange={(e) => setFormData({ ...formData, loan_amount: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.loan_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.loan_amount && <p className="mt-1 text-sm text-red-500">{errors.loan_amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={formData.interest_rate || ''}
                onChange={(e) => setFormData({ ...formData, interest_rate: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.interest_rate ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="100"
                step="0.01"
              />
              {errors.interest_rate && <p className="mt-1 text-sm text-red-500">{errors.interest_rate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (Years)
              </label>
              <input
                type="number"
                value={formData.loan_term_years || ''}
                onChange={(e) => setFormData({ ...formData, loan_term_years: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="1"
              />
            </div>

            {/* Rental Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.monthly_rent || ''}
                onChange={(e) => setFormData({ ...formData, monthly_rent: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.monthly_rent ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.monthly_rent && <p className="mt-1 text-sm text-red-500">{errors.monthly_rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Value
              </label>
              <input
                type="number"
                value={formData.current_value || ''}
                onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.current_value ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.current_value && <p className="mt-1 text-sm text-red-500">{errors.current_value}</p>}
            </div>

            {/* Monthly Expenses */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expenses</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Tax</label>
              <input
                type="number"
                value={formData.monthly_expenses.property_tax || ''}
                onChange={(e) => handleExpenseChange('property_tax', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
              <input
                type="number"
                value={formData.monthly_expenses.insurance || ''}
                onChange={(e) => handleExpenseChange('insurance', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance</label>
              <input
                type="number"
                value={formData.monthly_expenses.maintenance || ''}
                onChange={(e) => handleExpenseChange('maintenance', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Management</label>
              <input
                type="number"
                value={formData.monthly_expenses.property_management || ''}
                onChange={(e) => handleExpenseChange('property_management', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Utilities</label>
              <input
                type="number"
                value={formData.monthly_expenses.utilities || ''}
                onChange={(e) => handleExpenseChange('utilities', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HOA</label>
              <input
                type="number"
                value={formData.monthly_expenses.hoa || ''}
                onChange={(e) => handleExpenseChange('hoa', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other</label>
              <input
                type="number"
                value={formData.monthly_expenses.other || ''}
                onChange={(e) => handleExpenseChange('other', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Total Monthly Expenses: <span className="text-lg font-semibold">${totalExpenses.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Additional Costs */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Costs</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Closing Costs</label>
              <input
                type="number"
                value={formData.closing_costs || ''}
                onChange={(e) => setFormData({ ...formData, closing_costs: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Renovation Costs</label>
              <input
                type="number"
                value={formData.renovation_costs || ''}
                onChange={(e) => setFormData({ ...formData, renovation_costs: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>

            {/* Notes and Tags */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Additional notes about this property..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Add Property' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

