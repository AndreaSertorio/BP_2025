'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Edit2, Save, X, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { FundingRound } from '@/types/financialPlan.types';

interface FundingRoundsPanelProps {
  rounds: FundingRound[];
  onUpdate: (rounds: FundingRound[]) => void;
}

export function FundingRoundsPanel({ rounds, onUpdate }: FundingRoundsPanelProps) {
  const [editingRound, setEditingRound] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FundingRound>>({});
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set(rounds.map(r => r.id)));

  const startEdit = (round: FundingRound) => {
    setEditingRound(round.id);
    setEditForm(round);
  };

  const cancelEdit = () => {
    setEditingRound(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    
    const updatedRounds = rounds.map(r => 
      r.id === editForm.id ? { ...r, ...editForm } : r
    );
    
    onUpdate(updatedRounds);
    setEditingRound(null);
    setEditForm({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalFunding = rounds.reduce((sum, r) => sum + r.amount, 0);

  const toggleExpand = (roundId: string) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(roundId)) {
      newExpanded.delete(roundId);
    } else {
      newExpanded.add(roundId);
    }
    setExpandedRounds(newExpanded);
  };

  const isExpanded = (roundId: string) => expandedRounds.has(roundId);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Funding Rounds
            </CardTitle>
            <CardDescription>
              Pianifica i round di finanziamento e l'utilizzo dei fondi
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Capitale Totale</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalFunding)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rounds.map((round, index) => (
          <div key={round.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
            {/* Header Round */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{round.name}</h3>
                  <p className="text-sm text-gray-500">{round.milestone}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {editingRound === round.id ? (
                  <>
                    <Button size="sm" onClick={saveEdit} variant="default">
                      <Save className="w-4 h-4 mr-1" />
                      Salva
                    </Button>
                    <Button size="sm" onClick={cancelEdit} variant="outline">
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => startEdit(round)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Modifica
                  </Button>
                )}
              </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data
                </Label>
                {editingRound === round.id ? (
                  <select
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  >
                    {generateQuarterOptions().map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 font-mono font-semibold text-blue-600">
                    {round.date}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Importo
                </Label>
                {editingRound === round.id ? (
                  <Input
                    type="number"
                    value={editForm.amount || ''}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                    className="mt-1"
                    placeholder="€"
                  />
                ) : (
                  <div className="mt-1 font-bold text-lg text-green-600">
                    {formatCurrency(round.amount)}
                  </div>
                )}
              </div>

              {/* Valuation */}
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Post-Money
                </Label>
                {editingRound === round.id ? (
                  <Input
                    type="number"
                    value={editForm.valuation?.postMoney || ''}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      valuation: {
                        ...editForm.valuation!,
                        postMoney: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 font-semibold text-gray-700">
                    {formatCurrency(round.valuation.postMoney)}
                  </div>
                )}
              </div>
            </div>

            {/* Dilution & Runway */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Dilution:</span>
                <span className="font-semibold">{round.dilution}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Expected Runway:</span>
                <span className="font-semibold">{round.expectedRunway} mesi</span>
              </div>
            </div>

            {/* Use of Funds */}
            <div className="mt-3">
              <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                Use of Funds
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(round.useOfFunds).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm capitalize">{key}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{value.percentage}%</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(value.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investors */}
            {round.investors && round.investors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Label className="text-xs text-gray-500 w-full">Investitori:</Label>
                {round.investors.map((investor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                  >
                    {investor}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Summary Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Totale Funding Pianificato</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalFunding)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{rounds.length} Rounds</div>
              <div className="text-lg font-semibold text-gray-700">
                {rounds[0]?.date} - {rounds[rounds.length - 1]?.date}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Genera opzioni quarters per i prossimi 5 anni
 */
function generateQuarterOptions(): string[] {
  const options: string[] = [];
  const currentYear = 2025;
  
  for (let year = currentYear; year <= currentYear + 10; year++) {
    for (let q = 1; q <= 4; q++) {
      options.push(`${year}-Q${q}`);
    }
  }
  
  return options;
}
