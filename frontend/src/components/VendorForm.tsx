import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService-new';
import '../styles/VendorForm.css';

interface VendorFormProps {
  onNavigate: (view: string) => void;
  vendorId?: string;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  vendorCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  country: string;
  city: string;
  status: boolean;
}

interface TaxonomyTerm {
  id: string;
  name: string;
}

const VendorForm: React.FC<VendorFormProps> = ({ onNavigate, vendorId, mode }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    vendorCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    country: '',
    city: '',
    status: true
  });

  const [countries, setCountries] = useState<TaxonomyTerm[]>([]);
  const [cities, setCities] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTaxonomies();
    if (mode === 'edit' && vendorId) {
      fetchVendorData();
    } else {
      generateVendorCode();
    }
  }, [vendorId, mode]);

  const fetchTaxonomies = async () => {
    try {
      console.log('🔍 Fetching taxonomies...');
      
      // Fetch countries
      const countriesResponse = await fetch('/jsonapi/taxonomy_term/country');
      console.log('Countries response status:', countriesResponse.status);
      
      if (!countriesResponse.ok) {
        console.error('Countries fetch failed:', await countriesResponse.text());
        return;
      }
      
      const countriesData = await countriesResponse.json();
      console.log('Countries data:', countriesData);
      
      if (countriesData.data) {
        const countryList = countriesData.data.map((term: any) => ({
          id: term.id,
          name: term.attributes.name
        }));
        console.log('✅ Countries loaded:', countryList);
        setCountries(countryList);
      }

      // Fetch cities
      const citiesResponse = await fetch('/jsonapi/taxonomy_term/city');
      console.log('Cities response status:', citiesResponse.status);
      
      if (!citiesResponse.ok) {
        console.error('Cities fetch failed:', await citiesResponse.text());
        return;
      }
      
      const citiesData = await citiesResponse.json();
      console.log('Cities data:', citiesData);
      
      if (citiesData.data) {
        const cityList = citiesData.data.map((term: any) => ({
          id: term.id,
          name: term.attributes.name
        }));
        console.log('✅ Cities loaded:', cityList);
        setCities(cityList);
      }
    } catch (error) {
      console.error('❌ Error fetching taxonomies:', error);
    }
  };

  const fetchVendorData = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      const vendor = await vendorService.getVendorById(vendorId);
      
      setFormData({
        title: vendor.title,
        vendorCode: vendor.vendorCode,
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        taxNumber: vendor.taxNumber || '',
        country: vendor.countryId || '',
        city: vendor.cityId || '',
        status: vendor.status
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
      alert('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const generateVendorCode = async () => {
    try {
      const code = await vendorService.generateVendorCode();
      setFormData(prev => ({ ...prev, vendorCode: code }));
    } catch (error) {
      console.error('Error generating vendor code:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vendor name is required';
    }

    if (!formData.vendorCode.trim()) {
      newErrors.vendorCode = 'Vendor code is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const vendorData = {
        vendorName: formData.title,
        vendorCode: formData.vendorCode,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxNumber: formData.taxNumber,
        countryId: formData.country || undefined,
        cityId: formData.city || undefined,
        status: formData.status
      };

      console.log('📤 Submitting vendor data:', vendorData);
      console.log('Mode:', mode, 'Vendor ID:', vendorId);

      if (mode === 'create') {
        const result = await vendorService.createVendor(vendorData);
        console.log('✅ Create result:', result);
        alert('Vendor created successfully!');
      } else if (vendorId) {
        console.log('🔄 Updating vendor:', vendorId);
        const result = await vendorService.updateVendor(vendorId, vendorData);
        console.log('✅ Update result:', result);
        alert('Vendor updated successfully!');
      }

      onNavigate('vendor-list');
    } catch (error: any) {
      console.error('❌ Error saving vendor:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      const errorMsg = error.response?.data?.errors?.[0]?.detail 
        || error.response?.data?.message
        || error.message 
        || 'Failed to save vendor. Check console for details.';
      
      alert('Error: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="vendor-form-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-form-container">
      {/* Header */}
      <div className="form-header">
        <div>
          <h1>{mode === 'create' ? 'Add New Vendor' : 'Edit Vendor'}</h1>
          <p>Fill in the vendor information below</p>
        </div>
        <button 
          onClick={() => onNavigate('vendor-list')}
          className="btn-secondary"
        >
          ← Back to List
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="vendor-form">
        <div className="form-card">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                Vendor Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter vendor name"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="vendorCode">
                Vendor Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="vendorCode"
                name="vendorCode"
                value={formData.vendorCode}
                onChange={handleInputChange}
                className={errors.vendorCode ? 'error' : ''}
                placeholder="VEN-XXXXX"
                readOnly={mode === 'create'}
              />
              {errors.vendorCode && <span className="error-message">{errors.vendorCode}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="vendor@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+92 XXX XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxNumber">Tax Number</label>
              <input
                type="text"
                id="taxNumber"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleInputChange}
                placeholder="Enter tax number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
              rows={3}
            />
          </div>
        </div>

        <div className="form-card">
          <h2>Location Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Status</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
              />
              <span>Active</span>
            </label>
            <p className="help-text">
              Inactive vendors will not appear in selection lists
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => onNavigate('vendor-list')}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="spinner-small"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                {mode === 'create' ? 'Create Vendor' : 'Update Vendor'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
