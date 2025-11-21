import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles } from 'lucide-react';
import { getAllFormTemplates, getTemplatesByCategory, FormTemplate } from '@/config/formTemplates';

interface TemplateSelectorProps {
  onClose: () => void;
  onSelectTemplate: (template: FormTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onClose, onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const allTemplates = useMemo(() => getAllFormTemplates(), []);
  
  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'contact', label: 'Contact' },
    { id: 'survey', label: 'Survey' },
    { id: 'registration', label: 'Registration' },
    { id: 'lead', label: 'Lead Gen' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'order', label: 'Order' }
  ];
  
  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory === 'all' 
      ? allTemplates 
      : getTemplatesByCategory(selectedCategory as FormTemplate['category']);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.brand.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [allTemplates, selectedCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Choose a Template
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTemplates.length} professional templates ready to customize
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name, brand, or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
              />
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: FormTemplate;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-xl"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Template Preview */}
      <div 
        className="h-64 relative overflow-hidden"
        style={{ 
          backgroundColor: template.colors.primary,
          fontFamily: template.font
        }}
      >
        {/* Mini preview of the form */}
        <div className="absolute inset-0 p-6 flex flex-col">
          {/* Logo placeholder */}
          <div 
            className="text-xs font-semibold mb-4"
            style={{ color: template.colors.secondary }}
          >
            {template.brand}
          </div>
          
          {/* Title */}
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ color: template.colors.secondary }}
          >
            {template.title}
          </h3>
          
          {template.subtitle && (
            <p 
              className="text-sm mb-6 opacity-75"
              style={{ color: template.colors.secondary }}
            >
              {template.subtitle}
            </p>
          )}
          
          {/* CTA Button */}
          <button
            className="px-6 py-3 rounded-lg font-semibold text-sm transition-transform group-hover:scale-105 self-start"
            style={{ 
              backgroundColor: template.colors.accent,
              color: template.colors.primary
            }}
          >
            {template.ctaText}
          </button>
          
          {/* Decorative elements */}
          <div className="mt-auto flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 opacity-30"
                style={{ backgroundColor: template.colors.accent }}
              />
            ))}
          </div>
        </div>
        
        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-lg font-semibold">
              Use Template
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
            <p className="text-xs text-gray-500 truncate">{template.description}</p>
          </div>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full whitespace-nowrap">
            {template.questionCount}q
          </span>
        </div>
        
        {/* Color swatches */}
        <div className="flex gap-1 mt-3">
          <div 
            className="w-6 h-6 rounded border border-gray-200"
            style={{ backgroundColor: template.colors.primary }}
            title="Primary color"
          />
          <div 
            className="w-6 h-6 rounded border border-gray-200"
            style={{ backgroundColor: template.colors.secondary }}
            title="Secondary color"
          />
          <div 
            className="w-6 h-6 rounded border border-gray-200"
            style={{ backgroundColor: template.colors.accent }}
            title="Accent color"
          />
          <div className="flex-1" />
          <span className="text-xs text-gray-400 self-center" style={{ fontFamily: template.font }}>
            {template.font}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
