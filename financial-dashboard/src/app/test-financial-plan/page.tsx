'use client';

import { FinancialPlanMasterV2 } from '@/components/FinancialPlanV2/FinancialPlanMasterV2';
import { Toaster } from 'react-hot-toast';

export default function TestFinancialPlanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <FinancialPlanMasterV2 />
      </div>
    </div>
  );
}
