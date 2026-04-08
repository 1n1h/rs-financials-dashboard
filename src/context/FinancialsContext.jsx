import { createContext, useContext, useState, useEffect } from 'react';
import { loadFinancialsFromUrl, loadFinancialsFromFile } from '../data/dataService';

const FinancialsContext = createContext(null);

const DATA_URL = '/data/2025_Rose_NEW_and_IMPROVED_Financials.xlsx';

export function FinancialsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('2025_Rose_NEW_and_IMPROVED_Financials.xlsx');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    loadFinancialsFromUrl(DATA_URL)
      .then((parsed) => {
        setData(parsed);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to parse Excel:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleFileUpload(file) {
    try {
      setLoading(true);
      setError(null);
      const parsed = await loadFinancialsFromFile(file);
      setData(parsed);
      setFileName(file.name);
      setLastUpdated(new Date());
      setLoading(false);
      setToast(`Loaded ${file.name} successfully`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function addCsvData(name, content) {
    setCsvData(prev => [...prev, { name, content, date: new Date().toISOString() }]);
  }

  function removeCsvData(index) {
    setCsvData(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <FinancialsContext.Provider value={{
      data, loading, error, fileName, lastUpdated, handleFileUpload, toast,
      csvData, addCsvData, removeCsvData,
    }}>
      {children}
    </FinancialsContext.Provider>
  );
}

export function useFinancials() {
  const ctx = useContext(FinancialsContext);
  if (!ctx) throw new Error('useFinancials must be inside FinancialsProvider');
  return ctx;
}
