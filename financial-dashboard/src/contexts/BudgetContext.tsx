'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { BudgetData } from '@/types/budget.types';
import { BudgetService } from '@/lib/budget-service';

interface BudgetContextType {
  budgetData: BudgetData | null;
  budgetService: BudgetService | null;
  loading: boolean;
  error: string | null;
  updateItemValue: (itemId: string, periodId: string, value: number | null) => void;
  refreshData: () => void;
  forceUpdate: () => void;
  updateBudgetData: (itemId: string, periodId: string, value: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica dati dal database
  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dal file database.json con cache busting
      const timestamp = Date.now();
      const response = await fetch(`/data/database.json?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const database = await response.json();
      
      if (!database.budget) {
        throw new Error('Sezione budget non trovata nel database');
      }

      setBudgetData(database.budget);
      console.log('✅ Budget caricato:', {
        periodi: database.budget.periods?.length,
        categorie: database.budget.categories?.length,
        items: database.budget.allItems?.length,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      console.error('❌ Errore caricamento budget:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  // Crea service quando i dati cambiano
  const budgetService = useMemo(() => {
    if (!budgetData) return null;
    return new BudgetService(budgetData);
  }, [budgetData]);

  // Aggiorna valore item
  const updateItemValue = async (itemId: string, periodId: string, value: number | null) => {
    if (!budgetData || !budgetService) return;

    const success = await budgetService.updateItemValue(itemId, periodId, value);
    
    if (success) {
      // Forza aggiornamento dello state
      setBudgetData({ ...budgetData });
      
      // Salva in localStorage
      try {
        localStorage.setItem('eco3d_budget_data', JSON.stringify(budgetData));
        console.log('💾 Budget salvato in localStorage');
      } catch (err) {
        console.warn('⚠️ Impossibile salvare in localStorage:', err);
      }
    }
  };

  // Ricarica dati
  const refreshData = () => {
    loadBudgetData();
  };

  // Forza update UI senza ricaricare dal database
  const forceUpdate = () => {
    if (budgetData) {
      // Crea shallow copy per nuovo riferimento (mantiene gli oggetti interni)
      setBudgetData({ ...budgetData });
      console.log('🔄 UI aggiornata (shallow copy)');
    }
  };

  // Aggiorna budgetData con nuovo valore (usa callback per avere sempre l'ultimo stato)
  const updateBudgetData = (itemId: string, periodId: string, value: number) => {
    setBudgetData(currentData => {
      if (!currentData) return currentData;
      
      console.log('📝 Aggiornamento budgetData:', { itemId, periodId, value });
      
      // IMPORTANTE: Aggiorna ENTRAMBE le strutture dati
      // 1. Aggiorna allItems (array piatto)
      const updatedAllItems = currentData.allItems.map(item => {
        if (item.id === itemId) {
          console.log(`  → Item ${itemId} trovato in allItems, aggiorno valore`);
          return {
            ...item,
            values: {
              ...item.values,
              [periodId]: value
            },
            lastModified: new Date().toISOString()
          };
        }
        return item;
      });
      
      // 2. Aggiorna categories (struttura gerarchica)
      const updatedCategories = currentData.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcat => ({
          ...subcat,
          items: subcat.items.map(item => {
            if (item.id === itemId) {
              console.log(`  → Item ${itemId} trovato in categories, aggiorno valore`);
              return {
                ...item,
                values: {
                  ...item.values,
                  [periodId]: value
                },
                lastModified: new Date().toISOString()
              };
            }
            return item;
          })
        }))
      }));
      
      const updatedData: BudgetData = {
        ...currentData,
        allItems: updatedAllItems,
        categories: updatedCategories
      };
      
      console.log('✅ budgetData aggiornato con successo (allItems + categories)');
      return updatedData;
    });
  };

  const value: BudgetContextType = {
    budgetData,
    budgetService,
    loading,
    error,
    updateItemValue,
    refreshData,
    forceUpdate,
    updateBudgetData
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget deve essere usato all\'interno di BudgetProvider');
  }
  return context;
}
