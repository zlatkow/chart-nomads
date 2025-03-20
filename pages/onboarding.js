import React, { useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import countries from "world-countries";
import Noise from "../components/Noise";
import Image from "next/image";

const countryPhoneCodes = {
    "Afghanistan": "af",
    "Albania": "al",
    "Algeria": "dz",
    "Andorra": "ad",
    "Angola": "ao",
    "Antigua and Barbuda": "ag",
    "Argentina": "ar",
    "Armenia": "am",
    "Australia": "au",
    "Austria": "at",
    "Azerbaijan": "az",
    "Bahamas": "bs",
    "Bahrain": "bh",
    "Bangladesh": "bd",
    "Barbados": "bb",
    "Belarus": "by",
    "Belgium": "be",
    "Belize": "bz",
    "Benin": "bj",
    "Bhutan": "bt",
    "Bolivia": "bo",
    "Bosnia and Herzegovina": "ba",
    "Botswana": "bw",
    "Brazil": "br",
    "Brunei": "bn",
    "Bulgaria": "bg",
    "Burkina Faso": "bf",
    "Burundi": "bi",
    "Cabo Verde": "cv",
    "Cambodia": "kh",
    "Cameroon": "cm",
    "Canada": "ca",
    "Central African Republic": "cf",
    "Chad": "td",
    "Chile": "cl",
    "China": "cn",
    "Colombia": "co",
    "Comoros": "km",
    "Congo": "cg",
    "Costa Rica": "cr",
    "Croatia": "hr",
    "Cuba": "cu",
    "Cyprus": "cy",
    "Czech Republic": "cz",
    "Denmark": "dk",
    "Djibouti": "dj",
    "Dominica": "dm",
    "Dominican Republic": "do",
    "Ecuador": "ec",
    "Egypt": "eg",
    "El Salvador": "sv",
    "Equatorial Guinea": "gq",
    "Eritrea": "er",
    "Estonia": "ee",
    "Eswatini": "sz",
    "Ethiopia": "et",
    "Fiji": "fj",
    "Finland": "fi",
    "France": "fr",
    "Gabon": "ga",
    "Gambia": "gm",
    "Georgia": "ge",
    "Germany": "de",
    "Ghana": "gh",
    "Greece": "gr",
    "Grenada": "gd",
    "Guatemala": "gt",
    "Guinea": "gn",
    "Guinea-Bissau": "gw",
    "Guyana": "gy",
    "Haiti": "ht",
    "Honduras": "hn",
    "Hungary": "hu",
    "Iceland": "is",
    "India": "in",
    "Indonesia": "id",
    "Iran": "ir",
    "Iraq": "iq",
    "Ireland": "ie",
    "Israel": "il",
    "Italy": "it",
    "Jamaica": "jm",
    "Japan": "jp",
    "Jordan": "jo",
    "Kazakhstan": "kz",
    "Kenya": "ke",
    "Kiribati": "ki",
    "Kuwait": "kw",
    "Kyrgyzstan": "kg",
    "Laos": "la",
    "Latvia": "lv",
    "Lebanon": "lb",
    "Lesotho": "ls",
    "Liberia": "lr",
    "Libya": "ly",
    "Liechtenstein": "li",
    "Lithuania": "lt",
    "Luxembourg": "lu",
    "Madagascar": "mg",
    "Malawi": "mw",
    "Malaysia": "my",
    "Maldives": "mv",
    "Mali": "ml",
    "Malta": "mt",
    "Marshall Islands": "mh",
    "Mauritania": "mr",
    "Mauritius": "mu",
    "Mexico": "mx",
    "Micronesia": "fm",
    "Moldova": "md",
    "Monaco": "mc",
    "Mongolia": "mn",
    "Montenegro": "me",
    "Morocco": "ma",
    "Mozambique": "mz",
    "Myanmar": "mm",
    "Namibia": "na",
    "Nauru": "nr",
    "Nepal": "np",
    "Netherlands": "nl",
    "New Zealand": "nz",
    "Nicaragua": "ni",
    "Niger": "ne",
    "Nigeria": "ng",
    "North Korea": "kp",
    "North Macedonia": "mk",
    "Norway": "no",
    "Oman": "om",
    "Pakistan": "pk",
    "Palau": "pw",
    "Palestine": "ps",
    "Panama": "pa",
    "Papua New Guinea": "pg",
    "Paraguay": "py",
    "Peru": "pe",
    "Philippines": "ph",
    "Poland": "pl",
    "Portugal": "pt",
    "Qatar": "qa",
    "Romania": "ro",
    "Russia": "ru",
    "Rwanda": "rw",
    "Saint Kitts and Nevis": "kn",
    "Saint Lucia": "lc",
    "Saint Vincent and the Grenadines": "vc",
    "Samoa": "ws",
    "San Marino": "sm",
    "Sao Tome and Principe": "st",
    "Saudi Arabia": "sa",
    "Senegal": "sn",
    "Serbia": "rs",
    "Seychelles": "sc",
    "Sierra Leone": "sl",
    "Singapore": "sg",
    "Slovakia": "sk",
    "Slovenia": "si",
    "Solomon Islands": "sb",
    "Somalia": "so",
    "South Africa": "za",
    "South Korea": "kr",
    "South Sudan": "ss",
    "Spain": "es",
    "Sri Lanka": "lk",
    "Sudan": "sd",
    "Suriname": "sr",
    "Sweden": "se",
    "Switzerland": "ch",
    "Syria": "sy",
    "Taiwan": "tw",
    "Tajikistan": "tj",
    "Tanzania": "tz",
    "Thailand": "th",
    "Timor-Leste": "tl",
    "Togo": "tg",
    "Tonga": "to",
    "Trinidad and Tobago": "tt",
    "Tunisia": "tn",
    "Turkey": "tr",
    "Turkmenistan": "tm",
    "Tuvalu": "tv",
    "Uganda": "ug",
    "Ukraine": "ua",
    "United Arab Emirates": "ae",
    "United Kingdom": "gb",
    "United States": "us",
    "Uruguay": "uy",
    "Uzbekistan": "uz",
    "Vanuatu": "vu",
    "Vatican City": "va",
    "Venezuela": "ve",
    "Vietnam": "vn",
    "Yemen": "ye",
    "Zambia": "zm",
    "Zimbabwe": "zw"
  };
  

const formattedCountries = countries.map((country) => ({
  value: country.name.common,
  label: (
    <div className="flex items-center">
      <Image
        src={`https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`}
        alt={country.name.common}
        className="w-5 h-4 mr-2"
      />
      {country.name.common}
    </div>
  ),
}));

const Onboarding = () => {
  const [phone, setPhone] = useState("");

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    const countryCode = countryPhoneCodes[selectedOption?.value] || "";
    setPhone(countryCode);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_bottom_right,_#EDB900_1%,_#6f5908_22%,_#0f0f0f_53%)] text-white">
      <Noise />
      {/* Progress Bar */}
      <div className='fixed top-0 left-0 w-full h-[7px] bg-[rgba(231,231,231,0.05)] flex'>
        <div className='h-full w-[20%] opacity-90 bg-[#EDB900]'></div>
        <div className='h-full w-[20%] bg-[#EDB900]'></div>
        <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
        <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
        <div className='h-full w-[20%] bg-[rgba(231,231,231,0.05)]'></div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-lg p-12 bg-[#0f0f0f] rounded-lg shadow-lg z-50">
        <h1 className="text-4xl font-bold text-center mb-2">Tell us about yourself</h1>
        <p className="text-white-400 text-center mb-6 text-sm">
          To provide a more personalized experience, we need to know a bit about you.
        </p>

        {/* Country Dropdown */}
        <label className="block mb-2 text-sm font-medium">Country</label>
        <Select
          options={formattedCountries}
          onChange={handleCountryChange}
          placeholder="Select a country..."
          className="text-black h-[45px]"
        />

        {/* Date of Birth */}
        <label className="block mt-4 mb-2 text-sm font-medium">Date of Birth</label>
        <input
          type="date"
          className="w-full p-3 rounded bg-gray-700 text-white"
        />

        {/* Phone Number */}
        <label className="block mt-4 mb-2 text-sm font-medium">Phone Number</label>
        <PhoneInput
            country={phone}
            value={phone}
            onChange={(phone) => setPhone(phone)}
            inputClass="w-full p-3 rounded bg-gray-700 text-white"
            buttonClass="bg-gray-700 text-white"
            dropdownClass="bg-gray-700 text-white"
            />


        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button className="px-6 py-2 border border-yellow-500 text-yellow-500 rounded-lg">
            Skip
          </button>
          <button className="px-6 py-2 bg-yellow-500 text-black rounded-lg">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
