'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Settings,
  Download,
  Briefcase,
  Award,
  Clock,
  MapPin
} from 'lucide-react';

import { TeamOverview } from './TeamOverview';
import { TeamOrgChart } from './TeamOrgChart';
import { OpenPositionsView } from './OpenPositionsView';
import { SkillMatrix } from './SkillMatrix';
import { TeamTimeline } from './TeamTimeline';
import { BudgetBreakdown } from './BudgetBreakdown';
import { MilestonesView } from './MilestonesView';
import { TeamSettingsPanel } from './TeamSettingsPanel';
import { OKRView } from './OKRView';
import { RAIDLog } from './RAIDLog';
import { WBSTree } from './WBSTree';
import { DoAMatrix } from './DoAMatrix';
import { DecisionLogView } from './DecisionLogView';
import { RBSTree } from './RBSTree';
import { CBSView } from './CBSView';
import { PBSTree } from './PBSTree';
import { ExportPanel } from './ExportPanel';
import { CollaborationPanel } from './CollaborationPanel';
// NEW: Unified components
import { DashboardUnified } from './DashboardUnified';
import { ScheduleView } from './ScheduleView';
// RESTORED: RAM and RACI as separate (they are DIFFERENT!)
import { RAMMatrix } from './RAMMatrix';
import { RACIMatrix } from './RACIMatrix';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  level: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  equity: number;
  status: string;
  skills: string[];
  responsibilities: string[];
  avatar: string;
  bio: string;
  reportTo: string | null;
  workload: number;
  performance: number | null;
  notes: string;
}

interface OpenPosition {
  id: string;
  title: string;
  department: string;
  level: string;
  priority: string;
  targetHireDate: string;
  salary: number;
  equity: number;
  requiredSkills: string[];
  responsibilities: string[];
  description: string;
  status: string;
  candidates: any[];
}

