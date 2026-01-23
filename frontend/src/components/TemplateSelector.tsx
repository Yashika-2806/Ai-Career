import React from 'react';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (template: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
}) => {
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean professional design with accent colors',
      preview: '/templates/modern-preview.png',
      color: 'from-blue-500 to-purple-500',
      bestFor: 'Tech & Startups',
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional corporate format',
      preview: '/templates/classic-preview.png',
      color: 'from-gray-600 to-gray-800',
      bestFor: 'Corporate & Finance',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple elegant design with white space',
      preview: '/templates/minimal-preview.png',
      color: 'from-slate-400 to-slate-600',
      bestFor: 'Creative & Design',
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold design with colorful sidebar',
      preview: '/templates/creative-preview.png',
      color: 'from-purple-500 to-pink-500',
      bestFor: 'Marketing & Design',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Choose Template</h3>
        <span className="text-sm text-gray-400">
          {templates.find(t => t.id === selectedTemplate)?.name || 'None selected'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative group text-left transition-all ${
              selectedTemplate === template.id
                ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900'
                : 'hover:ring-2 hover:ring-white/20'
            } rounded-xl overflow-hidden bg-white/5 border border-white/10`}
          >
            {/* Preview Image (Placeholder for now) */}
            <div className={`h-48 bg-gradient-to-br ${template.color} opacity-20 flex items-center justify-center`}>
              <div className="text-white/60 text-6xl font-bold">
                {template.name[0]}
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-semibold text-lg">{template.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                  {template.bestFor}
                </span>
              </div>
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`} />
          </button>
        ))}
      </div>

      {selectedTemplate && (
        <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
          <p className="text-sm text-purple-300">
            <strong>Tip:</strong> The {templates.find(t => t.id === selectedTemplate)?.name} template is
            perfect for {templates.find(t => t.id === selectedTemplate)?.bestFor} roles. 
            You can preview your resume before downloading.
          </p>
        </div>
      )}
    </div>
  );
};
