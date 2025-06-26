interface ExportMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onExportarPDF: () => void;
  onExportarCSV: () => void;
}

export default function ExportMenu({
  open,
  setOpen,
  onExportarPDF,
  onExportarCSV,
}: ExportMenuProps) {
  return (
    <div className="relative">
      <button
        className="flex items-center justify-center gap-2 bg-blue-900 text-white p-2 rounded hover:bg-blue-950 transition-all font-poppins text-[0.95rem] font-medium w-full sm:w-auto"
        onClick={() => setOpen(!open)}
        type="button"
      >
        Imprimir <span className="ml-1">⏷</span>
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-1 min-w-[120px] w-32 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
          <button
            onClick={() => {
              onExportarPDF();
              setOpen(false);
            }}
            className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            PDF
          </button>
          <button
            onClick={() => {
              onExportarCSV();
              setOpen(false);
            }}
            className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            CSV
          </button>
        </div>
      )}
    </div>
  );
}