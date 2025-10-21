'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GitBranch, Users, ChevronDown, ChevronRight } from 'lucide-react';

interface TeamOrgChartProps {
  members: any[];
  departments: any[];
}

export function TeamOrgChart({ members, departments }: TeamOrgChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(members.map(m => m.id)));
  const [viewMode, setViewMode] = useState<'hierarchy' | 'departments'>('hierarchy');

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildHierarchy = () => {
    const hierarchy: any = {};
    const roots: any[] = [];

    members.forEach(member => {
      hierarchy[member.id] = { ...member, children: [] };
    });

    members.forEach(member => {
      if (member.reportTo && hierarchy[member.reportTo]) {
        hierarchy[member.reportTo].children.push(hierarchy[member.id]);
      } else {
        roots.push(hierarchy[member.id]);
      }
    });

    return roots;
  };

  const renderMemberCard = (member: any, depth: number = 0) => {
    const hasChildren = member.children && member.children.length > 0;
    const isExpanded = expandedNodes.has(member.id);
    const department = departments.find(d => d.id === member.department);

    return (
      <div key={member.id} className="relative">
        {/* Connection line to parent */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 w-8 h-1/2 border-l-2 border-b-2 border-gray-300 rounded-bl-lg -translate-x-8" />
        )}

        <Card 
          className="mb-4 hover:shadow-md transition-all cursor-pointer"
          style={{ 
            marginLeft: `${depth * 40}px`,
            borderLeft: `4px solid ${department?.color || '#ccc'}`
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(member.id)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xl">
                    {member.avatar || '👤'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: department?.color + '20',
                      color: department?.color
                    }}
                  >
                    {department?.icon} {department?.name}
                  </Badge>
                  {member.equity > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {member.equity}% equity
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-3">
              {member.skills.slice(0, 5).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Direct reports count */}
            {hasChildren && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {member.children.length} direct report{member.children.length > 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {member.children.map((child: any) => renderMemberCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDepartmentView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptMembers = members.filter(m => m.department === dept.id);
          
          return (
            <Card key={dept.id} className="border-2" style={{ borderColor: dept.color + '40' }}>
              <CardHeader style={{ backgroundColor: dept.color + '10' }}>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{dept.icon}</span>
                  {dept.name}
                </CardTitle>
                <CardDescription>{dept.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {deptMembers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nessun membro</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deptMembers.map(member => (
                      <Card key={member.id} className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-lg">
                              {member.avatar || '👤'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                          </div>
                          {member.level === 'founder' && (
                            <Badge variant="secondary" className="text-xs">Founder</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const hierarchyRoots = buildHierarchy();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Organigramma
              </CardTitle>
              <CardDescription>Struttura gerarchica del team</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('hierarchy')}
              >
                Gerarchia
              </Button>
              <Button
                variant={viewMode === 'departments' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('departments')}
              >
                Dipartimenti
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">Nessun Membro nel Team</h3>
              <p className="text-sm">Aggiungi membri per visualizzare l'organigramma</p>
            </div>
          ) : viewMode === 'hierarchy' ? (
            <div className="space-y-4">
              {hierarchyRoots.map(root => renderMemberCard(root))}
            </div>
          ) : (
            renderDepartmentView()
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dept.color }}
                />
                <span className="text-sm">{dept.icon} {dept.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
