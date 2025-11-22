import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PhoneCountry } from './TypeformPreview';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  defaultCountry?: PhoneCountry;
  textColor?: string;
  primaryColor?: string;
  fontFamily?: string;
  autoFocus?: boolean;
  validationError?: string;
  touched?: boolean;
}

// Liste des pays les plus courants
const COUNTRIES: PhoneCountry[] = [
  { code: 'US', label: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', label: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'IT', label: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'CN', label: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'IN', label: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'BR', label: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'MX', label: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'RU', label: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'ZA', label: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Phone number',
  defaultCountry,
  textColor = '#000000',
  primaryColor = '#841b60',
  fontFamily = 'Inter, sans-serif',
  autoFocus = false,
  validationError,
  touched,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(
    defaultCountry || COUNTRIES[0]
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const handleCountrySelect = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchQuery('');
    // Optionnel : préfixer automatiquement le numéro avec le dial code
    if (!value.startsWith(country.dialCode)) {
      onChange(country.dialCode + ' ');
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-12 px-3 flex items-center gap-2 border-b-2 bg-transparent transition-colors hover:bg-gray-50"
            style={{
              borderColor: validationError && touched ? '#ef4444' : '#e5e7eb',
              color: textColor,
              fontFamily,
            }}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden"
                style={{ maxHeight: '400px' }}
              >
                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-400"
                    style={{ fontFamily }}
                  />
                </div>

                {/* Country List */}
                <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      style={{
                        backgroundColor:
                          selectedCountry.code === country.code
                            ? `${primaryColor}15`
                            : 'transparent',
                      }}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: textColor }}>
                          {country.label}
                        </div>
                        <div className="text-xs text-gray-500">{country.dialCode}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 text-lg border-b-2 bg-transparent outline-none transition-colors"
          style={{
            borderColor: validationError && touched ? '#ef4444' : value ? primaryColor : '#e5e7eb',
            color: textColor,
            fontFamily,
          }}
          autoFocus={autoFocus}
        />
      </div>

      {/* Validation Error */}
      {validationError && touched && (
        <div className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <span>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
