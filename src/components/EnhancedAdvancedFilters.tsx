import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Plus, 
  Tag as TagIcon, 
  Calendar, 
  Users, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Star,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import TagBadge from './TagBadge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { DatePicker } from './ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { debounce } from '@/utils/helpers';

interface EnhancedAdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: string[];
  className?: string;
  onSearchChange?: (searchTerm: string) => void;
}

export interface FilterOptions {
  tags: string[];
  minMembers?: number;
  maxMembers?: number;
  minContribution?: number;
  maxContribution?: number;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  status?: ('active' | 'pending' | 'completed')[];
  progress?: [number, number]; // Min and max progress
  isFavorite?: boolean;
  sortBy?: 'name' | 'date' | 'contribution' | 'members' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export default function EnhancedAdvancedFilters({
  onFilterChange,
  availableTags,
  className = '',
  onSearchChange
}: EnhancedAdvancedFiltersProps) {
  const { t, formatAmount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memberRange, setMemberRange] = useState<[number, number]>([1, 20]);
  const [contributionRange, setContributionRange] = useState<[number, number]>([0, 1000]);
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 100]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [selectedStatus, setSelectedStatus] = useState<('active' | 'pending' | 'completed')[]>([]);
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'contribution' | 'members' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((value: string) => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 300),
    [onSearchChange]
  );
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    onFilterChange({
      tags: selectedTags,
      minMembers: memberRange[0],
      maxMembers: memberRange[1],
      minContribution: contributionRange[0],
      maxContribution: contributionRange[1],
      dateRange,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      progress: progressRange,
      isFavorite: isFavoriteOnly,
      sortBy,
      sortOrder
    });
  };
  
  // Apply filters automatically when any filter changes
  useEffect(() => {
    applyFilters();
  }, [
    selectedTags, 
    memberRange, 
    contributionRange, 
    dateRange, 
    selectedStatus, 
    progressRange, 
    isFavoriteOnly,
    sortBy,
    sortOrder
  ]);
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedTags([]);
    setMemberRange([1, 20]);
    setContributionRange([0, 1000]);
    setProgressRange([0, 100]);
    setDateRange({ from: null, to: null });
    setSelectedStatus([]);
    setIsFavoriteOnly(false);
    setSortBy('date');
    setSortOrder('desc');
    
    onFilterChange({
      tags: [],
      minMembers: undefined,
      maxMembers: undefined,
      minContribution: undefined,
      maxContribution: undefined,
      dateRange: { from: null, to: null },
      status: undefined,
      progress: [0, 100],
      isFavorite: false,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };
  
  // Fonction pour ajouter un tag
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setIsTagPopoverOpen(false);
    }
  };
  
  // Fonction pour supprimer un tag
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
  };
  
  // Toggle status selection
  const toggleStatus = (status: 'active' | 'pending' | 'completed') => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedTags.length > 0) count++;
    if (memberRange[0] > 1 || memberRange[1] < 20) count++;
    if (contributionRange[0] > 0 || contributionRange[1] < 1000) count++;
    if (progressRange[0] > 0 || progressRange[1] < 100) count++;
    if (dateRange.from || dateRange.to) count++;
    if (selectedStatus.length > 0) count++;
    if (isFavoriteOnly) count++;
    return count;
  };
  
  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder={t('searchGroups')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>
        
        {/* Filter toggle button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            {t('advancedFilters')}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              {t('resetFilters')}
            </Button>
          )}
        </div>
        
        {/* Selected tags display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map(tag => (
              <TagBadge
                key={tag}
                tag={tag}
                onRemove={() => removeTag(tag)}
              />
            ))}
          </div>
        )}
        
        {/* Advanced filters panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 grid grid-cols-3 w-full">
                  <TabsTrigger value="basic">{t('basicFilters')}</TabsTrigger>
                  <TabsTrigger value="advanced">{t('advancedFilters')}</TabsTrigger>
                  <TabsTrigger value="sort">{t('sorting')}</TabsTrigger>
                </TabsList>
                
                {/* Basic filters tab */}
                <TabsContent value="basic" className="space-y-4">
                  {/* Tags filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <TagIcon size={14} className="inline mr-1.5" />
                      {t('filterByTags')}
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTags.map(tag => (
                        <TagBadge
                          key={tag}
                          tag={tag}
                          onRemove={() => removeTag(tag)}
                        />
                      ))}
                      
                      <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 gap-1 text-xs"
                          >
                            <Plus size={12} />
                            {t('addTag')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-60" align="start">
                          <Command>
                            <CommandInput placeholder={t('searchTags')} />
                            <CommandList>
                              <CommandEmpty>{t('noTagsFound')}</CommandEmpty>
                              <CommandGroup>
                                {availableTags
                                  .filter(tag => !selectedTags.includes(tag))
                                  .map(tag => (
                                    <CommandItem
                                      key={tag}
                                      onSelect={() => addTag(tag)}
                                      className="flex items-center gap-2"
                                    >
                                      <TagIcon size={12} />
                                      <span>{tag}</span>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Filter size={14} className="inline mr-1.5" />
                      {t('filterByStatus')}
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {(['active', 'pending', 'completed'] as const).map((status) => (
                        <Badge
                          key={status}
                          variant={selectedStatus.includes(status) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(status)}
                        >
                          {t(status)}
                          {selectedStatus.includes(status) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Favorites filter */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="favorite-filter"
                      checked={isFavoriteOnly}
                      onCheckedChange={setIsFavoriteOnly}
                    />
                    <Label htmlFor="favorite-filter" className="flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-500" />
                      {t('favoritesOnly')}
                    </Label>
                  </div>
                </TabsContent>
                
                {/* Advanced filters tab */}
                <TabsContent value="advanced" className="space-y-4">
                  {/* Member count filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Users size={14} className="inline mr-1.5" />
                      {t('filterByMembers')}
                    </label>
                    
                    <div className="px-2">
                      <Slider
                        defaultValue={[1, 20]}
                        min={1}
                        max={50}
                        step={1}
                        value={memberRange}
                        onValueChange={(values) => setMemberRange([values[0], values[1]])}
                        className="my-4"
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{memberRange[0]} {t('members')}</span>
                        <span>{memberRange[1]} {t('members')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contribution amount filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <CreditCard size={14} className="inline mr-1.5" />
                      {t('filterByContribution')}
                    </label>
                    
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, 1000]}
                        min={0}
                        max={1000}
                        step={10}
                        value={contributionRange}
                        onValueChange={(values) => setContributionRange([values[0], values[1]])}
                        className="my-4"
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatAmount(contributionRange[0])}</span>
                        <span>{formatAmount(contributionRange[1])}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <TrendingUp size={14} className="inline mr-1.5" />
                      {t('filterByProgress')}
                    </label>
                    
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, 100]}
                        min={0}
                        max={100}
                        step={5}
                        value={progressRange}
                        onValueChange={(values) => setProgressRange([values[0], values[1]])}
                        className="my-4"
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{progressRange[0]}%</span>
                        <span>{progressRange[1]}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Date range filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Calendar size={14} className="inline mr-1.5" />
                      {t('filterByDate')}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('from')}</p>
                        <DatePicker
                          date={dateRange.from}
                          setDate={(date) => setDateRange({ ...dateRange, from: date })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('to')}</p>
                        <DatePicker
                          date={dateRange.to}
                          setDate={(date) => setDateRange({ ...dateRange, to: date })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Sorting tab */}
                <TabsContent value="sort" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <ArrowUpDown size={14} className="inline mr-1.5" />
                      {t('sortBy')}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'name', label: t('name'), icon: <TagIcon size={14} /> },
                        { value: 'date', label: t('date'), icon: <Calendar size={14} /> },
                        { value: 'contribution', label: t('contribution'), icon: <CreditCard size={14} /> },
                        { value: 'members', label: t('members'), icon: <Users size={14} /> },
                        { value: 'progress', label: t('progress'), icon: <TrendingUp size={14} /> }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy(option.value as any)}
                          className="flex items-center justify-start gap-1.5"
                        >
                          {option.icon}
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('sortOrder')}
                    </label>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === 'asc' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder('asc')}
                        className="flex-1"
                      >
                        {t('ascending')}
                      </Button>
                      <Button
                        variant={sortOrder === 'desc' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder('desc')}
                        className="flex-1"
                      >
                        {t('descending')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active filters display */}
        {getActiveFilterCount() > 0 && !isOpen && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedTags.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <TagIcon size={12} />
                {selectedTags.length} {t('tags')}
              </Badge>
            )}
            
            {selectedStatus.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter size={12} />
                {selectedStatus.length} {t('statuses')}
              </Badge>
            )}
            
            {(memberRange[0] > 1 || memberRange[1] < 20) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users size={12} />
                {memberRange[0]}-{memberRange[1]}
              </Badge>
            )}
            
            {(contributionRange[0] > 0 || contributionRange[1] < 1000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CreditCard size={12} />
                {formatAmount(contributionRange[0])}-{formatAmount(contributionRange[1])}
              </Badge>
            )}
            
            {(progressRange[0] > 0 || progressRange[1] < 100) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp size={12} />
                {progressRange[0]}%-{progressRange[1]}%
              </Badge>
            )}
            
            {(dateRange.from || dateRange.to) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar size={12} />
                {dateRange.from ? dateRange.from.toLocaleDateString() : '...'} - 
                {dateRange.to ? dateRange.to.toLocaleDateString() : '...'}
              </Badge>
            )}
            
            {isFavoriteOnly && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star size={12} className="text-yellow-500" />
                {t('favorites')}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
