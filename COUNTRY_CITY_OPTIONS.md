# How to Make Cities Filter by Country

## Option 1: Keep Independent (Current - No Changes Needed)
Your current setup works! Countries and cities are separate dropdowns.

**Pros:**
- Already working
- No Drupal configuration needed

**Cons:**
- User can select mismatched country/city (USA + Karachi)
- Not ideal UX for large lists

---

## Option 2: Add Country-City Relationship (Recommended)

### Step 1: Add Country Field to City Taxonomy

1. Go to Drupal admin: **Structure → Taxonomy → City → Manage fields**
2. Click **Add field**
3. Select: **Reference → Other → Entity reference**
4. Label: **Country**
5. Machine name: `field_country`
6. Target type: **Taxonomy term**
7. Reference type: **Country** vocabulary
8. Save

### Step 2: Add Country to Each City Term

1. Go to **Structure → Taxonomy → City**
2. Edit each city term
3. Select its country (e.g., Karachi → Pakistan)
4. Save all city terms

### Step 3: Update Frontend Code

Update `VendorForm.tsx` to filter cities based on selected country:

```typescript
const [allCities, setAllCities] = useState<TaxonomyTerm[]>([]);
const [filteredCities, setFilteredCities] = useState<TaxonomyTerm[]>([]);

// Fetch cities with country relationship
const fetchTaxonomies = async () => {
  try {
    // Fetch countries
    const countriesResponse = await fetch('/jsonapi/taxonomy_term/country');
    const countriesData = await countriesResponse.json();
    setCountries(
      countriesData.data.map((term: any) => ({
        id: term.id,
        name: term.attributes.name
      }))
    );

    // Fetch cities with country relationship
    const citiesResponse = await fetch('/jsonapi/taxonomy_term/city?include=field_country');
    const citiesData = await citiesResponse.json();
    
    const citiesWithCountry = citiesData.data.map((term: any) => ({
      id: term.id,
      name: term.attributes.name,
      countryId: term.relationships?.field_country?.data?.id || null
    }));
    
    setAllCities(citiesWithCountry);
    setFilteredCities(citiesWithCountry); // Initially show all
  } catch (error) {
    console.error('Error fetching taxonomies:', error);
  }
};

// When country changes, filter cities
const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const countryId = e.target.value;
  
  setFormData(prev => ({
    ...prev,
    country: countryId,
    city: '' // Reset city when country changes
  }));

  // Filter cities by selected country
  if (countryId) {
    const filtered = allCities.filter(city => city.countryId === countryId);
    setFilteredCities(filtered);
  } else {
    setFilteredCities(allCities); // Show all if no country selected
  }
};
```

---

## Option 3: Use Hierarchical Taxonomy (Alternative)

Make city a **child term** of country in a single taxonomy.

### Structure:
```
- Pakistan (parent)
  - Karachi (child)
  - Lahore (child)
  - Islamabad (child)
- USA (parent)
  - New York (child)
  - Los Angeles (child)
```

### Pros:
- Built-in Drupal hierarchy
- Easy to manage

### Cons:
- Requires restructuring existing taxonomies
- More complex to query

---

## My Recommendation

**For now**: Use **Option 1** (current setup) if:
- You don't have many cities
- Data quality isn't critical
- You want it working immediately

**For production**: Implement **Option 2** because:
- Better user experience
- Prevents data mismatches
- Professional data validation
- Only takes ~30 minutes to set up

---

## Quick Decision Guide

**Keep current setup if:**
- ✅ You have < 20 cities
- ✅ You trust users to select correctly
- ✅ You want to test functionality first

**Add country-city relationship if:**
- ✅ You have many cities (50+)
- ✅ You want data validation
- ✅ You're building for production use
- ✅ Multiple users will enter data

Let me know which option you prefer and I can help implement it!
