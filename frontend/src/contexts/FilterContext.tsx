'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SortOption = 'price' | 'speed' | 'popularity';

interface FilterState {
  selectedProviders: string[];
  selectedServices: string[];
  sortBy: SortOption;
  entrance?: number;
  apartment?: number;
}

interface FilterContextType {
  filters: FilterState;
  setSelectedProviders: (providers: string[]) => void;
  setSelectedServices: (services: string[]) => void;
  setSortBy: (sort: SortOption) => void;
  setApartmentInfo: (entrance: number, apartment: number) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const initialFilters: FilterState = {
  selectedProviders: [],
  selectedServices: [],
  sortBy: 'popularity',
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setSelectedProviders = (providers: string[]) => {
    setFilters((prev) => ({ ...prev, selectedProviders: providers }));
  };

  const setSelectedServices = (services: string[]) => {
    setFilters((prev) => ({ ...prev, selectedServices: services }));
  };

  const setSortBy = (sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: sort }));
  };

  const setApartmentInfo = (entrance: number, apartment: number) => {
    setFilters((prev) => ({
      ...prev,
      entrance,
      apartment,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSelectedProviders,
        setSelectedServices,
        setSortBy,
        setApartmentInfo,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
