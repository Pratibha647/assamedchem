import React from 'react';

export default function ProductCard({ product, onAction, actionLabel }) {
  if (!product) return null;

  const { name, description, price, quantity, unit } = product;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{name}</h3>
        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-semibold">
          {quantity} {unit}
        </span>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
        {description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          ${Number(price).toFixed(2)}
        </span>
        
        {onAction && actionLabel && (
          <button
            onClick={() => onAction(product)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
