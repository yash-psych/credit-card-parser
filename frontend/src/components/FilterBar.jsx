import React from 'react';

const FilterBar = ({ issuer, period, onIssuerChange, onPeriodChange, onClearFilters }) => {
  const issuers = ['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'American Express'];
  const periods = [
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Issuer Filter */}
        <div className="flex-1 w-full lg:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Bank/Issuer
          </label>
          <select
            value={issuer || ''}
            onChange={(e) => onIssuerChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Issuers</option>
            {issuers.map((iss) => (
              <option key={iss} value={iss}>
                {iss}
              </option>
            ))}
          </select>
        </div>

        {/* Period Filter */}
        <div className="flex-1 w-full lg:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={period === p.value}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        {(issuer || period) && (
          <div className="w-full lg:w-auto lg:mt-7">
            <button
              onClick={onClearFilters}
              className="w-full lg:w-auto px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(issuer || period) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Active Filters: 
            {issuer && <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Bank: {issuer}</span>}
            {period && <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Period: {periods.find(p => p.value === period)?.label}</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
