'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'gu' | 'ml' | 'pa';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  kn: 'Kannada (ಕನ್ನಡ)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  gu: 'Gujarati (ગુજરાતી)',
  ml: 'Malayalam (മലയാളம்)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
};

const DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {}, // Fallback is key itself
  hi: {
    'Overview': 'अवलोकन',
    'Real-time insights on billing costs, margin tax, and receivable collections.': 'लागत, मुनाफ़ा टैक्स, और भुगतान संग्रह की वास्तविक जानकारी।',
    'Money Wheel Summary': 'मनी व्हील सारांश',
    'Total Billed': 'कुल बिल',
    'Settled / Received': 'प्राप्त राशि',
    'Cost': 'लागत',
    'Margin': 'मुनाफ़ा',
    'Levy': 'टैक्स',
    'Owed': 'बकाया',
    'Collection Status (Settlement Split)': 'संग्रह स्थिति (भुगतान विभाजन)',
    'Collection Rate': 'संग्रह दर',
    'Settled (Received)': 'प्राप्त (भुगतान)',
    'Outstanding (Owed)': 'बकाया (उधार)',
    'Outstanding Dues by Payer': 'ग्राहक द्वारा बकाया राशि',
    'Invoice Ledger': 'चालान बही',
    'Search by Bill # or Payer...': 'बिल नंबर या ग्राहक से खोजें...',
    'All States': 'सभी स्थितियाँ',
    'Draft': 'ड्राफ्ट',
    'Issued': 'जारी',
    'Part Paid': 'आंशिक भुगतान',
    'Fully Paid': 'भुगतान सफल',
    'Overdue': 'विलंबित',
    'New Bill': 'नया बिल',
    'Late Fees & Overdue Interest': 'विलंब शुल्क और बकाया ब्याज',
    'Billed To': 'बिल भेजा गया',
    'Due Date': 'नियत तारीख',
    'Outstanding Dues Checklist': 'बकाया राशि चेकलिस्ट',
    'Labor/Service Fee': 'श्रम/सेवा शुल्क',
    'Total Outstanding': 'कुल बकाया',
    'Line Items Ledger': 'विवरण तालिका',
    'Label': 'विवरण',
    'Cost/Unit': 'इकाई लागत',
    'Charge/Unit': 'इकाई चार्ज',
    'Qty': 'मात्रा',
    'Total': 'कुल',
    'Mark Paid': 'भुगतान करें',
    'Invoice': 'चालान',
    'Total Bill': 'कुल बिल',
    'Save & Issue Invoice': 'बिल जारी करें',
    'Cancel': 'रद्द करें',
    'Create New Bill': 'नया बिल बनाएं',
    'Select Payer': 'ग्राहक चुनें',
    'Item label / description': 'विवरण दर्ज करें',
    'Dashboard': 'डैशबोर्ड',
    'Payers': 'ग्राहक सूची',
    'Overdue by': 'विलंबित',
    'days': 'दिन',
    'Payer Directory': 'ग्राहक निर्देशिका',
    'Add New Payer': 'नया ग्राहक जोड़ें',
    'Payer Name *': 'ग्राहक का नाम *',
    'Phone Number *': 'फ़ोन नंबर *',
    'Email Address': 'ईमेल पता',
    'Billing Address': 'बिलिंग पता',
    'Add Payer': 'ग्राहक जोड़ें',
    'View Dues Profile &rarr;': 'विवरण देखें &rarr;',
    'Total Outstanding Owed': 'कुल बकाया राशि',
    'Invoices Ledger History': 'बिलिंग बही इतिहास',
    'Overdue Late Fees:': 'विलंब शुल्क (ब्याज):',
    'UPI Real-Time Reconciliation': 'UPI वास्तविक समय मिलान',
    'Auto-matches incoming bank alerts to invoice line costs': 'इनकमिंग बैंक अलर्ट्स को स्वचालित रूप से बिल आइटम से मिलान करें',
    'Incoming Transaction Stream': 'आने वाले लेन-देन की धारा',
    'UTR / Payer': 'UTR / भुगतानकर्ता',
    'Amount': 'राशि',
    'Status': 'स्थिति',
    'Actions': 'कार्रवाई',
  },
  ta: {
    'Overview': 'கண்ணோட்டம்',
    'Real-time insights on billing costs, margin tax, and receivable collections.': 'விலை விவரங்கள் மற்றும் வரி வசூல் நிகழ்நேர கண்காணிப்பு.',
    'Money Wheel Summary': 'பணச் சக்கர சுருக்கம்',
    'Total Billed': 'மொத்த பில்',
    'Settled / Received': 'பெறப்பட்ட தொகை',
    'Cost': 'அடக்க விலை',
    'Margin': 'லாபம்',
    'Levy': 'வரி',
    'Owed': 'நிலுவைத் தொகை',
    'Collection Status (Settlement Split)': 'வசூல் நிலை',
    'Collection Rate': 'வசூல் விகிதம்',
    'Settled (Received)': 'பெறப்பட்டது',
    'Outstanding (Owed)': 'நிலுவையில் உள்ளது',
    'Outstanding Dues by Payer': 'நபரின் நிலுவைத் தொகை',
    'Invoice Ledger': 'விலைப்பட்டியல் பதிவேடு',
    'Search by Bill # or Payer...': 'தேடு...',
    'All States': 'அனைத்து நிலை',
    'Draft': 'வரைவு',
    'Issued': 'வழங்கப்பட்டது',
    'Part Paid': 'பகுதி செலுத்தப்பட்டது',
    'Fully Paid': 'செலுத்தப்பட்டது',
    'Overdue': 'காலக்கெடு முடிந்தது',
    'New Bill': 'புதிய பில்',
    'Late Fees & Overdue Interest': 'தாமதக் கட்டணம் & வட்டி',
    'Billed To': 'பில் பெறுபவர்',
    'Due Date': 'செலுத்த வேண்டிய நாள்',
    'Outstanding Dues Checklist': 'நிலுவைத் தொகை சரிபார்ப்புப் பட்டியல்',
    'Labor/Service Fee': 'சேவைக் கட்டணம்',
    'Total Outstanding': 'மொத்த நிலுவைத் தொகை',
    'Line Items Ledger': 'பொருட்கள் விவரம்',
    'Label': 'பெயர்',
    'Cost/Unit': 'அலகு விலை',
    'Charge/Unit': 'விற்பனை விலை',
    'Qty': 'அளவு',
    'Total': 'மொத்தம்',
    'Mark Paid': 'பணம் பெறப்பட்டது',
    'Invoice': 'விலைப்பட்டியல்',
    'Total Bill': 'மொத்த தொகை',
    'Save & Issue Invoice': 'பில் சேமி & அனுப்பு',
    'Cancel': 'ரத்துசெய்',
    'Create New Bill': 'புதிய பில் உருவாக்கவும்',
    'Select Payer': 'நபரைத் தேர்ந்தெடு',
    'Dashboard': 'முகப்பு',
    'Payers': 'வாடிக்கையாளர்கள்',
  },
  te: {
    'Overview': 'అవలోకనం',
    'Money Wheel Summary': 'మనీ వీల్ సారాంశం',
    'Cost': 'ఖర్చు',
    'Margin': 'లాభం',
    'Levy': 'పన్ను',
    'Owed': 'బాకీ',
    'Collection Status (Settlement Split)': 'వసూళ్ల స్థితి',
    'Collection Rate': 'వసూళ్ల శాతం',
    'Settled (Received)': 'వసూలైనవి',
    'Outstanding (Owed)': 'బాకీ ఉన్నవి',
    'Invoice Ledger': 'అకౌంట్స్ లెడ్జర్',
    'New Bill': 'కొత్త బిల్లు',
    'Due Date': 'గడువు తేదీ',
    'Total Outstanding': 'మొత్తం బాకీ',
    'Total Bill': 'మొత్తం బిల్లు',
    'Dashboard': 'డాష్‌బోర్డ్',
    'Payers': 'వినియోగదారులు',
  },
  kn: {
    'Overview': 'ಅವಲೋಕನ',
    'Money Wheel Summary': 'ಮನಿ ವೀಲ್ ಸಾರಾಂಶ',
    'Cost': 'ವೆಚ್ಚ',
    'Margin': 'ಲಾಭ',
    'Levy': 'ತೆರಿಗೆ',
    'Owed': 'ಬಾಕಿ',
    'Collection Status (Settlement Split)': 'ವಸೂಲಾತಿ ಸ್ಥಿತಿ',
    'Settled (Received)': 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    'Outstanding (Owed)': 'ಬಾಕಿ ಇದೆ',
    'New Bill': 'ಹೊಸ ಬಿಲ್',
    'Total Bill': 'ಒಟ್ಟು ಬಿಲ್',
    'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Payers': 'ಗ್ರಾಹಕರು',
  },
  mr: {
    'Overview': 'आढावा',
    'Money Wheel Summary': 'मनी व्हील सारांश',
    'Cost': 'खर्च',
    'Margin': 'नफा',
    'Owed': 'थकीत',
    'Settled (Received)': 'प्राप्त',
    'Outstanding (Owed)': 'थकीत रक्कम',
    'New Bill': 'नवीन बिल',
    'Dashboard': 'डॅशबोर्ड',
    'Payers': 'ग्राहक',
  },
  bn: {
    'Overview': 'সারসংক্ষেপ',
    'Cost': 'ব্যয়',
    'Margin': 'লাভ',
    'Settled (Received)': 'পরিশোধিত',
    'Outstanding (Owed)': 'বকেয়া',
    'New Bill': 'নতুন বিল',
    'Dashboard': 'ড্যাশবোর্ড',
  },
  gu: {
    'Overview': 'ઝાંખી',
    'Cost': 'ખર્ચ',
    'Margin': 'નફો',
    'Outstanding (Owed)': 'બાકી રકમ',
    'New Bill': 'નવું બિલ',
    'Dashboard': 'ડેશબોર્ડ',
  },
  ml: {
    'Overview': 'അവലോകനം',
    'Cost': 'ചിലവ്',
    'Margin': 'ലാഭം',
    'Outstanding (Owed)': 'ബാക്കി',
    'New Bill': 'പുതിയ ബിൽ',
  },
  pa: {
    'Overview': 'ਸੰਖੇਪ',
    'Cost': 'ਲਾਗਤ',
    'Margin': 'ਮੁਨਾਫਾ',
    'Outstanding (Owed)': 'ਬਕਾਇਆ',
    'New Bill': 'ਨਵਾਂ ਬਿੱਲ',
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('lf_lang') as LanguageCode;
    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('lf_lang', lang);
  };

  // Translation helper
  const t = (key: string): string => {
    const langDict = DICTIONARY[language];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    return key; // Fallback to original text
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
