'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Box, Cpu, FileText, Package, Info, Layers } from 'lucide-react';
import { pbsSampleData } from '@/data/pbs-sample-data';

export function PBSTree() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['PBS-0', 'PBS-1', 'PBS-2', 'PBS-3', 'PBS-4']));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const buildTree = (parentId: string | null) => {
    return pbsSampleData.filter(n => n.parent_id === parentId).sort((a, b) => a.pbs_id.localeCompare(b.pbs_id));
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getCategoryIcon = (pbsId: string) => {
    if (pbsId.startsWith('PBS-1')) return <Cpu className="h-4 w-4 text-blue-600" />;
    if (pbsId.startsWith('PBS-2')) return <Box className="h-4 w-4 text-green-600" />;
    if (pbsId.startsWith('PBS-3')) return <FileText className="h-4 w-4 text-orange-600" />;
    if (pbsId.startsWith('PBS-4')) return <Package className="h-4 w-4 text-purple-600" />;
    return <Layers className="h-4 w-4 text-gray-600" />;
  };

  const getCategoryColor = (pbsId: string) => {
    if (pbsId.startsWith('PBS-1')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (pbsId.startsWith('PBS-2')) return 'bg-green-100 text-green-700 border-green-300';
    if (pbsId.startsWith('PBS-3')) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (pbsId.startsWith('PBS-4')) return 'bg-purple-100 text-purple-700 border-purple-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const renderNode = (node: typeof pbsSampleData[0], level: number = 0) => {
    const children = buildTree(node.pbs_id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.pbs_id);
    const isSelected = selectedNode === node.pbs_id;
    const isRoot = node.parent_id === null;

    return (
      <div key={node.pbs_id} className="mb-1">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
          } ${isRoot ? 'bg-gradient-to-r from-indigo-100 to-purple-100 font-bold border-2 border-indigo-300' : ''}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.pbs_id);
            setSelectedNode(node.pbs_id);
          }}
        >
          {hasChildren && (
            <button className="p-0 hover:bg-gray-200 rounded">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-1.5 rounded ${getCategoryColor(node.pbs_id)}`}>
              {getCategoryIcon(node.pbs_id)}
            </div>
            <span className={`text-sm ${isRoot ? 'font-bold text-indigo-900' : 'font-medium'}`}>{node.nome}</span>
            <Badge variant="outline" className="text-xs">{node.pbs_id}</Badge>
            {node.owner_obs_id && <Badge className="bg-gray-500 text-white text-xs">{node.owner_obs_id}</Badge>}
          </div>
        </div>
        {hasChildren && isExpanded && <div>{children.map(child => renderNode(child, level + 1))}</div>}
      </div>
    );
  };

  // Stats
  const stats = {
    totalComponents: pbsSampleData.length,
    hardware: pbsSampleData.filter(n => n.pbs_id.startsWith('PBS-1')).length,
    software: pbsSampleData.filter(n => n.pbs_id.startsWith('PBS-2')).length,
    regulatory: pbsSampleData.filter(n => n.pbs_id.startsWith('PBS-3')).length,
    packaging: pbsSampleData.filter(n => n.pbs_id.startsWith('PBS-4')).length,
    levels: Math.max(...pbsSampleData.map(n => n.pbs_id.split('.').length))
  };

  const selectedNodeData = pbsSampleData.find(n => n.pbs_id === selectedNode);

  // Get children count
  const getChildrenCount = (pbsId: string) => {
    return pbsSampleData.filter(n => n.parent_id === pbsId).length;
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Box className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">PBS - Product Breakdown Structure</h4>
              <p className="text-sm text-indigo-700 mb-3">
                Decomposizione gerarchica del prodotto finale (Eco 3D device) in componenti fisici e funzionali. 
                Fondamentale per hardware startup: BOM management, supply chain, assembly instructions, e trace matrix PBS ↔ WBS.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1"><Cpu className="h-3 w-3 text-blue-600" />Hardware: elettronica + meccanica</div>
                <div className="flex items-center gap-1"><Box className="h-3 w-3 text-green-600" />Software: firmware + app</div>
                <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-orange-600" />Regulatory: dossier + manuali</div>
                <div className="flex items-center gap-1"><Package className="h-3 w-3 text-purple-600" />Packaging: scatola + accessori</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.totalComponents}</div><p className="text-xs text-muted-foreground">Componenti</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{stats.hardware}</div><p className="text-xs text-muted-foreground">Hardware</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.software}</div><p className="text-xs text-muted-foreground">Software</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-orange-600">{stats.regulatory}</div><p className="text-xs text-muted-foreground">Regulatory</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-purple-600">{stats.packaging}</div><p className="text-xs text-muted-foreground">Packaging</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.levels}</div><p className="text-xs text-muted-foreground">Livelli</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PBS Tree */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Box className="h-4 w-4" />
              PBS Tree - Eco 3D Device Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {buildTree(null).map(node => renderNode(node))}
            </div>
          </CardContent>
        </Card>

        {/* Component Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" />Component Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNodeData ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Nome Componente:</p>
                  <p className="font-medium">{selectedNodeData.nome}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(selectedNodeData.pbs_id)}>{selectedNodeData.pbs_id}</Badge>
                  {selectedNodeData.owner_obs_id && <Badge className="bg-gray-600 text-white">{selectedNodeData.owner_obs_id}</Badge>}
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Descrizione:</p>
                  <p className="text-xs text-gray-600">{selectedNodeData.descrizione}</p>
                </div>
                {selectedNodeData.parent_id && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Parent:</p>
                    <Badge variant="outline">{selectedNodeData.parent_id}</Badge>
                  </div>
                )}
                {getChildrenCount(selectedNodeData.pbs_id) > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Sub-components:</p>
                    <p className="text-lg font-bold text-indigo-600">{getChildrenCount(selectedNodeData.pbs_id)} items</p>
                  </div>
                )}
                {selectedNodeData.pbs_id.startsWith('PBS-1') && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Hardware Component</p>
                    <p className="text-xs text-blue-700">Link a RBS (materials/equipment) e CBS (procurement cost)</p>
                  </div>
                )}
                {selectedNodeData.pbs_id.startsWith('PBS-2') && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-1">Software Component</p>
                    <p className="text-xs text-green-700">Link a WBS (dev tasks) e RBS (developer allocation)</p>
                  </div>
                )}
                {selectedNodeData.pbs_id.startsWith('PBS-3') && (
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-orange-900 mb-1">Regulatory Component</p>
                    <p className="text-xs text-orange-700">Richiesto per EC Certificate (Classe IIa MDR 2017/745)</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Seleziona un componente per vederne i dettagli</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">PBS Subsystems Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded border-2 border-blue-300 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">PBS-1: Hardware</span>
              </div>
              <p className="text-xs text-blue-700">Sonda (trasduttori 64ch), PCB (ADC/FPGA), Housing (case medical-grade)</p>
            </div>
            <div className="p-3 rounded border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Box className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">PBS-2: Software</span>
              </div>
              <p className="text-xs text-green-700">Firmware embedded, App 3D reconstruction, AI/ML segmentation, Cloud sync</p>
            </div>
            <div className="p-3 rounded border-2 border-orange-300 bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900">PBS-3: Regulatory</span>
              </div>
              <p className="text-xs text-orange-700">Dossier MDR (Risk Mgmt ISO 14971, CER), Manualistica (IFU, Service Manual)</p>
            </div>
            <div className="p-3 rounded border-2 border-purple-300 bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-900">PBS-4: Packaging</span>
              </div>
              <p className="text-xs text-purple-700">Scatola esterna, Protezione foam, Accessori (gel, cavi, cover)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
