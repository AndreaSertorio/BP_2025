'use client';

import React from 'react';
import type { Competitor } from '@/types/competitor.types';

interface CompetitorDetailProps {
  competitor: Competitor;
  onClose: () => void;
}

export default function CompetitorDetail({ competitor, onClose }: CompetitorDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{competitor.shortName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-2">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Founded:</span> {competitor.companyInfo?.founded || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">Employees:</span> {competitor.companyInfo?.employees?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>

          {/* Products */}
          {competitor.products && competitor.products.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2">Products</h3>
              {competitor.products.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 mb-2">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.category}</div>
                  {product.priceRange && (
                    <div className="text-blue-600 mt-1">{product.priceRange}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {competitor.notes && (
            <div>
              <h3 className="text-lg font-bold mb-2">Notes</h3>
              <p className="text-gray-700">{competitor.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
