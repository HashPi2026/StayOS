import React from 'react';
export const COUNTRY_PRESETS = [
    { country: 'United States', code: 'US', currency: 'US Dollar', sign: '$', defaultRate: 1.0000, flagUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Eyen5gdp_OrZhDraVQTekhHGx0DHQvWR74ZOQIPGqcT7HZ9gSH_arQ9fIr7isuZLQNmgNIcmZ39qVBuXZO7f42DOrHbqrqKU8GkTE4ulamPwUhumTV1UDCkCLmf6o6CmFD0BGRXy8hfoQ9gnMQ4aohPiRSyoEJLncPQKVSR1_eTvrPCou8OVToN7D5FKJAphzuV1u6obarESjkwNDA7FFkaGd80Heb5DnED0fEFrQdesB_o2ydnL' },
    { country: 'Eurozone', code: 'EU', currency: 'Euro', sign: '€', defaultRate: 0.9200, flagUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD32PL3VTYzLw4LKIT6G0cfbvSbXqN-cAdpXdopSQWCLIhLWE3PVljahKB6i4i8R-RejjZWWdqgiPK-D3GcvQsB7XcB2lvx28bKY8jTUEqZQtye5LZ9BHKgmwt6vrb2IGHHglPE76W1OIwq-gPc8d0iWSsbLQuveKrSuOSXF9NhSPRt-vHXOtrnq2RwhFmLBWIQVNPdU5fLR4WdmEvx2NHfl8a4KT_4XIgIbC_VrR2YMUvf4RFYM6zk' },
    { country: 'United Kingdom', code: 'GB', currency: 'British Pound', sign: '£', defaultRate: 0.7900, flagUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjy14J6opKxN6bFSPgem2gsnsOAianEA-4yBmSOYbkddZV2IFGNFvnJ-5ooGBxnWOsDdsE697xSjcuyLvTPr4D21Jvqwl28LGeFiCXN6Cu96RRPhuBNsHUiSg6NoqOW-W9WYbgLio_d-k-dC7SldiBRTmPOvOwH3XXKIR6M1qGXYIoV5m_lQiugsc53YjpHmTiHohAFHM_e1zuDudc-Y9VxjmKiyt_K-N4ROWb-p_cji4L3l9BGi6R' },
    { country: 'Japan', code: 'JP', currency: 'Japanese Yen', sign: '¥', defaultRate: 149.5000 },
    { country: 'Canada', code: 'CA', currency: 'Canadian Dollar', sign: 'C$', defaultRate: 1.3600 },
    { country: 'Australia', code: 'AU', currency: 'Australian Dollar', sign: 'A$', defaultRate: 1.5200 },
    { country: 'Switzerland', code: 'CH', currency: 'Swiss Franc', sign: 'CHF', defaultRate: 0.8800 },
    { country: 'India', code: 'IN', currency: 'Indian Rupee', sign: '₹', defaultRate: 83.1500 },
    { country: 'Singapore', code: 'SG', currency: 'Singapore Dollar', sign: 'S$', defaultRate: 1.3400 },
    { country: 'United Arab Emirates', code: 'AE', currency: 'UAE Dirham', sign: 'AED', defaultRate: 3.6725 },
    { country: 'China', code: 'CN', currency: 'Chinese Yuan', sign: '¥', defaultRate: 7.2300 },
    { country: 'New Zealand', code: 'NZ', currency: 'New Zealand Dollar', sign: 'NZ$', defaultRate: 1.6500 },
    { country: 'Mexico', code: 'MX', currency: 'Mexican Peso', sign: 'Mex$', defaultRate: 17.1000 },
    { country: 'Brazil', code: 'BR', currency: 'Brazilian Real', sign: 'R$', defaultRate: 4.9500 },
    { country: 'South Korea', code: 'KR', currency: 'South Korean Won', sign: '₩', defaultRate: 1330.0000 },
    { country: 'Saudi Arabia', code: 'SA', currency: 'Saudi Riyal', sign: 'SAR', defaultRate: 3.7500 },
    { country: 'Sweden', code: 'SE', currency: 'Swedish Krona', sign: 'kr', defaultRate: 10.4500 },
    { country: 'Norway', code: 'NO', currency: 'Norwegian Krone', sign: 'kr', defaultRate: 10.6000 },
    { country: 'Thailand', code: 'TH', currency: 'Thai Baht', sign: '฿', defaultRate: 35.8000 },
    { country: 'Hong Kong', code: 'HK', currency: 'Hong Kong Dollar', sign: 'HK$', defaultRate: 7.8200 },
];
export const getCountryEmoji = (countryOrCode) => {
    const codeMap = {
        'United States': '🇺🇸',
        'US': '🇺🇸',
        'Eurozone': '🇪🇺',
        'EU': '🇪🇺',
        'United Kingdom': '🇬🇧',
        'GB': '🇬🇧',
        'Japan': '🇯🇵',
        'JP': '🇯🇵',
        'Canada': '🇨🇦',
        'CA': '🇨🇦',
        'Australia': '🇦🇺',
        'AU': '🇦🇺',
        'Switzerland': '🇨🇭',
        'CH': '🇨🇭',
        'India': '🇮🇳',
        'IN': '🇮🇳',
        'Singapore': '🇸🇬',
        'SG': '🇸🇬',
        'United Arab Emirates': '🇦🇪',
        'AE': '🇦🇪',
        'China': '🇨🇳',
        'CN': '🇨🇳',
        'New Zealand': '🇳🇿',
        'NZ': '🇳🇿',
        'Mexico': '🇲🇽',
        'MX': '🇲🇽',
        'Brazil': '🇧🇷',
        'BR': '🇧🇷',
        'South Korea': '🇰🇷',
        'KR': '🇰🇷',
        'Saudi Arabia': '🇸🇦',
        'SA': '🇸🇦',
        'Sweden': '🇸🇪',
        'SE': '🇸🇪',
        'Norway': '🇳🇴',
        'NO': '🇳🇴',
        'Thailand': '🇹🇭',
        'TH': '🇹🇭',
        'Hong Kong': '🇭🇰',
        'HK': '🇭🇰',
    };
    return codeMap[countryOrCode] || '🌐';
};
export const CountryFlag = ({ country, countryCode, flagUrl, className = 'w-6 h-4', }) => {
    // If we have an explicit image flag URL (like in the screenshot)
    if (flagUrl) {
        return (<div className={`${className} rounded-sm bg-cover bg-center border border-[#c6c6cd]/40 shrink-0`} style={{ backgroundImage: `url('${flagUrl}')` }}/>);
    }
    // Find in presets
    const matched = COUNTRY_PRESETS.find((c) => c.country.toLowerCase() === country.toLowerCase() || (countryCode && c.code.toLowerCase() === countryCode.toLowerCase()));
    if (matched?.flagUrl) {
        return (<div className={`${className} rounded-sm bg-cover bg-center border border-[#c6c6cd]/40 shrink-0`} style={{ backgroundImage: `url('${matched.flagUrl}')` }}/>);
    }
    const emoji = getCountryEmoji(countryCode || country);
    return (<div className={`${className} flex items-center justify-center text-sm leading-none bg-[#eceef0] rounded-sm shrink-0 select-none`}>
      <span>{emoji}</span>
    </div>);
};
