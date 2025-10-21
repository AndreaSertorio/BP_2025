/**
 * Cash Flow Statement Card Component
 * 
 * Visualizza il Rendiconto Finanziario completo con:
 * - Operating Cash Flow (da operazioni)
 * - Investing Cash Flow (investimenti)
 * - Financing Cash Flow (finanziamenti)
 * - Burn Rate e Runway
 */

'use client';

import React from 'react';
import { 
  CashFlowStatement, 
  formatCurrencyK,
  formatMonths 
} from '@/services/cashFlowCalculations';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet
} from 'lucide-react';

interface CashFlowStatementCardProps {
  data: CashFlowStatement;
  showBreakdown?: boolean;
  compact?: boolean;
}

export default function CashFlowStatementCard({
  data,
  showBreakdown = true,
  compact = false
}: CashFlowStatementCardProps) {
  
  const { 
    period, 
    operatingCF, 
    investingCF, 
    financingCF,
    cashBeginning,
    netCashFlow,
    cashEnding,
    burnRate,
    runway,
    cashFlowPositive
  } = data;
  
  // Status colors
  const cashFlowColor = cashFlowPositive ? 'text-green-600' : 'text-red-600';
  const cashFlowBg = cashFlowPositive ? 'bg-green-50' : 'bg-red-50';
  const runwayColor = runway > 18 ? 'text-green-600' : runway > 12 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Rendiconto Finanziario
            </h3>
            <p className="text-sm text-gray-500">{period}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${cashFlowBg}`}>
          {cashFlowPositive ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Cash Flow Positivo</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Cash Burn</span>
            </>
          )}
        </div>
      </div>
      
      {/* Cash Flow Waterfall */}
      <div className="space-y-3">
        {/* Cassa Iniziale */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Cassa Iniziale</span>
          </div>
          <span className="font-semibold text-gray-900">
            {formatCurrencyK(cashBeginning)}
          </span>
        </div>
        
        {/* Operating Cash Flow */}
        <div className="ml-4 border-l-2 border-blue-300 pl-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800">Operating Cash Flow</span>
            </div>
            <span className={`font-semibold ${operatingCF.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {operatingCF.operatingCashFlow >= 0 ? '+' : ''}{formatCurrencyK(operatingCF.operatingCashFlow)}
            </span>
          </div>
          
          {showBreakdown && !compact && (
            <div className="ml-6 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>EBITDA</span>
                <span>{formatCurrencyK(operatingCF.ebitda)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>+ Ammortamenti</span>
                <span className="text-green-600">+{formatCurrencyK(operatingCF.addBackDepreciation)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>- Variazione WC</span>
                <span className="text-red-600">{formatCurrencyK(operatingCF.workingCapitalChange)}</span>
              </div>
              {operatingCF.interestPaid !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>- Interessi</span>
                  <span className="text-red-600">{formatCurrencyK(operatingCF.interestPaid)}</span>
                </div>
              )}
              {operatingCF.taxesPaid !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>- Tasse</span>
                  <span className="text-red-600">{formatCurrencyK(operatingCF.taxesPaid)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Investing Cash Flow */}
        <div className="ml-4 border-l-2 border-purple-300 pl-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-800">Investing Cash Flow</span>
            </div>
            <span className={`font-semibold ${investingCF.totalInvestingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investingCF.totalInvestingCashFlow >= 0 ? '+' : ''}{formatCurrencyK(investingCF.totalInvestingCashFlow)}
            </span>
          </div>
          
          {showBreakdown && !compact && (
            <div className="ml-6 space-y-1 text-sm">
              {investingCF.capex !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>CAPEX (Attrezzature)</span>
                  <span className="text-red-600">{formatCurrencyK(investingCF.capex)}</span>
                </div>
              )}
              {investingCF.intangibleInvestments !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>IP & Software</span>
                  <span className="text-red-600">{formatCurrencyK(investingCF.intangibleInvestments)}</span>
                </div>
              )}
              {investingCF.assetSales !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>+ Vendita Asset</span>
                  <span className="text-green-600">+{formatCurrencyK(investingCF.assetSales)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Financing Cash Flow */}
        <div className="ml-4 border-l-2 border-green-300 pl-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-800">Financing Cash Flow</span>
            </div>
            <span className={`font-semibold ${financingCF.totalFinancingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financingCF.totalFinancingCashFlow >= 0 ? '+' : ''}{formatCurrencyK(financingCF.totalFinancingCashFlow)}
            </span>
          </div>
          
          {showBreakdown && !compact && (
            <div className="ml-6 space-y-1 text-sm">
              {financingCF.equityRaised !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>+ Equity Raised</span>
                  <span className="text-green-600">+{formatCurrencyK(financingCF.equityRaised)}</span>
                </div>
              )}
              {financingCF.debtRaised !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>+ Nuovi Prestiti</span>
                  <span className="text-green-600">+{formatCurrencyK(financingCF.debtRaised)}</span>
                </div>
              )}
              {financingCF.debtRepayments !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>- Rimborsi</span>
                  <span className="text-red-600">{formatCurrencyK(financingCF.debtRepayments)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Net Cash Flow */}
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-900">Variazione Netta Cassa</span>
          </div>
          <span className={`font-bold text-lg ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netCashFlow >= 0 ? '+' : ''}{formatCurrencyK(netCashFlow)}
          </span>
        </div>
        
        {/* Cassa Finale */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-700" />
            <span className="font-semibold text-blue-900">Cassa Finale</span>
          </div>
          <span className="font-bold text-xl text-blue-700">
            {formatCurrencyK(cashEnding)}
          </span>
        </div>
      </div>
      
      {/* Metrics Footer */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          {/* Burn Rate */}
          {burnRate > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Zap className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Burn Rate</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrencyK(burnRate)}/mese
                </p>
              </div>
            </div>
          )}
          
          {/* Runway */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              runway > 18 ? 'bg-green-50' : runway > 12 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <TrendingDown className={`w-4 h-4 ${runwayColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Runway</p>
              <p className={`text-lg font-semibold ${runwayColor}`}>
                {formatMonths(runway)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert se runway basso */}
      {runway < 12 && runway > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Runway Basso</p>
            <p className="text-yellow-700 mt-1">
              Con burn rate attuale, la cassa durerà {formatMonths(runway)}. 
              Considera di pianificare un round di finanziamento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
