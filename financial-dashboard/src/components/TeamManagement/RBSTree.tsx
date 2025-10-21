'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Users, Laptop, Package, Code, Info, AlertCircle } from 'lucide-react';
import type { RBSNode } from '@/types/team';
import { rbsSampleData } from '@/data/rbs-sample-data';

export function RBSTree() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['RBS-1', 'RBS-2', 'RBS-3']));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const buildTree = (parentId: string | null): RBSNode[] => {
    return rbsSampleData.filter(n => n.parent_id === parentId).sort((a, b) => a.rbs_id.localeCompare(b.rbs_id));
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

  const getCategoryIcon = (categoria: string) => {
    const icons = { human: Users, equipment: Laptop, material: Package, software: Code };
    const Icon = icons[categoria as keyof typeof icons] || Package;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      human: 'bg-blue-100 text-blue-700',
      equipment: 'bg-purple-100 text-purple-700',
      material: 'bg-green-100 text-green-700',
      software: 'bg-orange-100 text-orange-700'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTipoColor = (tipo: string) => {
    const colors = { internal: 'bg-green-500', external: 'bg-blue-500', contractor: 'bg-orange-500' };
    return colors[tipo as keyof typeof colors] || 'bg-gray-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
  };

  const renderNode = (node: RBSNode, level: number = 0) => {
    const children = buildTree(node.rbs_id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.rbs_id);
    const isSelected = selectedNode === node.rbs_id;
    const isLeaf = !hasChildren;
    const totalAllocation = node.allocazioni_wbs?.reduce((sum, a) => sum + a.percentage, 0) || 0;
    const isOverallocated = totalAllocation > 100;

    return (
      <div key={node.rbs_id} className="mb-1">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.rbs_id);
            setSelectedNode(node.rbs_id);
          }}
        >
          {hasChildren && (
            <button className="p-0 hover:bg-gray-200 rounded">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-1.5 rounded ${getCategoryColor(node.categoria)}`}>
              {getCategoryIcon(node.categoria)}
            </div>
            <span className="font-medium text-sm">{node.nome}</span>
            <Badge variant="outline" className="text-xs">{node.rbs_id}</Badge>
            <Badge className={`${getTipoColor(node.tipo)} text-white text-xs`}>{node.tipo}</Badge>
            {isLeaf && node.costo_totale && (
              <Badge className="bg-green-600 text-white text-xs ml-auto">{formatCurrency(node.costo_totale)}</Badge>
            )}
            {isLeaf && isOverallocated && (
              <Badge className="bg-red-500 text-white text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />{totalAllocation}%
              </Badge>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && <div>{children.map(child => renderNode(child, level + 1))}</div>}
      </div>
    );
  };

  const stats = {
    totalResources: rbsSampleData.length,
    totalCost: rbsSampleData.reduce((sum, n) => sum + (n.costo_totale || 0), 0),
    human: rbsSampleData.filter(n => n.categoria === 'human' && n.costo_totale).length,
    equipment: rbsSampleData.filter(n => n.categoria === 'equipment' && n.costo_totale).length,
    materials: rbsSampleData.filter(n => n.categoria === 'material' && n.costo_totale).length,
    software: rbsSampleData.filter(n => n.categoria === 'software' && n.costo_totale).length
  };

  const selectedNodeData = rbsSampleData.find(n => n.rbs_id === selectedNode);

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">RBS - Resource Breakdown Structure</h4>
              <p className="text-sm text-green-700 mb-3">
                Elenco gerarchico risorse (umane, attrezzature, materiali, software) per capacity planning e budgeting.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1"><Users className="h-3 w-3" />Human: personale</div>
                <div className="flex items-center gap-1"><Laptop className="h-3 w-3" />Equipment: lab tools</div>
                <div className="flex items-center gap-1"><Package className="h-3 w-3" />Material: BOM</div>
                <div className="flex items-center gap-1"><Code className="h-3 w-3" />Software: licenses</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.totalResources}</div><p className="text-xs text-muted-foreground">Risorse</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCost)}</div><p className="text-xs text-muted-foreground">Costo Totale</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="grid grid-cols-2 gap-1 text-xs"><div className="flex items-center gap-1"><Users className="h-3 w-3" /><strong>{stats.human}</strong></div><div className="flex items-center gap-1"><Laptop className="h-3 w-3" /><strong>{stats.equipment}</strong></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="grid grid-cols-2 gap-1 text-xs"><div className="flex items-center gap-1"><Package className="h-3 w-3" /><strong>{stats.materials}</strong></div><div className="flex items-center gap-1"><Code className="h-3 w-3" /><strong>{stats.software}</strong></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" />RBS Tree - Eco 3D</CardTitle></CardHeader>
          <CardContent><div className="space-y-1 max-h-[600px] overflow-y-auto">{buildTree(null).map(node => renderNode(node))}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" />Resource Detail</CardTitle></CardHeader>
          <CardContent>
            {selectedNodeData ? (
              <div className="space-y-4 text-sm">
                <div><p className="font-semibold text-gray-700 mb-1">Nome:</p><p>{selectedNodeData.nome}</p></div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(selectedNodeData.categoria)}>{selectedNodeData.categoria}</Badge>
                  <Badge className={`${getTipoColor(selectedNodeData.tipo)} text-white`}>{selectedNodeData.tipo}</Badge>
                </div>
                {selectedNodeData.costo_unitario && (
                  <div><p className="font-semibold text-gray-700 mb-1">Costo Unitario:</p><p>{formatCurrency(selectedNodeData.costo_unitario)} / {selectedNodeData.unita_misura}</p></div>
                )}
                {selectedNodeData.disponibilita && (
                  <div><p className="font-semibold text-gray-700 mb-1">Disponibilità:</p><p>{selectedNodeData.disponibilita} {selectedNodeData.unita_misura}</p></div>
                )}
                {selectedNodeData.costo_totale && (
                  <div><p className="font-semibold text-gray-700 mb-1">Costo Totale:</p><p className="text-lg font-bold text-green-600">{formatCurrency(selectedNodeData.costo_totale)}</p></div>
                )}
                {selectedNodeData.fornitore && (
                  <div><p className="font-semibold text-gray-700 mb-1">Fornitore:</p><p>{selectedNodeData.fornitore}</p></div>
                )}
                {selectedNodeData.allocazioni_wbs && selectedNodeData.allocazioni_wbs.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Allocazioni WBS:</p>
                    <div className="space-y-1">
                      {selectedNodeData.allocazioni_wbs.map((alloc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                          <span className="font-medium">{alloc.wbs_id}</span>
                          <Badge variant="outline">{alloc.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Seleziona una risorsa per vederne i dettagli</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
