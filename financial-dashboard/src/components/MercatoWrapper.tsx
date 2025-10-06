'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MercatoEcografie } from './MercatoEcografie';
import { MercatoEcografieRegionale } from './MercatoEcografieRegionale';
import { MercatoEcografi } from './MercatoEcografi';
import { MercatoRiepilogo } from './MercatoRiepilogo';

export function MercatoWrapper() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="riepilogo" className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6">
            <TabsList>
              <TabsTrigger value="riepilogo">📋 Riepilogo</TabsTrigger>
              <TabsTrigger value="ecografie">📊 Mercato Ecografie</TabsTrigger>
              <TabsTrigger value="ecografi">🏥 Mercato Ecografi</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Riepilogo - NUOVO DATABASE CENTRALIZZATO */}
        <TabsContent value="riepilogo" className="mt-0">
          <MercatoRiepilogo />
        </TabsContent>

        {/* Tab Mercato Ecografie con sotto-tab regionali */}
        <TabsContent value="ecografie" className="mt-0">
          <MercatoEcografieTab />
        </TabsContent>

        {/* Tab Mercato Ecografi */}
        <TabsContent value="ecografi" className="mt-0">
          <MercatoEcografi />
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
