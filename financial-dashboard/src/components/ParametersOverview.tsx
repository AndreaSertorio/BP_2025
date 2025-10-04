'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertTriangle, TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { Scenario } from '@/types/financial';
import { EnhancedTooltip } from './ui/enhanced-tooltip';

interface ParametersOverviewProps {
  scenario: Scenario;
}

export function ParametersOverview({ scenario }: ParametersOverviewProps) {
  const { drivers, base } = scenario;

  // Categorize parameters
  const marketParams = {
    'TAM (M€)': { value: 63800, source: 'Market Research', description: 'Total Addressable Market' },
    'SAM (M€)': { value: 31900, source: 'Market Research', description: 'Serviceable Addressable Market' },
    'SAM Annual Scans': { value: '31.9M', source: 'Market Research', description: 'Annual scans in SAM' }
  };

  const productParams = {
    'Device Price (€)': { value: drivers.devicePrice, source: 'Business Strategy', description: 'Price per ultrasound device' },
    'ARPA Subscription (€/year)': { value: drivers.arpaSub, source: 'Business Strategy', description: 'Annual Revenue Per Account - Subscription' },
    'ARPA Maintenance (€/year)': { value: drivers.arpaMaint, source: 'Business Strategy', description: 'Annual Revenue Per Account - Maintenance' },
    'CapEx Mix %': { value: (drivers.mixCapEx * 100).toFixed(1), source: 'Business Strategy', description: 'Percentage of CapEx vs Subscription deals' }
  };

  const costParams = {
    'Gross Margin Recurring %': { value: (drivers.gmRecurring * 100).toFixed(1), source: 'Cost Analysis', description: 'Gross margin on recurring revenue' },
    'COGS Hardware Y1 (€)': { value: drivers.cogsHw[1], source: 'Cost Analysis', description: 'Cost of Goods Sold for hardware in Year 1' },
    'COGS Hardware Y5 (€)': { value: drivers.cogsHw[5], source: 'Cost Analysis', description: 'Cost of Goods Sold for hardware in Year 5' }
  };

  const operationalParams = {
    'OPEX Y1 (M€)': { value: drivers.opex[1], source: 'Operational Planning', description: 'Operating expenses Year 1' },
    'OPEX Y5 (M€)': { value: drivers.opex[5], source: 'Operational Planning', description: 'Operating expenses Year 5' },
    'Sales & Marketing Y1 (M€)': { value: drivers.salesMarketingOpex[1], source: 'Operational Planning', description: 'Sales & Marketing expenses Year 1' },
    'Sales & Marketing Y5 (M€)': { value: drivers.salesMarketingOpex[5], source: 'Operational Planning', description: 'Sales & Marketing expenses Year 5' }
  };

  const salesParams = {
    'Lead Multiplier': { value: drivers.leadMult, source: 'GTM Strategy', description: 'Multiplier for base leads generation' },
    'Lead to Demo %': { value: (drivers.l2d * 100).toFixed(1), source: 'GTM Strategy', description: 'Conversion rate from leads to demos' },
    'Demo to Pilot %': { value: (drivers.d2p * 100).toFixed(1), source: 'GTM Strategy', description: 'Conversion rate from demos to pilots' },
    'Pilot to Deal %': { value: (drivers.p2d * 100).toFixed(1), source: 'GTM Strategy', description: 'Conversion rate from pilots to deals' },
    'Device Churn Monthly %': { value: (drivers.hwChurn * 100).toFixed(2), source: 'Customer Success', description: 'Monthly device churn rate' }
  };

  const usageParams = {
    'Scans per Device per Month': { value: drivers.scansPerDevicePerMonth, source: 'Usage Analytics', description: 'Expected monthly scans per device' }
  };

  // Previously hard-coded values - now configurable!
  const configuredValues = [
    { name: 'Initial Cash', value: `€${scenario.assumptions?.initialCash || 2.0}M`, status: 'Configurabile in Dashboard' },
    { name: 'Discount Rate NPV', value: `${((scenario.assumptions?.discountRate || 0.12) * 100).toFixed(1)}%`, status: 'Configurabile in Dashboard' },
    { name: 'TAM', value: `${(scenario.assumptions?.tam || 63800)/1000}M esami`, status: 'Configurabile in Dashboard' },
    { name: 'SAM', value: `${(scenario.assumptions?.sam || 31900)/1000}M esami`, status: 'Configurabile in Dashboard' },
    { name: 'CapEx as % Revenue', value: `${((scenario.assumptions?.capexAsPercentRevenue || 0.05) * 100).toFixed(1)}%`, status: 'Configurabile in Dashboard' },
    { name: 'Depreciation Rate', value: `${((scenario.assumptions?.depreciationRate || 0.20) * 100).toFixed(0)}%`, status: 'Configurabile in Dashboard' },
    { name: 'Realization Factor', value: `${((scenario.assumptions?.realizationFactor || 0.85) * 100).toFixed(1)}%`, status: 'Configurabile in Dashboard' }
  ];

  return (
    <div className="space-y-6">
      {/* Success Alert for Configured Values */}
      <Alert className="border-green-200 bg-green-50">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Success:</strong> {configuredValues.length} previously hard-coded values are now configurable in the Dashboard!
        </AlertDescription>
      </Alert>

      {/* Configured Financial Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-5 w-5" />
            Financial Assumptions (Now Configurable)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configuredValues.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.status}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-green-500 text-green-700">{item.value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Scenario Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Scenario: {scenario.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Market Parameters */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Target className="h-4 w-4" />
              Market Parameters
              <Badge variant="outline">Market Research</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(marketParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-blue-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-blue-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Product & Pricing */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <DollarSign className="h-4 w-4" />
              Product & Pricing
              <Badge variant="outline">Business Strategy</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {Object.entries(productParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-green-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium text-sm">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-green-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Cost Structure */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="h-4 w-4" />
              Cost Structure
              <Badge variant="outline">Cost Analysis</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(costParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-orange-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium text-sm">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-orange-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Operational Parameters */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Settings className="h-4 w-4" />
              Operational Parameters
              <Badge variant="outline">Operational Planning</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {Object.entries(operationalParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-purple-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium text-sm">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-purple-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Sales & GTM */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Users className="h-4 w-4" />
              Sales & GTM Parameters
              <Badge variant="outline">GTM Strategy</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(salesParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-indigo-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium text-sm">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-indigo-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Usage Parameters */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="h-4 w-4" />
              Usage Parameters
              <Badge variant="outline">Usage Analytics</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(usageParams).map(([key, param]) => (
                <div key={key} className="p-3 bg-emerald-50 rounded-lg">
                  <EnhancedTooltip
                    title={key}
                    description={param.description}
                    type="info"
                  >
                    <div className="font-medium">{key}</div>
                  </EnhancedTooltip>
                  <div className="text-lg font-bold text-emerald-600">{param.value}</div>
                  <div className="text-xs text-muted-foreground">{param.source}</div>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Base Leads Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Base Leads Pattern (Quarterly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {base.leadsPerQuarterQ1toQ8.map((leads: number, index: number) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-muted-foreground">Q{index + 1}</div>
                <div className="font-bold">{leads}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
