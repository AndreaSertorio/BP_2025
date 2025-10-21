'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';

interface BudgetBreakdownProps {
  departments: any[];
  members: any[];
  openPositions: any[];
}

export function BudgetBreakdown({ departments, members, openPositions }: BudgetBreakdownProps) {
  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const currentSalary = members.reduce((sum, m) => sum + m.salary, 0);
  const projectedSalary = currentSalary + openPositions.reduce((sum, p) => sum + p.salary, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Budget Breakdown
        </CardTitle>
        <CardDescription>Suddivisione budget per dipartimento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.map(dept => {
            const percentage = totalBudget > 0 ? ((dept.budget || 0) / totalBudget) * 100 : 0;
            return (
              <div key={dept.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{dept.icon}</span>
                    <span className="text-sm font-medium">{dept.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">€{((dept.budget || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ width: `${percentage}%`, backgroundColor: dept.color }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Totale</span>
              <span className="font-bold">€{(totalBudget / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Salary Attuale</span>
              <span className="font-bold">€{(currentSalary / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Salary Proiettato</span>
              <span className="font-bold text-blue-600">€{(projectedSalary / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
