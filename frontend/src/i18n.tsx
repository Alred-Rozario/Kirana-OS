import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  English: {
    // Sidebar
    "menu.dashboard": "Dashboard",
    "menu.pos": "POS Billing",
    "menu.inventory": "Inventory",
    "menu.udhaar": "Udhaar Ledger",
    "menu.suppliers": "Suppliers",
    "menu.analytics": "Analytics",
    
    // Header
    "header.alerts": "Alerts",
    "header.account": "Account",
    "header.viewProfile": "View Profile",
    "header.switchRole": "Switch Role (Demo)",
    "header.logout": "Log out",
    "header.subtitle": "Smart Retail POS",

    // Dashboard
    "dashboard.greeting": "Good Morning",
    "dashboard.overview": "Here's a quick overview of your store's performance today.",
    "dashboard.openPos": "Open POS",
    "dashboard.todaySales": "Today's Sales",
    "dashboard.totalOrders": "Total Orders",
    "dashboard.activeUdhaar": "Active Udhaar",
    "dashboard.lowStock": "Low Stock Items",
    "dashboard.salesTrend": "Sales Trend (Last 7 Days)",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.viewAll": "View All",
    "dashboard.viewPos": "View POS",
    "dashboard.exp": "Exp:",
    "dashboard.noTransactions": "No transactions today.",
    "dashboard.healthyStock": "Stock levels are healthy",
    "dashboard.noExpiring": "No items expiring soon",

    // POS
    "pos.searchPlaceholder": "Search items or scan barcode...",
    "pos.currentOrder": "Current Order",
    "pos.walkInCustomer": "Walk-in Customer",
    "pos.cartEmpty": "Cart is empty",
    "pos.selectProducts": "Select products to add",
    "pos.discount": "DISCOUNT ₹",
    "pos.gstRate": "GST RATE",
    "pos.subtotal": "Subtotal",
    "pos.charge": "Charge",

    // Inventory
    "inventory.title": "Inventory Management",
    "inventory.subtitle": "SKUs • Stock Alerts • Expiry Tracking",
    "inventory.importCsv": "Import CSV",
    "inventory.addProduct": "Add Product",
    "inventory.allProducts": "All Products",
    "inventory.lowStock": "Low Stock",
    "inventory.expiring": "Expiring",
    "inventory.searchPlaceholder": "Search...",
    "inventory.allCategories": "All Categories",

    // Udhaar
    "udhaar.title": "Udhaar (Credit) Ledger",
    "udhaar.subtitle": "Manage customer credit and payments",
    "udhaar.totalCredit": "Total Market Credit",
    "udhaar.newCustomer": "New Customer",
    "udhaar.search": "Search customers...",
    "udhaar.noCustomers": "No customers found.",
    "udhaar.selectCustomer": "Select a customer to view their ledger",
    "udhaar.currentBalance": "Current Balance",
    "udhaar.receivePayment": "Receive Payment",
    "udhaar.type": "Type",
    "udhaar.description": "Description",
    "udhaar.balanceAfter": "Balance After",
    "udhaar.noTransactions": "No transactions yet.",
    "udhaar.addCustomer": "Add Customer",
    "udhaar.customerName": "Customer Name",
    "udhaar.phone": "Phone Number",
    "udhaar.address": "Address (Optional)",
    "udhaar.confirmPayment": "Confirm Payment",

    // Supplier
    "supplier.title": "Supplier Directory",
    "supplier.subtitle": "Manage wholesale distributors and FMCG partners",
    "supplier.importCsv": "Import CSV",
    "supplier.addSupplier": "Add Supplier",
    "supplier.noSuppliers": "No suppliers listed yet.",
    "supplier.noContact": "No Contact Person",
    "supplier.editSupplier": "Edit Supplier",
    "supplier.companyName": "Company / Agency Name",
    "supplier.contactPerson": "Contact Person",
    "supplier.saveSupplier": "Save Supplier",
    "supplier.categorySupplied": "Category Supplied",

    // Analytics
    "analytics.title": "Business Analytics",
    "analytics.subtitle": "Performance insights and revenue breakdowns",
    "analytics.totalRevenue": "Total Revenue",
    "analytics.totalBills": "Total Bills",
    "analytics.avgBill": "Avg Bill Value",
    "analytics.dailySales": "Daily Sales Trend (Last 7 Days)",
    "analytics.paymentBreakdown": "Payment Methods Breakdown",
    "analytics.topCategories": "Top Categories by Revenue",

    // Common
    "common.amount": "Amount",
    "common.status": "Status",
    "common.date": "Date",
    "common.time": "Time",
    "common.customer": "Customer",
    "common.items": "Items",
    "common.total": "Total",
    "common.search": "Search",
    "common.add": "Add",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.category": "Category",
    "common.barcode": "Barcode",
    "common.cost": "Cost",
    "common.selling": "Selling",
    "common.stock": "Stock",
    "common.expiry": "Expiry",
    "common.actions": "Actions",
    "common.nameBatch": "Name & Batch",
    "common.payment": "Payment",
    "common.invoiceNo": "Invoice No",
  },
  Hindi: {
    // Sidebar
    "menu.dashboard": "डैशबोर्ड",
    "menu.pos": "पीओएस बिलिंग",
    "menu.inventory": "इन्वेंटरी (स्टॉक)",
    "menu.udhaar": "उधार खाता",
    "menu.suppliers": "आपूर्तिकर्ता (Suppliers)",
    "menu.analytics": "विश्लेषण",
    
    // Header
    "header.alerts": "अलर्ट",
    "header.account": "अकाउंट",
    "header.viewProfile": "प्रोफाइल देखें",
    "header.switchRole": "रोल बदलें (डेमो)",
    "header.logout": "लॉग आउट",
    "header.subtitle": "स्मार्ट रिटेल पीओएस",

    // Dashboard
    "dashboard.greeting": "सुप्रभात",
    "dashboard.overview": "आज आपके स्टोर के प्रदर्शन का संक्षिप्त विवरण यहाँ है।",
    "dashboard.openPos": "पीओएस खोलें",
    "dashboard.todaySales": "आज की बिक्री",
    "dashboard.totalOrders": "कुल ऑर्डर",
    "dashboard.activeUdhaar": "सक्रिय उधार",
    "dashboard.lowStock": "कम स्टॉक वाले आइटम",
    "dashboard.salesTrend": "बिक्री का रुझान (पिछले 7 दिन)",
    "dashboard.recentTransactions": "हाल के लेनदेन",
    "dashboard.viewAll": "सभी देखें",
    "dashboard.viewPos": "पीओएस देखें",
    "dashboard.exp": "समाप्ति:",
    "dashboard.noTransactions": "आज कोई लेनदेन नहीं हुआ।",
    "dashboard.healthyStock": "स्टॉक का स्तर स्वस्थ है",
    "dashboard.noExpiring": "कोई आइटम जल्द समाप्त नहीं हो रहा है",

    // POS
    "pos.searchPlaceholder": "आइटम खोजें या बारकोड स्कैन करें...",
    "pos.currentOrder": "वर्तमान ऑर्डर",
    "pos.walkInCustomer": "वॉक-इन ग्राहक",
    "pos.cartEmpty": "कार्ट खाली है",
    "pos.selectProducts": "जोड़ने के लिए उत्पाद चुनें",
    "pos.discount": "छूट ₹",
    "pos.gstRate": "जीएसटी दर",
    "pos.subtotal": "उप-योग",
    "pos.charge": "चार्ज करें",

    // Inventory
    "inventory.title": "इन्वेंटरी प्रबंधन",
    "inventory.subtitle": "SKUs • स्टॉक अलर्ट • समाप्ति ट्रैकिंग",
    "inventory.importCsv": "CSV आयात करें",
    "inventory.addProduct": "उत्पाद जोड़ें",
    "inventory.allProducts": "सभी उत्पाद",
    "inventory.lowStock": "कम स्टॉक",
    "inventory.expiring": "समाप्ति",
    "inventory.searchPlaceholder": "खोजें...",
    "inventory.allCategories": "सभी श्रेणियां",

    // Udhaar
    "udhaar.title": "उधार (क्रेडिट) खाता",
    "udhaar.subtitle": "ग्राहक क्रेडिट और भुगतान प्रबंधित करें",
    "udhaar.totalCredit": "कुल बाज़ार क्रेडिट",
    "udhaar.newCustomer": "नया ग्राहक",
    "udhaar.search": "ग्राहक खोजें...",
    "udhaar.noCustomers": "कोई ग्राहक नहीं मिला।",
    "udhaar.selectCustomer": "खाता देखने के लिए ग्राहक चुनें",
    "udhaar.currentBalance": "वर्तमान शेष (बैलेंस)",
    "udhaar.receivePayment": "भुगतान प्राप्त करें",
    "udhaar.type": "प्रकार",
    "udhaar.description": "विवरण",
    "udhaar.balanceAfter": "शेष के बाद",
    "udhaar.noTransactions": "अभी तक कोई लेनदेन नहीं।",
    "udhaar.addCustomer": "ग्राहक जोड़ें",
    "udhaar.customerName": "ग्राहक का नाम",
    "udhaar.phone": "फ़ोन नंबर",
    "udhaar.address": "पता (वैकल्पिक)",
    "udhaar.confirmPayment": "भुगतान की पुष्टि करें",

    // Supplier
    "supplier.title": "आपूर्तिकर्ता निर्देशिका",
    "supplier.subtitle": "थोक वितरकों और FMCG भागीदारों का प्रबंधन करें",
    "supplier.importCsv": "CSV आयात करें",
    "supplier.addSupplier": "आपूर्तिकर्ता जोड़ें",
    "supplier.noSuppliers": "अभी तक कोई आपूर्तिकर्ता सूचीबद्ध नहीं है।",
    "supplier.noContact": "कोई संपर्क व्यक्ति नहीं",
    "supplier.editSupplier": "आपूर्तिकर्ता संपादित करें",
    "supplier.companyName": "कंपनी / एजेंसी का नाम",
    "supplier.contactPerson": "संपर्क व्यक्ति",
    "supplier.saveSupplier": "आपूर्तिकर्ता सेव करें",
    "supplier.categorySupplied": "आपूर्तिकर्ता श्रेणी",

    // Analytics
    "analytics.title": "व्यवसाय विश्लेषण",
    "analytics.subtitle": "प्रदर्शन अंतर्दृष्टि और राजस्व विवरण",
    "analytics.totalRevenue": "कुल राजस्व",
    "analytics.totalBills": "कुल बिल",
    "analytics.avgBill": "औसत बिल मूल्य",
    "analytics.dailySales": "दैनिक बिक्री का रुझान (पिछले 7 दिन)",
    "analytics.paymentBreakdown": "भुगतान विधियों का विवरण",
    "analytics.topCategories": "राजस्व के आधार पर शीर्ष श्रेणियां",

    // Common
    "common.amount": "रकम",
    "common.status": "स्थिति",
    "common.date": "तारीख",
    "common.time": "समय",
    "common.customer": "ग्राहक",
    "common.items": "आइटम",
    "common.total": "कुल",
    "common.search": "खोजें",
    "common.add": "जोड़ें",
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
    "common.category": "श्रेणी",
    "common.barcode": "बारकोड",
    "common.cost": "लागत",
    "common.selling": "बिक्री",
    "common.stock": "स्टॉक",
    "common.expiry": "समाप्ति",
    "common.actions": "क्रियाएँ",
    "common.nameBatch": "नाम और बैच",
    "common.payment": "भुगतान",
    "common.invoiceNo": "इनवॉइस नंबर",
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('English');

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
