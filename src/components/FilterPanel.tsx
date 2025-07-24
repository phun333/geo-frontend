'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoordinateType } from '@/lib/types';
import { getCoordinateTypeLabel, getCoordinateTypeColor } from '@/lib/api';
import { Search, Filter, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

// Constants
const SEARCH_DEBOUNCE_MS = 300;
const ALL_COORDINATE_TYPES = new Set([
  CoordinateType.Point, 
  CoordinateType.Line, 
  CoordinateType.Polygon
]);

const TYPE_LABELS = {
  [CoordinateType.Point]: 'Noktalar',
  [CoordinateType.Line]: 'Çizgiler',
  [CoordinateType.Polygon]: 'Alanlar',
} as const;

// Types
interface FilterPanelProps {
  activeFilters: {
    types: Set<CoordinateType>;
    searchTerm: string;
  };
  onFiltersChange: (filters: {
    types: Set<CoordinateType>;
    searchTerm: string;
  }) => void;
  totalCount: number;
  filteredCount: number;
  pointsByType: {
    points: number;
    lines: number;
    polygons: number;
  };
}

interface TypeOption {
  type: CoordinateType;
  count: number;
  label: string;
}

// Sub-components
const FilterHeader: React.FC<{
  isExpanded: boolean;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onToggleExpanded: () => void;
}> = ({ isExpanded, hasActiveFilters, filteredCount, totalCount, onToggleExpanded }) => (
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5" />
        <CardTitle className="text-lg">Filtreler</CardTitle>
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2">
            {filteredCount} / {totalCount}
          </Badge>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
    </div>
  </CardHeader>
);

const SearchInput: React.FC<{
  searchInput: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}> = ({ searchInput, onSearchChange, onClearSearch }) => (
  <div className="space-y-2">
    <Label htmlFor="search" className="text-sm font-medium">
      İsimle Ara
    </Label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        id="search"
        type="text"
        placeholder="Nokta ismi..."
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
      {searchInput && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          onClick={onClearSearch}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

const TypeFilterButton: React.FC<{
  type: CoordinateType;
  label: string;
  count: number;
  isActive: boolean;
  onToggle: (type: CoordinateType) => void;
}> = ({ type, label, count, isActive, onToggle }) => {
  const color = getCoordinateTypeColor(type);
  
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(type)}
      className={`h-auto py-2 px-3 flex flex-col items-center gap-1 transition-all ${
        isActive ? '' : 'opacity-60'
      }`}
      style={isActive ? { backgroundColor: color, borderColor: color } : {}}
    >
      <div 
        className={`w-3 h-3 rounded-full ${isActive ? 'bg-white' : ''}`}
        style={!isActive ? { backgroundColor: color } : {}}
      />
      <span className="text-xs font-medium">{label}</span>
      <Badge 
        variant={isActive ? "secondary" : "outline"} 
        className={`text-xs px-1 py-0 ${isActive ? 'bg-white/20 text-white' : ''}`}
      >
        {count}
      </Badge>
    </Button>
  );
};

const TypeFilters: React.FC<{
  activeTypes: Set<CoordinateType>;
  pointsByType: FilterPanelProps['pointsByType'];
  onTypeToggle: (type: CoordinateType) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}> = ({ activeTypes, pointsByType, onTypeToggle, onShowAll, onHideAll }) => {
  const typeOptions: TypeOption[] = [
    { type: CoordinateType.Point, count: pointsByType.points, label: TYPE_LABELS[CoordinateType.Point] },
    { type: CoordinateType.Line, count: pointsByType.lines, label: TYPE_LABELS[CoordinateType.Line] },
    { type: CoordinateType.Polygon, count: pointsByType.polygons, label: TYPE_LABELS[CoordinateType.Polygon] },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Türe Göre Filtrele</Label>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onShowAll} className="text-xs h-7">
            <Eye className="w-3 h-3 mr-1" />
            Tümünü Göster
          </Button>
          <Button variant="ghost" size="sm" onClick={onHideAll} className="text-xs h-7">
            <EyeOff className="w-3 h-3 mr-1" />
            Tümünü Gizle
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {typeOptions.map(({ type, count, label }) => (
          <TypeFilterButton
            key={type}
            type={type}
            label={label}
            count={count}
            isActive={activeTypes.has(type)}
            onToggle={onTypeToggle}
          />
        ))}
      </div>
    </div>
  );
};

// Helper functions
const hasActiveFilters = (filters: FilterPanelProps['activeFilters']): boolean => 
  !!filters.searchTerm || filters.types.size < 3;

// Main component
const FilterPanel: React.FC<FilterPanelProps> = ({
  activeFilters,
  onFiltersChange,
  totalCount,
  filteredCount,
  pointsByType,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState(activeFilters.searchTerm);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        ...activeFilters,
        searchTerm: searchInput,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Event handlers
  const handleTypeToggle = (type: CoordinateType) => {
    const newTypes = new Set(activeFilters.types);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onFiltersChange({
      ...activeFilters,
      types: newTypes,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      types: ALL_COORDINATE_TYPES,
      searchTerm: '',
    });
  };

  const handleShowAll = () => {
    onFiltersChange({
      ...activeFilters,
      types: ALL_COORDINATE_TYPES,
    });
  };

  const handleHideAll = () => {
    onFiltersChange({
      ...activeFilters,
      types: new Set(),
    });
  };

  const handleClearSearch = () => setSearchInput('');
  const handleToggleExpanded = () => setIsExpanded(!isExpanded);

  const filtersAreActive = hasActiveFilters(activeFilters);

  return (
    <Card className="mb-4">
      <FilterHeader
        isExpanded={isExpanded}
        hasActiveFilters={filtersAreActive}
        filteredCount={filteredCount}
        totalCount={totalCount}
        onToggleExpanded={handleToggleExpanded}
      />
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <SearchInput
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onClearSearch={handleClearSearch}
          />

          <TypeFilters
            activeTypes={activeFilters.types}
            pointsByType={pointsByType}
            onTypeToggle={handleTypeToggle}
            onShowAll={handleShowAll}
            onHideAll={handleHideAll}
          />

          {filtersAreActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Filtreleri Temizle
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default FilterPanel;