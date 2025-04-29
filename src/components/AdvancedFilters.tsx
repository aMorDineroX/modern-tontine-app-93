import React, { useState } from 'react';
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
  ChevronUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import TagBadge from './TagBadge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: string[];
  className?: string;
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
}

export default function AdvancedFilters({
  onFilterChange,
  availableTags,
  className = ''
}: AdvancedFiltersProps) {
  const { t, formatAmount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memberRange, setMemberRange] = useState<[number, number]>([1, 20]);
  const [contributionRange, setContributionRange] = useState<[number, number]>([0, 1000]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    onFilterChange({
      tags: selectedTags,
      minMembers: memberRange[0],
      maxMembers: memberRange[1],
      minContribution: contributionRange[0],
      maxContribution: contributionRange[1]
    });
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedTags([]);
    setMemberRange([1, 20]);
    setContributionRange([0, 1000]);
    
    onFilterChange({
      tags: [],
      minMembers: undefined,
      maxMembers: undefined,
      minContribution: undefined,
      maxContribution: undefined
    });
  };
  
  // Fonction pour ajouter un tag
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setIsTagPopoverOpen(false);
      
      // Appliquer les filtres immédiatement
      onFilterChange({
        tags: newTags,
        minMembers: memberRange[0],
        maxMembers: memberRange[1],
        minContribution: contributionRange[0],
        maxContribution: contributionRange[1]
      });
    }
  };
  
  // Fonction pour supprimer un tag
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    
    // Appliquer les filtres immédiatement
    onFilterChange({
      tags: newTags,
      minMembers: memberRange[0],
      maxMembers: memberRange[1],
      minContribution: contributionRange[0],
      maxContribution: contributionRange[1]
    });
  };
  
  // Fonction pour mettre à jour le nombre de membres
  const handleMemberRangeChange = (values: number[]) => {
    setMemberRange([values[0], values[1]]);
  };
  
  // Fonction pour mettre à jour le montant de contribution
  const handleContributionRangeChange = (values: number[]) => {
    setContributionRange([values[0], values[1]]);
  };
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
        >
          <Filter size={16} className="mr-1.5" />
          {t('advancedFilters')}
          {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
        
        {selectedTags.length > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            {t('resetFilters')}
          </button>
        )}
      </div>
      
      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag}
              tag={tag}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </div>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="space-y-4">
              {/* Filtrage par tags */}
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
              
              {/* Filtrage par nombre de membres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Users size={14} className="inline mr-1.5" />
                  {t('filterByMembers')}
                </label>
                
                <div className="px-2">
                  <Slider
                    defaultValue={[1, 20]}
                    min={1}
                    max={20}
                    step={1}
                    value={memberRange}
                    onValueChange={handleMemberRangeChange}
                    className="my-4"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{memberRange[0]} {t('members')}</span>
                    <span>{memberRange[1]} {t('members')}</span>
                  </div>
                </div>
              </div>
              
              {/* Filtrage par montant de contribution */}
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
                    onValueChange={handleContributionRangeChange}
                    className="my-4"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatAmount(contributionRange[0])}</span>
                    <span>{formatAmount(contributionRange[1])}</span>
                  </div>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  {t('reset')}
                </Button>
                
                <Button
                  size="sm"
                  onClick={applyFilters}
                >
                  {t('applyFilters')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
