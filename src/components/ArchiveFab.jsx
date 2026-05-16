import React, { useState } from 'react';
import { Archive, Download, X, Table } from 'lucide-react';
import { exportToExcel } from '../utils/excel';

export default function ArchiveFab({ folios }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    exportToExcel(folios);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-imss-gold text-white p-4 rounded-full shadow-2xl hover:bg-yellow-600 hover:scale-110 transition-all duration-300 group flex items-center justify-center"
        title="Archivo Histórico"
      >
        <Archive size={28} />
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Archivo Histórico y Exportación
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-imss-dark px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Table className="text-imss-gold" size={24} />
                Archivo Histórico de Folios ({folios.length} Registros)
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
              <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-imss-light border border-imss-green/20 p-5 rounded-xl">
                <div>
                  <h3 className="text-lg font-bold text-imss-green mb-1">Exportación a Excel</h3>
                  <p className="text-sm text-gray-600 max-w-lg">
                    Descarga la base de datos completa con los {folios.length} folios registrados. 
                    El archivo Excel generado incluye una tabla con diseño estructurado y 
                    <strong> filtros automáticos</strong> en cada columna para facilitar tu trabajo.
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={folios.length === 0}
                  className="mt-4 md:mt-0 flex items-center gap-2 bg-imss-green text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-imss-dark transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  Descargar Archivo .XLSX
                </button>
              </div>

              <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 px-1">Vista Previa de Datos</h4>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[40vh]">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-600">No.</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-600">Fecha</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-600">Dirigido A</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-600">Asunto</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {folios.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                            No hay registros disponibles.
                          </td>
                        </tr>
                      ) : (
                        folios.slice(0, 50).map(folio => (
                          <tr key={folio.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-bold text-gray-700">{folio.num}</td>
                            <td className="px-4 py-2 text-gray-600">{folio.fecha.split('-').reverse().join('/')}</td>
                            <td className="px-4 py-2 text-gray-800 font-medium">{folio.dirigidoA}</td>
                            <td className="px-4 py-2 text-gray-500 truncate max-w-xs" title={folio.asunto}>{folio.asunto}</td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-lg text-gray-600">
                                {folio.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {folios.length > 50 && (
                  <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
                    Mostrando solo los últimos 50 registros en vista previa. Descarga el Excel para ver todos.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
