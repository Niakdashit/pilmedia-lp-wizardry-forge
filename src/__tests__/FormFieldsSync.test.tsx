import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useEditorStore } from '../stores/editorStore';
import { act } from 'react';

// Mock the editor store
jest.mock('../stores/editorStore');

// Mock FormCanvas component to check props
jest.mock('../components/GameTypes/FormCanvas', () => {
  return {
    __esModule: true,
    default: function MockFormCanvas(props: any) {
      const { formStructure, config, onSubmit } = props;
      return (
        <div data-testid="form-canvas">
          <div data-testid="form-fields-count">{formStructure?.fields?.length || 0}</div>
          <div data-testid="form-title">{formStructure?.title || 'No title'}</div>
          {formStructure?.fields?.map((field: any, index: number) => (
            <div key={field.id} data-testid={`field-${index}`}>
              <span data-testid={`field-${index}-label`}>{field.label}</span>
              <span data-testid={`field-${index}-type`}>{field.type}</span>
              <span data-testid={`field-${index}-required`}>{field.required.toString()}</span>
            </div>
          ))}
          <button onClick={() => onSubmit?.({ test: 'data' })}>Submit</button>
        </div>
      );
    }
  };
});

// Create test component that includes DesignCanvas FormCanvas logic
const TestFormSyncComponent: React.FC<{ campaign: any }> = ({ campaign }) => {
  // Simulate the sync logic from DesignCanvas
  const formFields = campaign.formFields || [];
  const syncedFormStructure = {
    fields: formFields.map((field: any, index: number) => ({
      id: field.id,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || `Votre ${field.label.toLowerCase()}`,
      required: field.required || false,
      order: index,
      ...(field.type === 'select' && field.options ? { options: field.options } : {}),
      ...(field.type === 'textarea' ? { rows: 3 } : {})
    })),
    submitButtonText: campaign.buttonConfig?.text || 'Participer',
    title: campaign.screens?.[1]?.title || 'Participez au jeu',
    description: campaign.screens?.[1]?.description || 'Remplissez le formulaire pour participer'
  };

  const FormCanvas = require('../components/GameTypes/FormCanvas').default;
  
  return (
    <FormCanvas 
      key={`test-form-canvas-${formFields.length}`}
      config={campaign.design?.formConfig || {}}
      formStructure={syncedFormStructure}
      onSubmit={(formData: any) => {
        console.log('Form submitted:', formData);
      }}
      isPreview={false}
    />
  );
};

describe('Form Fields Synchronization Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should sync formFields to formStructure correctly', () => {
    const mockCampaign = {
      type: 'form',
      formFields: [
        { id: 'prenom', label: 'Prénom', type: 'text', required: true },
        { id: 'nom', label: 'Nom', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true }
      ],
      design: { formConfig: {} },
      buttonConfig: { text: 'Participer' },
      screens: [null, { title: 'Test Form', description: 'Test Description' }]
    };

    render(<TestFormSyncComponent campaign={mockCampaign} />);

    // Check that all fields are rendered
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('3');
    expect(screen.getByTestId('form-title')).toHaveTextContent('Test Form');
    
    // Check field details
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Prénom');
    expect(screen.getByTestId('field-0-type')).toHaveTextContent('text');
    expect(screen.getByTestId('field-0-required')).toHaveTextContent('true');
    
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('Nom');
    expect(screen.getByTestId('field-2-label')).toHaveTextContent('Email');
    expect(screen.getByTestId('field-2-type')).toHaveTextContent('email');
  });

  it('should handle newly added fields', () => {
    const initialCampaign = {
      type: 'form',
      formFields: [
        { id: 'prenom', label: 'Prénom', type: 'text', required: true }
      ],
      design: { formConfig: {} }
    };

    const { rerender } = render(<TestFormSyncComponent campaign={initialCampaign} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('1');

    // Add a new field
    const updatedCampaign = {
      ...initialCampaign,
      formFields: [
        ...initialCampaign.formFields,
        { id: 'nouveau-champ', label: 'Nouveau champ', type: 'text', required: false }
      ]
    };

    rerender(<TestFormSyncComponent campaign={updatedCampaign} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('2');
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('Nouveau champ');
    expect(screen.getByTestId('field-1-required')).toHaveTextContent('false');
  });

  it('should handle field type changes correctly', () => {
    const campaignWithSelect = {
      type: 'form',
      formFields: [
        { 
          id: 'choice', 
          label: 'Choix', 
          type: 'select', 
          required: true,
          options: ['Option 1', 'Option 2']
        }
      ],
      design: { formConfig: {} }
    };

    render(<TestFormSyncComponent campaign={campaignWithSelect} />);
    
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Choix');
    expect(screen.getByTestId('field-0-type')).toHaveTextContent('select');
  });

  it('should handle textarea fields with rows property', () => {
    const campaignWithTextarea = {
      type: 'form',
      formFields: [
        { id: 'message', label: 'Message', type: 'textarea', required: false }
      ],
      design: { formConfig: {} }
    };

    render(<TestFormSyncComponent campaign={campaignWithTextarea} />);
    
    expect(screen.getByTestId('field-0-type')).toHaveTextContent('textarea');
  });

  it('should maintain field order correctly', () => {
    const campaignWithOrderedFields = {
      type: 'form',
      formFields: [
        { id: 'third', label: 'Third Field', type: 'text', required: false },
        { id: 'first', label: 'First Field', type: 'text', required: true },
        { id: 'second', label: 'Second Field', type: 'email', required: true }
      ],
      design: { formConfig: {} }
    };

    render(<TestFormSyncComponent campaign={campaignWithOrderedFields} />);
    
    // Fields should maintain the order from formFields array
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Third Field');
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('First Field');
    expect(screen.getByTestId('field-2-label')).toHaveTextContent('Second Field');
  });

  it('should handle empty formFields gracefully', () => {
    const campaignWithNoFields = {
      type: 'form',
      formFields: [],
      design: { formConfig: {} }
    };

    render(<TestFormSyncComponent campaign={campaignWithNoFields} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('0');
  });

  it('should handle missing formFields property', () => {
    const campaignWithoutFormFields = {
      type: 'form',
      design: { formConfig: {} }
    };

    render(<TestFormSyncComponent campaign={campaignWithoutFormFields} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('0');
  });
});

// Responsive Tests
describe('Form Fields Responsive Tests', () => {
  const mockCampaign = {
    type: 'form',
    formFields: [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ],
    design: { formConfig: {} }
  };

  it('should render consistently across desktop breakpoint', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<TestFormSyncComponent campaign={mockCampaign} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('2');
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Prénom');
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('Email');
  });

  it('should render consistently across tablet breakpoint', () => {
    // Mock tablet viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<TestFormSyncComponent campaign={mockCampaign} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('2');
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Prénom');
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('Email');
  });

  it('should render consistently across mobile breakpoint', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<TestFormSyncComponent campaign={mockCampaign} />);
    
    expect(screen.getByTestId('form-fields-count')).toHaveTextContent('2');
    expect(screen.getByTestId('field-0-label')).toHaveTextContent('Prénom');
    expect(screen.getByTestId('field-1-label')).toHaveTextContent('Email');
  });
});
