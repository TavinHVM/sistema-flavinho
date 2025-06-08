import React from "react";

interface OrderExportMenuProps {
  onExportarPDF: () => void;
}

const OrderExportMenu: React.FC<OrderExportMenuProps> = ({ onExportarPDF }) => {
  return (
    <div className="flex gap-2">
      <button className="bg-blue-700 text-white rounded px-2 py-1 text-xs" onClick={onExportarPDF}>
        Exportar PDF
      </button>
      {/*
      <button className="bg-gray-700 text-white rounded px-2 py-1 text-xs" onClick={() => window.print()}>
        Imprimir
      </button>
      */}
    </div>
  );
};

export default OrderExportMenu;
