import { countries } from 'countries-list';

// This function takes a country name and returns the corresponding 2-letter ISO code
export const getCountryCode = (countryName: string | undefined): string => {
  if (!countryName) {
    return "us"; // Default to US if country name is not provided
  }
  
  // Normalize the country name for comparison (lowercase and trim)
  const normalizedName = countryName.toLowerCase().trim();
  
  // Search through all countries to find a match
  for (const [code, country] of Object.entries(countries)) {
    if (country.name.toLowerCase() === normalizedName) {
      return code.toLowerCase();
    }
  }
  
  // Try to find partial matches
  for (const [code, country] of Object.entries(countries)) {
    if (normalizedName.includes(country.name.toLowerCase()) || 
        country.name.toLowerCase().includes(normalizedName)) {
      return code.toLowerCase();
    }
  }
  
  // Default to US if no match is found
  return "us";
};

// Optional: Create a function to get the country name from a code
export const getCountryName = (countryCode: string | undefined): string => {
  if (!countryCode) {
    return "United States";
  }
  
  const code = countryCode.toUpperCase();
  return countries[code]?.name || "United States";
};