export function TeamManagementDashboard() {
  const { data, loading, updateData } = useDatabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'planning' | 'team' | 'resources' | 'schedule' | 'governance' | 'export' | 'collab'>('dashboard');
  const [planningTab, setPlanningTab] = useState<'wbs' | 'pbs'>('wbs');
  const [teamTab, setTeamTab] = useState<'overview' | 'orgchart' | 'ram' | 'raci' | 'skills' | 'positions'>('overview');
  const [resourcesTab, setResourcesTab] = useState<'rbs' | 'cbs'>('rbs');
  const [governanceTab, setGovernanceTab] = useState<'okr' | 'raid' | 'decisions' | 'doa'>('okr');
  const [showSettings, setShowSettings] = useState(false);

  // Sync with URL query params
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const teamTabParam = searchParams.get('teamtab');
    const governanceTabParam = searchParams.get('governancetab');
    
    if (viewParam && ['dashboard', 'planning', 'team', 'resources', 'schedule', 'governance', 'export', 'collab'].includes(viewParam)) {
      setActiveView(viewParam as any);
    }
    if (teamTabParam && ['overview', 'orgchart', 'ram', 'raci', 'skills', 'positions'].includes(teamTabParam)) {
      setTeamTab(teamTabParam as any);
    }
    if (governanceTabParam && ['okr', 'raid', 'decisions', 'doa'].includes(governanceTabParam)) {
      setGovernanceTab(governanceTabParam as any);
    }
  }, [searchParams]);

  const teamData = data?.teamManagement;
  const members: TeamMember[] = teamData?.members || [];
  const openPositions: OpenPosition[] = teamData?.openPositions || [];
  const departments = teamData?.departments || [];
  const skills = teamData?.skills || [];
  const milestones = teamData?.milestones || [];
  const uiSettings = teamData?.uiSettings || {};

  // Calculate statistics
  const stats = useMemo(() => {
    const currentTeamSize = members.filter(m => m.status === 'active').length;
    const targetTeamSize = currentTeamSize + openPositions.filter(p => p.status === 'open' || p.status === 'planned').length;
    const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
    const openRoles = openPositions.filter(p => p.status === 'open').length;
    const criticalRoles = openPositions.filter(p => p.priority === 'critical').length;
    
    const totalSalary = members.reduce((sum, m) => sum + m.salary, 0);
    const projectedSalary = totalSalary + openPositions.reduce((sum, p) => sum + p.salary, 0);

    return {
      currentTeamSize,
      targetTeamSize,
      totalBudget,
      openRoles,
      criticalRoles,
      totalSalary,
      projectedSalary,
      departmentsCount: departments.length,
      skillsCount: skills.length
    };
  }, [members, openPositions, departments, skills]);

  const toggleCardVisibility = (cardName: string) => {
    if (!data) return;
    
    const updatedSettings = {
      ...teamData,
      uiSettings: {
        ...uiSettings,
        visibleCards: {
          ...uiSettings.visibleCards,
          [cardName]: !uiSettings.visibleCards?.[cardName]
        }
      }
    };

    updateData({ teamManagement: updatedSettings });
  };

  const exportTeamData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      company: teamData?.company,
      members,
      openPositions,
      departments,
      stats
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eco3d-team-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dati team...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dati Team Non Disponibili</h3>
          <p className="text-muted-foreground">Impossibile caricare i dati del team</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con titolo e azioni */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {teamData.company?.name} - {teamData.company?.mission}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTeamData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Impostazioni
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.currentTeamSize} / {stats.targetTeamSize}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {stats.openRoles} posizioni aperte
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Budget Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              €{(stats.totalBudget / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Salary: €{(stats.projectedSalary / 1000).toFixed(0)}K/anno
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Ruoli Critici</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {stats.criticalRoles}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Da assumere urgentemente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.departmentsCount}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {stats.skillsCount} skills totali
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <TeamSettingsPanel
          uiSettings={uiSettings}
          onToggleCard={toggleCardVisibility}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Main Content Tabs - REFACTORED 8 TAB */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full h-auto p-1 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-semibold whitespace-nowrap">🏠 Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">📋 Planning</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">👥 Team</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">💰 Resources</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">📅 Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">🎯 Governance</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1 px-3 py-2">
              <Download className="h-3 w-3" />
              <span className="text-xs whitespace-nowrap">Export</span>
            </TabsTrigger>
            <TabsTrigger value="collab" className="flex items-center gap-1 px-3 py-2">
              <span className="text-xs whitespace-nowrap">💬 Collab</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: DASHBOARD */}
        <TabsContent value="dashboard" className="mt-6">
          <DashboardUnified />
        </TabsContent>

        {/* TAB 2: PLANNING (WBS + PBS) */}
        <TabsContent value="planning" className="mt-6">
          <Tabs value={planningTab} onValueChange={(v) => setPlanningTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wbs">WBS - Work Breakdown</TabsTrigger>
              <TabsTrigger value="pbs">PBS - Product Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent value="wbs" className="mt-4">
              <WBSTree />
            </TabsContent>
            <TabsContent value="pbs" className="mt-4">
              <PBSTree />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB 3: TEAM (Overview + OrgChart + RAM + RACI + Skills + Positions) */}
        <TabsContent value="team" className="mt-6">
          <Tabs value={teamTab} onValueChange={(v) => setTeamTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
              <TabsTrigger value="ram">RAM (WBS×OBS)</TabsTrigger>
              <TabsTrigger value="raci">RACI (Tasks×Team)</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <TeamOverview 
                members={members}
                departments={departments}
                openPositions={openPositions}
                stats={stats}
                uiSettings={uiSettings}
              />
            </TabsContent>
            <TabsContent value="orgchart" className="mt-4">
              <TeamOrgChart 
                members={members}
                departments={departments}
              />
            </TabsContent>
            <TabsContent value="ram" className="mt-4">
              <RAMMatrix 
                members={members}
                departments={departments}
              />
            </TabsContent>
            <TabsContent value="raci" className="mt-4">
              <RACIMatrix 
                members={members}
                departments={departments}
              />
            </TabsContent>
            <TabsContent value="skills" className="mt-4">
              <SkillMatrix 
                members={members}
                openPositions={openPositions}
                skills={skills}
              />
            </TabsContent>
            <TabsContent value="positions" className="mt-4">
              <OpenPositionsView 
                openPositions={openPositions}
                departments={departments}
                skills={skills}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB 4: RESOURCES (RBS + CBS) */}
        <TabsContent value="resources" className="mt-6">
          <Tabs value={resourcesTab} onValueChange={(v) => setResourcesTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rbs">RBS - Resource Breakdown</TabsTrigger>
              <TabsTrigger value="cbs">CBS - Cost Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent value="rbs" className="mt-4">
              <RBSTree />
            </TabsContent>
            <TabsContent value="cbs" className="mt-4">
              <CBSView />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB 5: SCHEDULE (Gantt + Calendar + Kanban) */}
        <TabsContent value="schedule" className="mt-6">
          <ScheduleView />
        </TabsContent>

        {/* TAB 6: GOVERNANCE (OKR + RAID + Decisions + DoA) */}
        <TabsContent value="governance" className="mt-6">
          <Tabs value={governanceTab} onValueChange={(v) => setGovernanceTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="okr">OKR</TabsTrigger>
              <TabsTrigger value="raid">RAID</TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
              <TabsTrigger value="doa">DoA</TabsTrigger>
            </TabsList>
            <TabsContent value="okr" className="mt-4">
              <OKRView members={members} />
            </TabsContent>
            <TabsContent value="raid" className="mt-4">
              <RAIDLog members={members} />
            </TabsContent>
            <TabsContent value="decisions" className="mt-4">
              <DecisionLogView members={members} />
            </TabsContent>
            <TabsContent value="doa" className="mt-4">
              <DoAMatrix members={members} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB 7: EXPORT */}
        <TabsContent value="export" className="mt-6">
          <ExportPanel />
        </TabsContent>

        {/* TAB 8: COLLABORATION */}
        <TabsContent value="collab" className="mt-6">
          <CollaborationPanel />
        </TabsContent>
      </Tabs>

      {/* Additional Cards (conditional rendering based on settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {uiSettings.visibleCards?.budgetBreakdown && (
          <BudgetBreakdown 
            departments={departments}
            members={members}
            openPositions={openPositions}
          />
        )}

        {uiSettings.visibleCards?.milestones && (
          <MilestonesView 
            milestones={milestones}
            openPositions={openPositions}
          />
        )}
      </div>
    </div>
  );
}
