'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { ChevronDown, Search, X } from 'lucide-react';

interface PhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  label?: string;
  error?: string;
  helperText?: string;
  defaultCountry?: string;
  control?: any;
  name: TName;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

// Country interface
interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

// Helper to generate flag emoji from country code
const getCountryFlag = (code: string): string => {
  return code
    .toUpperCase()
    .split('')
    .map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

// Comprehensive countries list with all countries
const ALL_COUNTRIES: Country[] = [
  // Africa
  { code: 'ZA', name: 'South Africa', flag: getCountryFlag('ZA'), dialCode: '+27' },
  { code: 'EG', name: 'Egypt', flag: getCountryFlag('EG'), dialCode: '+20' },
  { code: 'NG', name: 'Nigeria', flag: getCountryFlag('NG'), dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: getCountryFlag('KE'), dialCode: '+254' },
  { code: 'GH', name: 'Ghana', flag: getCountryFlag('GH'), dialCode: '+233' },
  { code: 'UG', name: 'Uganda', flag: getCountryFlag('UG'), dialCode: '+256' },
  { code: 'TZ', name: 'Tanzania', flag: getCountryFlag('TZ'), dialCode: '+255' },
  { code: 'MA', name: 'Morocco', flag: getCountryFlag('MA'), dialCode: '+212' },
  { code: 'ET', name: 'Ethiopia', flag: getCountryFlag('ET'), dialCode: '+251' },
  { code: 'RW', name: 'Rwanda', flag: getCountryFlag('RW'), dialCode: '+250' },
  { code: 'LT', name: 'Lesotho', flag: getCountryFlag('LT'), dialCode: '+266' },
  { code: 'DZ', name: 'Algeria', flag: getCountryFlag('DZ'), dialCode: '+213' },
  { code: 'SD', name: 'Sudan', flag: getCountryFlag('SD'), dialCode: '+249' },
  { code: 'TN', name: 'Tunisia', flag: getCountryFlag('TN'), dialCode: '+216' },
  { code: 'LY', name: 'Libya', flag: getCountryFlag('LY'), dialCode: '+218' },
  { code: 'MW', name: 'Malawi', flag: getCountryFlag('MW'), dialCode: '+265' },
  { code: 'ZM', name: 'Zambia', flag: getCountryFlag('ZM'), dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: getCountryFlag('ZW'), dialCode: '+263' },
  { code: 'BW', name: 'Botswana', flag: getCountryFlag('BW'), dialCode: '+267' },
  { code: 'NA', name: 'Namibia', flag: getCountryFlag('NA'), dialCode: '+264' },
  { code: 'MZ', name: 'Mozambique', flag: getCountryFlag('MZ'), dialCode: '+258' },
  { code: 'AO', name: 'Angola', flag: getCountryFlag('AO'), dialCode: '+244' },
  { code: 'CM', name: 'Cameroon', flag: getCountryFlag('CM'), dialCode: '+237' },
  { code: 'SN', name: 'Senegal', flag: getCountryFlag('SN'), dialCode: '+221' },
  { code: 'CI', name: 'Ivory Coast', flag: getCountryFlag('CI'), dialCode: '+225' },
  { code: 'ML', name: 'Mali', flag: getCountryFlag('ML'), dialCode: '+223' },
  { code: 'BJ', name: 'Benin', flag: getCountryFlag('BJ'), dialCode: '+229' },
  { code: 'NE', name: 'Niger', flag: getCountryFlag('NE'), dialCode: '+227' },
  { code: 'CG', name: 'Congo', flag: getCountryFlag('CG'), dialCode: '+242' },
  { code: 'CD', name: 'Democratic Republic of Congo', flag: getCountryFlag('CD'), dialCode: '+243' },
  { code: 'GA', name: 'Gabon', flag: getCountryFlag('GA'), dialCode: '+241' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: getCountryFlag('GQ'), dialCode: '+240' },
  { code: 'MU', name: 'Mauritius', flag: getCountryFlag('MU'), dialCode: '+230' },
  { code: 'SC', name: 'Seychelles', flag: getCountryFlag('SC'), dialCode: '+248' },
  { code: 'MG', name: 'Madagascar', flag: getCountryFlag('MG'), dialCode: '+261' },
  
  // Asia
  { code: 'IN', name: 'India', flag: getCountryFlag('IN'), dialCode: '+91' },
  { code: 'PK', name: 'Pakistan', flag: getCountryFlag('PK'), dialCode: '+92' },
  { code: 'BD', name: 'Bangladesh', flag: getCountryFlag('BD'), dialCode: '+880' },
  { code: 'SG', name: 'Singapore', flag: getCountryFlag('SG'), dialCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: getCountryFlag('MY'), dialCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: getCountryFlag('TH'), dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', flag: getCountryFlag('VN'), dialCode: '+84' },
  { code: 'PH', name: 'Philippines', flag: getCountryFlag('PH'), dialCode: '+63' },
  { code: 'ID', name: 'Indonesia', flag: getCountryFlag('ID'), dialCode: '+62' },
  { code: 'CN', name: 'China', flag: getCountryFlag('CN'), dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: getCountryFlag('JP'), dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: getCountryFlag('KR'), dialCode: '+82' },
  { code: 'HK', name: 'Hong Kong', flag: getCountryFlag('HK'), dialCode: '+852' },
  { code: 'TW', name: 'Taiwan', flag: getCountryFlag('TW'), dialCode: '+886' },
  { code: 'LA', name: 'Laos', flag: getCountryFlag('LA'), dialCode: '+856' },
  { code: 'KH', name: 'Cambodia', flag: getCountryFlag('KH'), dialCode: '+855' },
  { code: 'MM', name: 'Myanmar', flag: getCountryFlag('MM'), dialCode: '+95' },
  { code: 'NP', name: 'Nepal', flag: getCountryFlag('NP'), dialCode: '+977' },
  { code: 'AF', name: 'Afghanistan', flag: getCountryFlag('AF'), dialCode: '+93' },
  { code: 'LK', name: 'Sri Lanka', flag: getCountryFlag('LK'), dialCode: '+94' },
  { code: 'MV', name: 'Maldives', flag: getCountryFlag('MV'), dialCode: '+960' },
  { code: 'BT', name: 'Bhutan', flag: getCountryFlag('BT'), dialCode: '+975' },
  
  // Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: getCountryFlag('AE'), dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: getCountryFlag('SA'), dialCode: '+966' },
  { code: 'QA', name: 'Qatar', flag: getCountryFlag('QA'), dialCode: '+974' },
  { code: 'KW', name: 'Kuwait', flag: getCountryFlag('KW'), dialCode: '+965' },
  { code: 'BH', name: 'Bahrain', flag: getCountryFlag('BH'), dialCode: '+973' },
  { code: 'OM', name: 'Oman', flag: getCountryFlag('OM'), dialCode: '+968' },
  { code: 'YE', name: 'Yemen', flag: getCountryFlag('YE'), dialCode: '+967' },
  { code: 'IL', name: 'Israel', flag: getCountryFlag('IL'), dialCode: '+972' },
  { code: 'JO', name: 'Jordan', flag: getCountryFlag('JO'), dialCode: '+962' },
  { code: 'LB', name: 'Lebanon', flag: getCountryFlag('LB'), dialCode: '+961' },
  { code: 'SY', name: 'Syria', flag: getCountryFlag('SY'), dialCode: '+963' },
  { code: 'IQ', name: 'Iraq', flag: getCountryFlag('IQ'), dialCode: '+964' },
  { code: 'IR', name: 'Iran', flag: getCountryFlag('IR'), dialCode: '+98' },
  { code: 'TR', name: 'Turkey', flag: getCountryFlag('TR'), dialCode: '+90' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: getCountryFlag('GB'), dialCode: '+44' },
  { code: 'IE', name: 'Ireland', flag: getCountryFlag('IE'), dialCode: '+353' },
  { code: 'FR', name: 'France', flag: getCountryFlag('FR'), dialCode: '+33' },
  { code: 'DE', name: 'Germany', flag: getCountryFlag('DE'), dialCode: '+49' },
  { code: 'IT', name: 'Italy', flag: getCountryFlag('IT'), dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: getCountryFlag('ES'), dialCode: '+34' },
  { code: 'PT', name: 'Portugal', flag: getCountryFlag('PT'), dialCode: '+351' },
  { code: 'NL', name: 'Netherlands', flag: getCountryFlag('NL'), dialCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: getCountryFlag('BE'), dialCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: getCountryFlag('CH'), dialCode: '+41' },
  { code: 'AT', name: 'Austria', flag: getCountryFlag('AT'), dialCode: '+43' },
  { code: 'CZ', name: 'Czech Republic', flag: getCountryFlag('CZ'), dialCode: '+420' },
  { code: 'PL', name: 'Poland', flag: getCountryFlag('PL'), dialCode: '+48' },
  { code: 'SE', name: 'Sweden', flag: getCountryFlag('SE'), dialCode: '+46' },
  { code: 'NO', name: 'Norway', flag: getCountryFlag('NO'), dialCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: getCountryFlag('DK'), dialCode: '+45' },
  { code: 'FI', name: 'Finland', flag: getCountryFlag('FI'), dialCode: '+358' },
  { code: 'RU', name: 'Russia', flag: getCountryFlag('RU'), dialCode: '+7' },
  { code: 'UA', name: 'Ukraine', flag: getCountryFlag('UA'), dialCode: '+380' },
  { code: 'RO', name: 'Romania', flag: getCountryFlag('RO'), dialCode: '+40' },
  { code: 'BG', name: 'Bulgaria', flag: getCountryFlag('BG'), dialCode: '+359' },
  { code: 'GR', name: 'Greece', flag: getCountryFlag('GR'), dialCode: '+30' },
  { code: 'HU', name: 'Hungary', flag: getCountryFlag('HU'), dialCode: '+36' },
  { code: 'SK', name: 'Slovakia', flag: getCountryFlag('SK'), dialCode: '+421' },
  { code: 'HR', name: 'Croatia', flag: getCountryFlag('HR'), dialCode: '+385' },
  { code: 'SI', name: 'Slovenia', flag: getCountryFlag('SI'), dialCode: '+386' },
  { code: 'IS', name: 'Iceland', flag: getCountryFlag('IS'), dialCode: '+354' },
  { code: 'LU', name: 'Luxembourg', flag: getCountryFlag('LU'), dialCode: '+352' },
  { code: 'MT', name: 'Malta', flag: getCountryFlag('MT'), dialCode: '+356' },
  { code: 'CY', name: 'Cyprus', flag: getCountryFlag('CY'), dialCode: '+357' },
  
  // Americas
  { code: 'US', name: 'United States', flag: getCountryFlag('US'), dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: getCountryFlag('CA'), dialCode: '+1' },
  { code: 'MX', name: 'Mexico', flag: getCountryFlag('MX'), dialCode: '+52' },
  { code: 'BR', name: 'Brazil', flag: getCountryFlag('BR'), dialCode: '+55' },
  { code: 'AR', name: 'Argentina', flag: getCountryFlag('AR'), dialCode: '+54' },
  { code: 'CL', name: 'Chile', flag: getCountryFlag('CL'), dialCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: getCountryFlag('CO'), dialCode: '+57' },
  { code: 'PE', name: 'Peru', flag: getCountryFlag('PE'), dialCode: '+51' },
  { code: 'VE', name: 'Venezuela', flag: getCountryFlag('VE'), dialCode: '+58' },
  { code: 'EC', name: 'Ecuador', flag: getCountryFlag('EC'), dialCode: '+593' },
  { code: 'BO', name: 'Bolivia', flag: getCountryFlag('BO'), dialCode: '+591' },
  { code: 'PY', name: 'Paraguay', flag: getCountryFlag('PY'), dialCode: '+595' },
  { code: 'UY', name: 'Uruguay', flag: getCountryFlag('UY'), dialCode: '+598' },
  { code: 'GY', name: 'Guyana', flag: getCountryFlag('GY'), dialCode: '+592' },
  { code: 'SR', name: 'Suriname', flag: getCountryFlag('SR'), dialCode: '+597' },
  { code: 'CR', name: 'Costa Rica', flag: getCountryFlag('CR'), dialCode: '+506' },
  { code: 'PA', name: 'Panama', flag: getCountryFlag('PA'), dialCode: '+507' },
  { code: 'GT', name: 'Guatemala', flag: getCountryFlag('GT'), dialCode: '+502' },
  { code: 'HN', name: 'Honduras', flag: getCountryFlag('HN'), dialCode: '+504' },
  { code: 'SV', name: 'El Salvador', flag: getCountryFlag('SV'), dialCode: '+503' },
  { code: 'NI', name: 'Nicaragua', flag: getCountryFlag('NI'), dialCode: '+505' },
  { code: 'BZ', name: 'Belize', flag: getCountryFlag('BZ'), dialCode: '+501' },
  { code: 'JM', name: 'Jamaica', flag: getCountryFlag('JM'), dialCode: '+1876' },
  { code: 'DO', name: 'Dominican Republic', flag: getCountryFlag('DO'), dialCode: '+1' },
  { code: 'CU', name: 'Cuba', flag: getCountryFlag('CU'), dialCode: '+53' },
  { code: 'PR', name: 'Puerto Rico', flag: getCountryFlag('PR'), dialCode: '+1' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: getCountryFlag('AG'), dialCode: '+1' },
  { code: 'BS', name: 'Bahamas', flag: getCountryFlag('BS'), dialCode: '+1' },
  { code: 'BB', name: 'Barbados', flag: getCountryFlag('BB'), dialCode: '+1' },
  { code: 'BM', name: 'Bermuda', flag: getCountryFlag('BM'), dialCode: '+1' },
  { code: 'KY', name: 'Cayman Islands', flag: getCountryFlag('KY'), dialCode: '+1' },
  { code: 'GD', name: 'Grenada', flag: getCountryFlag('GD'), dialCode: '+1' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: getCountryFlag('KN'), dialCode: '+1' },
  { code: 'LC', name: 'Saint Lucia', flag: getCountryFlag('LC'), dialCode: '+1' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: getCountryFlag('VC'), dialCode: '+1' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: getCountryFlag('TT'), dialCode: '+1' },
  
  // Oceania
  { code: 'AU', name: 'Australia', flag: getCountryFlag('AU'), dialCode: '+61' },
  { code: 'NZ', name: 'New Zealand', flag: getCountryFlag('NZ'), dialCode: '+64' },
  { code: 'FJ', name: 'Fiji', flag: getCountryFlag('FJ'), dialCode: '+679' },
  { code: 'PG', name: 'Papua New Guinea', flag: getCountryFlag('PG'), dialCode: '+675' },
  { code: 'SB', name: 'Solomon Islands', flag: getCountryFlag('SB'), dialCode: '+677' },
  { code: 'VU', name: 'Vanuatu', flag: getCountryFlag('VU'), dialCode: '+678' },
  { code: 'WS', name: 'Samoa', flag: getCountryFlag('WS'), dialCode: '+685' },
  { code: 'TO', name: 'Tonga', flag: getCountryFlag('TO'), dialCode: '+676' },
  { code: 'KI', name: 'Kiribati', flag: getCountryFlag('KI'), dialCode: '+686' },
  { code: 'MH', name: 'Marshall Islands', flag: getCountryFlag('MH'), dialCode: '+692' },
  { code: 'FM', name: 'Micronesia', flag: getCountryFlag('FM'), dialCode: '+691' },
  { code: 'PW', name: 'Palau', flag: getCountryFlag('PW'), dialCode: '+680' },
  { code: 'GU', name: 'Guam', flag: getCountryFlag('GU'), dialCode: '+1' },
].sort((a, b) => a.name.localeCompare(b.name));

const CustomPhoneInputComponent = React.forwardRef<
  HTMLInputElement,
  PhoneInputProps
>(
  (
    {
      label,
      error,
      helperText,
      defaultCountry = 'NG',
      control,
      name,
      placeholder = 'Enter phone number',
      disabled = false,
      required = false,
    },
    ref
  ) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(
      ALL_COUNTRIES.find(c => c.code === defaultCountry) || ALL_COUNTRIES.find(c => c.code === 'NG')
    );
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredCountries = useMemo(() => {
      if (!searchQuery.trim()) {
        return ALL_COUNTRIES;
      }
      
      const query = searchQuery.toLowerCase();
      return ALL_COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.dialCode.includes(query)
      );
    }, [searchQuery]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const handleCountrySelect = (country: typeof ALL_COUNTRIES[0], fieldOnChange?: any) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);
      setSearchQuery('');
      
      if (inputRef.current) {
        const currentValue = inputRef.current.value;
        const numberOnly = currentValue.replace(/^\+\d+\s*/, '');
        const newValue = `${country.dialCode} ${numberOnly}`.trim();
        inputRef.current.value = newValue;
        
        if (fieldOnChange) {
          fieldOnChange(newValue);
        }
        
        inputRef.current.focus();
      }
    };

    const handlePhoneInputChange = (newValue: string, fieldOnChange?: any) => {
      const dialCodeMatch = newValue.match(/^\+(\d+)/);
      if (dialCodeMatch) {
        const dialCode = `+${dialCodeMatch[1]}`;
        const foundCountry = ALL_COUNTRIES.find(c => c.dialCode === dialCode);
        if (foundCountry && foundCountry.code !== selectedCountry?.code) {
          setSelectedCountry(foundCountry);
        }
      }
      
      if (fieldOnChange) {
        fieldOnChange(newValue);
      }
    };

    if (!control) {
      return (
        <div className="w-full">
          {label && (
            <label className="block label mb-2 text-gray-700">
              {label}
              {required && <span className="text-red-600">*</span>}
            </label>
          )}

          <div className="relative">
            <div className="flex items-center w-full rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-[#a9b7ff] focus-within:border-transparent transition-all" style={{ zIndex: isDropdownOpen ? 40 : 'auto' }}>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200 min-w-fit flex-shrink-0"
                  disabled={disabled}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="text-lg leading-none">{selectedCountry?.flag}</span>
                  <span className="text-xs font-semibold text-gray-600 hidden sm:inline">{selectedCountry?.code}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-2xl z-50"
                    role="listbox"
                  >
                    {/* Search Header */}
                    <div className="sticky top-0 p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-t-lg">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#a9b7ff] focus:border-transparent"
                          aria-label="Search countries"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Clear search"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Countries List */}
                    <div className="max-h-80 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country, idx) => (
                          <button
                            key={country.code}
                            onClick={() => handleCountrySelect(country)}
                            type="button"
                            className={`w-full px-3 py-2.5 text-left text-sm transition-all flex items-center gap-3 border-l-2 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                              country.code === selectedCountry?.code 
                                ? 'bg-blue-50 border-l-blue-600' 
                                : 'border-l-transparent hover:border-l-blue-300'
                            }`}
                            role="option"
                            aria-selected={country.code === selectedCountry?.code}
                          >
                            <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{country.name}</div>
                              <div className="text-xs text-gray-500">{country.dialCode}</div>
                            </div>
                            {country.code === selectedCountry?.code && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-12 text-center">
                          <div className="text-2xl mb-2">🔍</div>
                          <p className="text-sm text-gray-500">No countries found</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching by name or code</p>
                        </div>
                      )}
                    </div>

                    {/* Results Counter */}
                    {searchQuery && filteredCountries.length > 0 && (
                      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                        {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'} found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="tel"
                placeholder={placeholder}
                defaultValue={`${selectedCountry?.dialCode} `}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                className="flex-1 px-3 py-3 outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                disabled={disabled}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {helperText && !error && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
        </div>
      );
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="w-full">
            {label && (
              <label className="block label mb-2 text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
              </label>
            )}

            <div className="relative">
              <div className={`flex items-center w-full rounded-lg border transition-all ${
                error 
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent' 
                  : 'border-gray-300 focus-within:ring-2 focus-within:ring-[#a9b7ff] focus-within:border-transparent'
              } bg-white`} style={{ zIndex: isDropdownOpen ? 40 : 'auto' }}>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200 min-w-fit flex-shrink-0"
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="text-lg leading-none">{selectedCountry?.flag}</span>
                    <span className="text-xs font-semibold text-gray-600 hidden sm:inline">{selectedCountry?.code}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {isDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-2xl z-50"
                      role="listbox"
                    >
                      {/* Search Header */}
                      <div className="sticky top-0 p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-t-lg">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search country..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#a9b7ff] focus:border-transparent"
                            aria-label="Search countries"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                              aria-label="Clear search"
                            >
                              <X size={14} className="text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Countries List */}
                      <div className="max-h-80 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => handleCountrySelect(country, field.onChange)}
                              type="button"
                              className={`w-full px-3 py-2.5 text-left text-sm transition-all flex items-center gap-3 border-l-2 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                                country.code === selectedCountry?.code 
                                  ? 'bg-blue-50 border-l-blue-600' 
                                  : 'border-l-transparent hover:border-l-blue-300'
                              }`}
                              role="option"
                              aria-selected={country.code === selectedCountry?.code}
                            >
                              <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900">{country.name}</div>
                                <div className="text-xs text-gray-500">{country.dialCode}</div>
                              </div>
                              {country.code === selectedCountry?.code && (
                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-12 text-center">
                            <div className="text-2xl mb-2">🔍</div>
                            <p className="text-sm text-gray-500">No countries found</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching by name or code</p>
                          </div>
                        )}
                      </div>

                      {/* Results Counter */}
                      {searchQuery && filteredCountries.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                          {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'} found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="tel"
                  placeholder={placeholder}
                  value={field.value || `${selectedCountry?.dialCode} `}
                  onChange={(e) => handlePhoneInputChange(e.target.value, field.onChange)}
                  onBlur={field.onBlur}
                  className="flex-1 px-3 py-3 outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  disabled={disabled}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            {helperText && !error && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
          </div>
        )}
      />
    );
  }
);

CustomPhoneInputComponent.displayName = 'PhoneInput';

export const PhoneInput = CustomPhoneInputComponent;

export const formatPhoneNumber = (phone: string): string => {
  return phone;
};
