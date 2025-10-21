'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle } from 'lucide-react';

interface SkillMatrixProps {
  members: any[];
  openPositions: any[];
  skills: any[];
}

export function SkillMatrix({ members, openPositions, skills }: SkillMatrixProps) {
  const skillCoverage = skills.map(skill => {
    const currentCount = members.reduce((count, member) => 
      count + (member.skills.includes(skill.id) ? 1 : 0), 0
    );
    const neededCount = openPositions.reduce((count, position) => 
      count + (position.requiredSkills.includes(skill.id) ? 1 : 0), 0
    );
    
    return {
      ...skill,
      current: currentCount,
      needed: neededCount,
      total: currentCount + neededCount,
      coverage: neededCount > 0 ? (currentCount / neededCount) * 100 : 100
    };
  }).sort((a, b) => b.total - a.total);

  const skillsByCategory = skills.reduce((acc: any, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Skill Matrix
          </CardTitle>
          <CardDescription>Copertura competenze attuali e necessarie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skillCoverage.filter(s => s.total > 0).slice(0, 15).map(skill => (
              <div key={skill.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      style={{ borderColor: skill.color, color: skill.color }}
                    >
                      {skill.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {skill.current} / {skill.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {skill.coverage < 50 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {skill.coverage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(skill.coverage, 100)}%`,
                      backgroundColor: skill.coverage >= 80 ? '#10B981' : skill.coverage >= 50 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(skillsByCategory).map(([category, categorySkills]: [string, any]) => {
          const categoryColor = categorySkills[0]?.color || '#ccc';
          const totalInCategory = categorySkills.reduce((sum: number, skill: any) => {
            const coverage = skillCoverage.find(s => s.id === skill.id);
            return sum + (coverage?.current || 0);
          }, 0);

          return (
            <Card key={category} style={{ borderTop: `4px solid ${categoryColor}` }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: categoryColor }}>
                    {totalInCategory}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {categorySkills.length} skills in categoria
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
