'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BalanceSheetItem } from '@/lib/balanceSheet';

interface BalanceSheetTableProps {
  balanceSheets: BalanceSheetItem[];
}

export function BalanceSheetTable({ balanceSheets }: BalanceSheetTableProps) {
  const [expandedSections, setExpandedSections] = useState({
    currentAssets: true,
    fixedAssets: true,
    currentLiabilities: true,
    longTermLiabilities: true,
    equity: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (balanceSheets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stato Patrimoniale Proiettato</CardTitle>
          <CardDescription>Bilancio a 5 anni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun dato disponibile. Assicurati che lo scenario sia caricato correttamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `€${value.toFixed(2)}M`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stato Patrimoniale Proiettato</CardTitle>
            <CardDescription>Bilancio dettagliato a 5 anni (in M€)</CardDescription>
          </div>
          <div className="flex gap-2">
            {balanceSheets.every(bs => Math.abs(bs.checkBalance) < 0.01) ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Bilancio in Equilibrio
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Verifica Equilibrio
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold">Voce</th>
                {balanceSheets.map(bs => (
                  <th key={bs.year} className="text-right py-3 px-4 font-semibold">
                    Anno {bs.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ATTIVITÀ (ASSETS) */}
              <tr className="bg-blue-50">
                <td colSpan={balanceSheets.length + 1} className="py-3 px-4">
                  <span className="text-lg font-bold text-blue-900">ATTIVITÀ (ASSETS)</span>
                </td>
              </tr>

              {/* Current Assets */}
              <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleSection('currentAssets')}>
                <td className="py-2 px-4 font-semibold flex items-center">
                  {expandedSections.currentAssets ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Attività Correnti
                </td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(bs.assets.current.totalCurrent)}
                  </td>
                ))}
              </tr>

              {expandedSections.currentAssets && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Cassa</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.assets.current.cash)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Crediti Clienti</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.assets.current.accountsReceivable)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Magazzino</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.assets.current.inventory)}</td>
                    ))}
                  </tr>
                </>
              )}

              {/* Fixed Assets */}
              <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleSection('fixedAssets')}>
                <td className="py-2 px-4 font-semibold flex items-center">
                  {expandedSections.fixedAssets ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Attività Fisse
                </td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(bs.assets.fixed.netFixed)}
                  </td>
                ))}
              </tr>

              {expandedSections.fixedAssets && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Immobilizzazioni Materiali</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.assets.fixed.ppe)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Immobilizzazioni Immateriali</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.assets.fixed.intangibles)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground text-red-600">(-) Ammortamenti Accumulati</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4 text-red-600">
                        ({formatCurrency(bs.assets.fixed.accumulatedDepreciation)})
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Total Assets */}
              <tr className="border-t-2 border-blue-300 bg-blue-100">
                <td className="py-3 px-4 font-bold text-blue-900">TOTALE ATTIVITÀ</td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-3 px-4 font-bold text-blue-900">
                    {formatCurrency(bs.assets.totalAssets)}
                  </td>
                ))}
              </tr>

              {/* Spacer */}
              <tr><td colSpan={balanceSheets.length + 1} className="py-2"></td></tr>

              {/* PASSIVITÀ (LIABILITIES) */}
              <tr className="bg-orange-50">
                <td colSpan={balanceSheets.length + 1} className="py-3 px-4">
                  <span className="text-lg font-bold text-orange-900">PASSIVITÀ (LIABILITIES)</span>
                </td>
              </tr>

              {/* Current Liabilities */}
              <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleSection('currentLiabilities')}>
                <td className="py-2 px-4 font-semibold flex items-center">
                  {expandedSections.currentLiabilities ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Passività Correnti
                </td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(bs.liabilities.current.totalCurrent)}
                  </td>
                ))}
              </tr>

              {expandedSections.currentLiabilities && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Debiti Fornitori</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.liabilities.current.accountsPayable)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Debiti a Breve Termine</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.liabilities.current.shortTermDebt)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Ratei Passivi</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.liabilities.current.accruedExpenses)}</td>
                    ))}
                  </tr>
                </>
              )}

              {/* Long-term Liabilities */}
              <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleSection('longTermLiabilities')}>
                <td className="py-2 px-4 font-semibold flex items-center">
                  {expandedSections.longTermLiabilities ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Passività a Lungo Termine
                </td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(bs.liabilities.longTerm.totalLongTerm)}
                  </td>
                ))}
              </tr>

              {expandedSections.longTermLiabilities && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Debiti Finanziari a M/L Termine</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.liabilities.longTerm.longTermDebt)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Altre Passività</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.liabilities.longTerm.otherLiabilities)}</td>
                    ))}
                  </tr>
                </>
              )}

              {/* Total Liabilities */}
              <tr className="border-t-2 border-orange-300 bg-orange-100">
                <td className="py-3 px-4 font-bold text-orange-900">TOTALE PASSIVITÀ</td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-3 px-4 font-bold text-orange-900">
                    {formatCurrency(bs.liabilities.totalLiabilities)}
                  </td>
                ))}
              </tr>

              {/* Spacer */}
              <tr><td colSpan={balanceSheets.length + 1} className="py-2"></td></tr>

              {/* PATRIMONIO NETTO (EQUITY) */}
              <tr className="bg-green-50">
                <td colSpan={balanceSheets.length + 1} className="py-3 px-4">
                  <span className="text-lg font-bold text-green-900">PATRIMONIO NETTO (EQUITY)</span>
                </td>
              </tr>

              <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleSection('equity')}>
                <td className="py-2 px-4 font-semibold flex items-center">
                  {expandedSections.equity ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Componenti Equity
                </td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(bs.equity.totalEquity)}
                  </td>
                ))}
              </tr>

              {expandedSections.equity && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Capitale Versato</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className="text-right py-2 px-4">{formatCurrency(bs.equity.paidInCapital)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 pl-12 text-muted-foreground">Utili (Perdite) a Nuovo</td>
                    {balanceSheets.map(bs => (
                      <td key={bs.year} className={`text-right py-2 px-4 ${bs.equity.retainedEarnings < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(bs.equity.retainedEarnings)}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Total Equity */}
              <tr className="border-t-2 border-green-300 bg-green-100">
                <td className="py-3 px-4 font-bold text-green-900">TOTALE PATRIMONIO NETTO</td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-3 px-4 font-bold text-green-900">
                    {formatCurrency(bs.equity.totalEquity)}
                  </td>
                ))}
              </tr>

              {/* Spacer */}
              <tr><td colSpan={balanceSheets.length + 1} className="py-2"></td></tr>

              {/* TOTAL LIABILITIES + EQUITY */}
              <tr className="border-t-4 border-gray-400 bg-gray-200">
                <td className="py-3 px-4 font-bold text-gray-900">TOTALE PASSIVITÀ + PATRIMONIO NETTO</td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className="text-right py-3 px-4 font-bold text-gray-900">
                    {formatCurrency(bs.liabilities.totalLiabilities + bs.equity.totalEquity)}
                  </td>
                ))}
              </tr>

              {/* Balance Check */}
              <tr className="border-t-2 border-dashed border-gray-300 bg-yellow-50">
                <td className="py-2 px-4 font-semibold text-yellow-900">Verifica Equilibrio (Δ)</td>
                {balanceSheets.map(bs => (
                  <td key={bs.year} className={`text-right py-2 px-4 font-semibold ${Math.abs(bs.checkBalance) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(bs.checkBalance)}
                    {Math.abs(bs.checkBalance) < 0.01 && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Note sul Bilancio</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Verifica Equilibrio:</strong> Deve essere prossima a zero (Assets = Liabilities + Equity)</li>
            <li>• <strong>Crediti Clienti:</strong> Calcolati con DSO configurabile nei parametri</li>
            <li>• <strong>Magazzino:</strong> Basato su Inventory Turnover configurabile</li>
            <li>• <strong>Ammortamenti:</strong> Applicati su immobilizzazioni materiali e immateriali</li>
            <li>• <strong>Funding Rounds:</strong> Capitale versato aumenta nei round configurati</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
