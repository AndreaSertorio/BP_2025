'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MercatoEcografie } from './MercatoEcografie';
import { MercatoEcografieRegionale } from './MercatoEcografieRegionale';

export function MercatoWrapper() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="ecografie" className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6">
            <TabsList>
              <TabsTrigger value="ecografie">📊 Mercato Ecografie</TabsTrigger>
              <TabsTrigger value="ecografi">🏥 Mercato Ecografi</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Mercato Ecografie con sotto-tab regionali */}
        <TabsContent value="ecografie" className="mt-0">
          <MercatoEcografieTab />
        </TabsContent>

        {/* Tab Mercato Ecografi (placeholder per futuro) */}
        <TabsContent value="ecografi" className="mt-0">
          <div className="container mx-auto p-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-8 text-center">
              <h1 className="text-3xl font-bold text-blue-900 mb-4">
                🏥 Mercato Ecografi
              </h1>
              <p className="text-lg text-blue-700 mb-6">
                Sezione in costruzione - Analisi del mercato dei dispositivi ecografici
              </p>
              <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl mx-auto">
                <p className="text-gray-600">
                  Questa sezione conterrà l&apos;analisi del mercato degli ecografi, includendo:
                </p>
                <ul className="text-left mt-4 space-y-2 text-gray-700">
                  <li>• Dimensione mercato dispositivi</li>
                  <li>• Segmentazione per tipologia</li>
                  <li>• Analisi competitiva</li>
                  <li>• Trend e proiezioni</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente interno per i tab regionali di Mercato Ecografie
function MercatoEcografieTab() {
  return (
    <Tabs defaultValue="italia" className="w-full">
      <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <TabsList className="bg-transparent">
            <TabsTrigger value="italia" className="data-[state=active]:bg-white">
              🇮🇹 Italia
            </TabsTrigger>
            <TabsTrigger value="usa" className="data-[state=active]:bg-white">
              🇺🇸 USA
            </TabsTrigger>
            <TabsTrigger value="europa" className="data-[state=active]:bg-white">
              🇪🇺 Europa (UE)
            </TabsTrigger>
            <TabsTrigger value="cina" className="data-[state=active]:bg-white">
              🇨🇳 Cina
            </TabsTrigger>
            <TabsTrigger value="globale" className="data-[state=active]:bg-white">
              🌍 Globale
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Italia - Pagina originale INTATTA */}
      <TabsContent value="italia" className="mt-0">
        <MercatoEcografie />
      </TabsContent>

      {/* USA */}
      <TabsContent value="usa" className="mt-0">
        <MercatoEcografieRegionale
          region="USA"
          flag="🇺🇸"
          defaultVolumeMultiplier={9}
          defaultValueMultiplier={7}
          volumeRange="8 – 10"
          valueRange="6 – 8"
          italyQuota="~10–12 %"
        />
      </TabsContent>

      {/* Europa */}
      <TabsContent value="europa" className="mt-0">
        <MercatoEcografieRegionale
          region="Europa (UE)"
          flag="🇪🇺"
          defaultVolumeMultiplier={7.5}
          defaultValueMultiplier={6.5}
          volumeRange="7 – 8"
          valueRange="6 – 7"
          italyQuota="~12–15 %"
        />
      </TabsContent>

      {/* Cina */}
      <TabsContent value="cina" className="mt-0">
        <MercatoEcografieRegionale
          region="Cina"
          flag="🇨🇳"
          defaultVolumeMultiplier={11}
          defaultValueMultiplier={10}
          volumeRange="10 – 12"
          valueRange="9 – 11"
          italyQuota="~8–10 %"
        />
      </TabsContent>

      {/* Globale */}
      <TabsContent value="globale" className="mt-0">
        <MercatoEcografieRegionale
          region="Globale"
          flag="🌍"
          defaultVolumeMultiplier={55}
          defaultValueMultiplier={50}
          volumeRange="50 – 60"
          valueRange="45 – 55"
          italyQuota="~1,5–2 %"
        />
      </TabsContent>
    </Tabs>
  );
}
