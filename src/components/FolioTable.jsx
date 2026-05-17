import React, { useState } from 'react';
import { Clock, Printer, Download, Trash, FileText, Search, Filter, Edit2, X, Save } from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { format } from 'date-fns';

export default function FolioTable({ folios, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [editingFolio, setEditingFolio] = useState(null);
  const [editForm, setEditForm] = useState({ dirigidoA: '', asunto: '', estado: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (folio) => {
    setEditingFolio(folio);
    setEditForm({
      dirigidoA: folio.dirigidoA,
      asunto: folio.asunto,
      estado: folio.estado
    });
  };

  const handleUpdateFolio = async () => {
    setIsUpdating(true);
    try {
      const folioRef = doc(db, 'folios_imss', editingFolio.id);
      await updateDoc(folioRef, {
        dirigidoA: editForm.dirigidoA,
        asunto: editForm.asunto,
        estado: editForm.estado
      });
      setEditingFolio(null);
    } catch (error) {
      console.error("Error al actualizar folio:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!isAdmin) {
      alert("No tienes permisos para eliminar folios. Activa el modo Administrador.");
      return;
    }
    if(window.confirm("¿Estás seguro de eliminar este registro?")){
      try {
        await deleteDoc(doc(db, 'folios_imss', id));
      } catch (error) {
        console.error("Eliminar error:", error);
      }
    }
  };

  const generarPDFIndividual = (folio) => {
    if (!window.html2pdf) {
      alert("El generador de PDF está cargando. Intenta en unos segundos.");
      return;
    }

    const fechaFormateada = folio.fecha.split('-').reverse().join('-');
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px 60px; font-family: 'Helvetica', Arial, sans-serif; color: #333;">
        <div style="text-align: center; border-bottom: 3px solid #006341; padding-bottom: 20px; margin-bottom: 30px; position: relative;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Logo_de_IMSS-Bienestar.svg" onerror="this.src='https://www.imss.gob.mx/sites/all/statics/logo_imss.png'" style="position: absolute; left: 0; top: 0; height: 60px;" alt="IMSS" crossorigin="anonymous" />
          <h2 style="margin:0; font-size: 22px; color: #006341; text-transform: uppercase; font-weight: bold;">OOAD CHIAPAS</h2>
          <h3 style="margin:8px 0 4px 0; font-size: 16px; font-weight: bold;">JEFATURA DE SERVICIOS DE DESARROLLO DE PERSONAL</h3>
          <h4 style="margin:0; font-size: 14px; font-weight: normal; color: #555;">OFICINA DE PERSONAL Y PRESUPUESTO IMSS-BIENESTAR Y PLAZAS NO PRESUPUESTARIAS</h4>
        </div>
        
        <div style="text-align: right; margin-bottom: 40px;">
          <h1 style="font-size: 32px; margin: 0; color: #006341;">FOLIO NO. <strong>${folio.num}</strong></h1>
          <p style="margin: 5px 0; font-size: 14px; color: #666; font-weight: bold;">AÑO DE REGISTRO: ${new Date().getFullYear()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 15px; border: 1px solid #ddd; width: 30%; background-color: #f4f6f5;"><strong>Fecha del Documento:</strong></td>
            <td style="padding: 15px; border: 1px solid #ddd;">${fechaFormateada}</td>
          </tr>
          <tr>
            <td style="padding: 15px; border: 1px solid #ddd; background-color: #f4f6f5;"><strong>Dirigido a:</strong></td>
            <td style="padding: 15px; border: 1px solid #ddd;">${folio.dirigidoA}</td>
          </tr>
          <tr>
            <td style="padding: 15px; border: 1px solid #ddd; background-color: #f4f6f5;"><strong>Asunto:</strong></td>
            <td style="padding: 15px; border: 1px solid #ddd;">${folio.asunto}</td>
          </tr>
          <tr>
            <td style="padding: 15px; border: 1px solid #ddd; background-color: #f4f6f5;"><strong>Estado Actual:</strong></td>
            <td style="padding: 15px; border: 1px solid #ddd; font-weight: bold; color: #006341;">${folio.estado}</td>
          </tr>
        </table>

        <div style="margin-top: 80px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          <p>Documento generado por el Sistema de Control de Folios Oficiales</p>
          <p>Timestamp: ${new Date(folio.createdAt).toLocaleString('es-MX')}</p>
        </div>
      </div>
    `;

    const opt = {
      margin:       1,
      filename:     `Folio_${folio.num}_IMSS.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  const generarPDFTabla = () => {
    if (!window.html2pdf) return;

    const foliosAsc = [...foliosToDisplay].sort((a, b) => parseInt(a.num) - parseInt(b.num));

    let tableRows = '';
    foliosAsc.forEach(f => {
      tableRows += `
        <tr>
          <td style="border: 1px solid #555; padding: 6px; text-align: center;">${f.num}</td>
          <td style="border: 1px solid #555; padding: 6px; text-align: center;">${f.fecha.split('-').reverse().join('-')}</td>
          <td style="border: 1px solid #555; padding: 6px;">${f.dirigidoA}</td>
          <td style="border: 1px solid #555; padding: 6px;">${f.asunto}</td>
          <td style="border: 1px solid #555; padding: 6px; text-align: center;">${f.estado}</td>
        </tr>
      `;
    });

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px; position: relative;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Logo_de_IMSS-Bienestar.svg" onerror="this.src='https://www.imss.gob.mx/sites/all/statics/logo_imss.png'" style="position: absolute; left: 0; top: 0; height: 50px;" alt="IMSS" crossorigin="anonymous" />
          <h3 style="margin: 0; font-size: 16px; color: #006341;">OOAD CHIAPAS</h3>
          <h4 style="margin: 3px 0; font-size: 14px;">JEFATURA DE SERVICIOS DE DESARROLLO DE PERSONAL</h4>
          <p style="margin: 3px 0; font-size: 12px;">OFICINA DE PERSONAL Y PRESUPUESTO IMSS-BIENESTAR Y PNP</p>
          <h4 style="margin-top: 15px; font-size: 14px; background-color: #006341; color: white; padding: 6px;">CONTROL DE FOLIOS DE OFICIOS AÑO ${new Date().getFullYear()}</h4>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="border: 1px solid #555; padding: 8px; width: 6%;">NUM.</th>
              <th style="border: 1px solid #555; padding: 8px; width: 10%;">FECHA</th>
              <th style="border: 1px solid #555; padding: 8px; width: 34%;">DIRIGIDO A</th>
              <th style="border: 1px solid #555; padding: 8px; width: 35%;">ASUNTO</th>
              <th style="border: 1px solid #555; padding: 8px; width: 15%;">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin:       0.5,
      filename:     `Reporte_Folios_${new Date().getFullYear()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  const foliosToDisplay = folios.filter(folio => {
    const matchesSearch = folio.dirigidoA.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          folio.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          folio.num.includes(searchTerm);
    const matchesEstado = filterEstado === 'Todos' || folio.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="bg-white px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <span className="text-imss-gold"><Clock size={24} /></span>
            Control de Folios {new Date().getFullYear()}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Historial sincronizado en tiempo real</p>
        </div>
        <button 
          onClick={generarPDFTabla}
          disabled={!isFirebaseConfigured || foliosToDisplay.length === 0}
          className="flex items-center gap-2 text-sm font-bold bg-gray-50 text-imss-green hover:bg-imss-light px-5 py-2.5 rounded-lg border border-imss-green transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer size={18} />
          Imprimir Reporte
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por dirigido a, asunto o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-imss-green focus:border-imss-green outline-none transition-all text-sm"
          />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Filter size={18} />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-imss-green focus:border-imss-green outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente de Envío</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado / Recibido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No.</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Fecha</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dirigido A / Asunto</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Estado</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {foliosToDisplay.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="mb-4 opacity-50"><FileText size={48} /></div>
                    <p className="text-lg font-medium text-gray-600">
                      {!isFirebaseConfigured ? 'Esperando conexión a base de datos' : 'No se encontraron folios'}
                    </p>
                    <p className="text-sm mt-1">
                      {!isFirebaseConfigured ? 'Configura Firebase en .env para poder guardar y leer datos.' : 'Ajusta tus filtros o genera un nuevo folio.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              foliosToDisplay.map((folio) => (
                <tr key={folio.id} className="hover:bg-imss-light transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-black bg-white text-gray-700 border border-gray-300 shadow-sm">
                      {folio.num}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-700 block">
                      {folio.fecha.split('-').reverse().join('/')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 block">
                      {new Date(folio.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {folio.dirigidoA}
                    </div>
                    <div className="text-sm text-gray-600 leading-snug line-clamp-2">
                      {folio.asunto}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                      folio.estado === 'Enviado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      folio.estado === 'Entregado' ? 'bg-green-50 text-green-700 border-green-200' :
                      folio.estado === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {folio.estado === 'Pendiente' && '⏳ Pendiente'}
                      {folio.estado === 'Enviado' && '📨 Enviado'}
                      {folio.estado === 'Entregado' && '✅ Entregado'}
                      {folio.estado === 'Cancelado' && '❌ Cancelado'}
                      {!['Pendiente', 'Enviado', 'Entregado', 'Cancelado'].includes(folio.estado) && folio.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(folio)}
                        title="Editar Folio"
                        className="text-amber-500 hover:text-white bg-amber-50 hover:bg-amber-500 border border-amber-200 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => generarPDFIndividual(folio)}
                        title="Descargar Folio en PDF"
                        className="text-imss-green hover:text-white bg-imss-light hover:bg-imss-green border border-imss-green/20 p-2 rounded-lg transition-all"
                      >
                        <Download size={16} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleEliminar(folio.id)}
                          title="Eliminar Registro"
                          className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-red-200 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {foliosToDisplay.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-right">
          Mostrando <span className="font-bold">{foliosToDisplay.length}</span> registros de un total de <span className="font-bold">{folios.length}</span>
        </div>
      )}

      {/* Modal para Editar Folio */}
      {editingFolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-imss-dark px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="text-imss-gold" size={20} />
                Editar Folio {editingFolio.num}
              </h3>
              <button 
                onClick={() => setEditingFolio(null)}
                className="text-gray-300 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Dirigido A</label>
                <input 
                  type="text" 
                  value={editForm.dirigidoA}
                  onChange={(e) => setEditForm({...editForm, dirigidoA: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imss-green outline-none font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Asunto</label>
                <textarea 
                  value={editForm.asunto}
                  onChange={(e) => setEditForm({...editForm, asunto: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imss-green outline-none resize-none font-medium text-gray-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Estado</label>
                <select 
                  value={editForm.estado}
                  onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-imss-green outline-none font-bold text-gray-700"
                >
                  <option value="Pendiente">⏳ Pendiente de Envío</option>
                  <option value="Enviado">📨 Enviado</option>
                  <option value="Entregado">✅ Entregado / Recibido</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
                <button 
                  onClick={() => setEditingFolio(null)}
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateFolio}
                  disabled={isUpdating || !editForm.dirigidoA || !editForm.asunto}
                  className="flex-1 py-2 rounded-lg font-bold text-white bg-imss-green hover:bg-imss-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
