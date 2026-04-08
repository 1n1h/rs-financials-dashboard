import { useRef } from 'react';
import { useFinancials } from '../context/FinancialsContext';

export default function FileUpload() {
  const { handleFileUpload } = useFinancials();
  const inputRef = useRef(null);

  function onChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
      >
        Upload File
      </button>
    </>
  );
}
