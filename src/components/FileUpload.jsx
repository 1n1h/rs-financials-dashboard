import { useRef } from 'react';
import { useFinancials } from '../context/FinancialsContext';
import { LiquidButton } from './ui/liquid-glass-button';

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
      <LiquidButton
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="text-white/50"
      >
        Upload File
      </LiquidButton>
    </>
  );
}
