'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { calculateFinancialStatements } from '@/lib/balanceSheet';
import { Scenario, AnnualMetrics } from '@/types/financial';
import { TrendingUp, TrendingDown, DollarSign, Building, Wallet } from 'lucide-react';

interface FinancialStatementsProps {
  scenario: Scenario;
  annualData: AnnualMetrics[];
}

export function FinancialStatements({ scenario, annualData }: FinancialStatementsProps) {
  const { balanceSheet, cashFlow } = useMemo(
    () => calculateFinancialStatements(scenario, annualData),
    [scenario, annualData]
  );

  // Prepare chart data for balance sheet
  const balanceSheetChart = balanceSheet.map(sheet => ({
    year: `Y${sheet.year}`,
    assets: sheet.assets.totalAssets,
    liabilities: sheet.liabilities.totalLiabilities,
    equity: sheet.equity.totalEquity,
    currentRatio: sheet.assets.current.totalCurrent / sheet.liabilities.current.totalCurrent
  }));

  // Prepare cash flow waterfall data
  const cashFlowChart = cashFlow.map(cf => ({
    year: `Y${cf.year}`,
    operating: cf.operating.totalOperating,
    investing: cf.investing.totalInvesting,
    financing: cf.financing.totalFinancing,
    netCash: cf.netCashFlow,
    endingCash: cf.endingCash
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="balance-sheet" className="w-full">
        <TabsList>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow Statement</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Evolution</CardTitle>
              <CardDescription>Assets, Liabilities, and Equity over 5 years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={balanceSheetChart}>
                  <defs>
                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="assets" stackId="1" stroke="#10b981" fill="url(#colorAssets)" name="Total Assets" />
                  <Area type="monotone" dataKey="liabilities" stackId="2" stroke="#ef4444" fill="url(#colorLiabilities)" name="Total Liabilities" />
                  <Area type="monotone" dataKey="equity" stackId="2" stroke="#3b82f6" fill="url(#colorEquity)" name="Total Equity" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    {balanceSheet.map(sheet => (
                      <TableHead key={sheet.year} className="text-right">Year {sheet.year}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>ASSETS</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Cash</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.current.cash.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Accounts Receivable</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.current.accountsReceivable.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Inventory</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.current.inventory.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell className="pl-4">Total Current Assets</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.current.totalCurrent.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Net Fixed Assets</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.fixed.netFixed.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold border-t">
                    <TableCell>TOTAL ASSETS</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.assets.totalAssets.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>LIABILITIES</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Accounts Payable</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.liabilities.current.accountsPayable.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell className="pl-4">Total Current Liabilities</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.liabilities.current.totalCurrent.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Long-term Debt</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.liabilities.longTerm.longTermDebt.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>TOTAL LIABILITIES</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.liabilities.totalLiabilities.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>EQUITY</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Paid-in Capital</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.equity.paidInCapital.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Retained Earnings</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.equity.retainedEarnings.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold border-t">
                    <TableCell>TOTAL EQUITY</TableCell>
                    {balanceSheet.map(sheet => (
                      <TableCell key={sheet.year} className="text-right">
                        €{sheet.equity.totalEquity.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Components</CardTitle>
              <CardDescription>Operating, Investing, and Financing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cashFlowChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}M`} />
                  <Legend />
                  <Bar dataKey="operating" fill="#10b981" name="Operating" />
                  <Bar dataKey="investing" fill="#ef4444" name="Investing" />
                  <Bar dataKey="financing" fill="#3b82f6" name="Financing" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Balance Evolution</CardTitle>
              <CardDescription>Ending cash position over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}M`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="endingCash" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Cash Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    {cashFlow.map(cf => (
                      <TableHead key={cf.year} className="text-right">Year {cf.year}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>OPERATING ACTIVITIES</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Net Income</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.operating.netIncome.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Depreciation</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.operating.depreciation.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Change in Receivables</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.operating.changeInReceivables.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Change in Payables</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.operating.changeInPayables.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total Operating</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.operating.totalOperating.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>INVESTING ACTIVITIES</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Capital Expenditures</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.investing.capex.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total Investing</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.investing.totalInvesting.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>FINANCING ACTIVITIES</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Equity Raised</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.financing.equityRaised.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Debt Proceeds</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.financing.debtProceeds.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total Financing</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.financing.totalFinancing.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold border-t bg-primary/10">
                    <TableCell>NET CASH FLOW</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.netCashFlow.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Ending Cash</TableCell>
                    {cashFlow.map(cf => (
                      <TableCell key={cf.year} className="text-right">
                        €{cf.endingCash.toFixed(2)}M
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balanceSheet.map(sheet => {
              const currentRatio = sheet.assets.current.totalCurrent / sheet.liabilities.current.totalCurrent;
              const debtToEquity = sheet.liabilities.totalLiabilities / sheet.equity.totalEquity;
              const assetTurnover = annualData[sheet.year - 1].totalRev / sheet.assets.totalAssets;
              
              return (
                <Card key={sheet.year}>
                  <CardHeader>
                    <CardTitle className="text-lg">Year {sheet.year} Ratios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Ratio</span>
                      <span className={`text-sm font-medium ${currentRatio > 1.5 ? 'text-green-600' : currentRatio > 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {currentRatio.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Debt to Equity</span>
                      <span className={`text-sm font-medium ${debtToEquity < 0.5 ? 'text-green-600' : debtToEquity < 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {debtToEquity.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Asset Turnover</span>
                      <span className="text-sm font-medium">
                        {assetTurnover.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROE</span>
                      <span className="text-sm font-medium">
                        {((annualData[sheet.year - 1].ebitda / sheet.equity.totalEquity) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
