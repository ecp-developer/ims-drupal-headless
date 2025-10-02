import React, { useState, useEffect } from 'react';
import taxonomyService from '../../services/taxonomyService';
import type { TaxonomyTerm, TaxonomyVocabulary } from '../../types/drupal';

interface TaxonomySelectProps {
  vocabulary: TaxonomyVocabulary;
  value: string;
  onChange: (value: string, term?: TaxonomyTerm) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const TaxonomySelect: React.FC<TaxonomySelectProps> = ({
  vocabulary,
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [terms, setTerms] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTerms();
  }, [vocabulary]);

  const loadTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedTerms: TaxonomyTerm[] = [];
      
      if (vocabulary === 'country') {
        fetchedTerms = await taxonomyService.getCountries();
      } else if (vocabulary === 'city') {
        fetchedTerms = await taxonomyService.getCities();
      } else {
        // Generic fetch for any vocabulary
        const response = await taxonomyService.getTermsByVocabulary(vocabulary);
        fetchedTerms = response.data || [];
      }
      
      setTerms(fetchedTerms);
      
      // If no terms found, show a helpful message
      if (fetchedTerms.length === 0) {
        setError(`No ${vocabulary} options available. Please add ${vocabulary} terms in Drupal.`);
      }
    } catch (err) {
      console.error(`Error loading ${vocabulary} terms:`, err);
      setError(`Failed to load ${vocabulary} options from Drupal.`);
      setTerms([]); // Don't provide fallback data - use real data only
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedTerm = terms.find(term => term.id === selectedValue);
    onChange(selectedValue, selectedTerm);
  };

  if (loading) {
    return (
      <select disabled className={`taxonomy-select loading ${className}`}>
        <option>Loading {vocabulary}...</option>
      </select>
    );
  }

  return (
    <div className="taxonomy-select-container">
      <select
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled || terms.length === 0}
        className={`taxonomy-select ${error ? 'error' : ''} ${className}`}
      >
        <option value="">{placeholder}</option>
        {terms.map((term) => (
          <option key={term.id} value={term.id}>
            {term.attributes.name}
          </option>
        ))}
      </select>
      {error && (
        <div className="taxonomy-error">
          <small>{error}</small>
          <small>
            Configure {vocabulary} taxonomy in Drupal: 
            /admin/structure/taxonomy/manage/{vocabulary}/add
          </small>
        </div>
      )}
    </div>
  );
};

export default TaxonomySelect;
