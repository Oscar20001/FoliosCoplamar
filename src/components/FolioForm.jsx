import React, { useState } from 'react';
import { Plus, Calendar, User, AlignLeft, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export default function FolioForm({ user, nextFolioNum, isLimitReached }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [dirigidoA, setDirigidoA] = useState('');
  const [asunto, setAsunto] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [customFolio, setCustomFolio] = useState(null);
  
  const displayFolio = customFolio !== null ? customFolio : nextFolioNum;

  const handleVerificarFolio = (e) => {
    e.preventDefault();
    if (isLimitReached) {
      setErrorMsg("Se ha alcanzado el límite de 800 folios.");
      return;
    }
    if (!isFirebaseConfigured) {
      alert("Por favor, configura Firebase para usar la base de datos.");
      return;
    }
    if (!fecha || !dirigidoA || !asunto || String(displayFolio).trim() === '') {
      setErrorMsg("Por favor completa todos los campos.");
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    
    // En lugar de guardar inmediatamente, mostramos la confirmación
    setShowConfirm(true);
  };

  const handleGuardarFolio = async () => {
    setIsSubmitting(true);
    try {
      const newId = `folio_${Date.now()}`;
      
      await setDoc(doc(collection(db, 'folios_imss'), newId), {
        num: displayFolio,
        fecha: fecha,
        dirigidoA: dirigidoA,
        asunto: asunto,
        estado: estado,
        createdAt: new Date().toISOString(),
        createdBy: user ? user.uid : 'anonymous'
      });

      setDirigidoA('');
      setAsunto('');
      setEstado('Pendiente');
      setCustomFolio(null);
      setErrorMsg('');
      setShowConfirm(false); // Cerramos confirmación
    } catch (error) {
      console.error("Guardar error:", error);
      setErrorMsg("Error al generar el folio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
        <div className="px-6 py-5 bg-imss-green">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-imss-gold"><Plus size={20} /></span>
            Generar Nuevo Folio
          </h2>
          <p className="text-emerald-100 text-xs mt-1">Completa los datos para asignar un número</p>
        </div>
        
        <form onSubmit={handleVerificarFolio} className="p-6 space-y-6 tour-form">
          {isLimitReached && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold mb-1">Límite Anual Alcanzado</p>
                <p>Se han registrado los 800 folios permitidos. Por favor revisa el Archivo Histórico.</p>
              </div>
            </div>
          )}
          
          {errorMsg && !isLimitReached && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium animate-pulse border border-red-200">
              {errorMsg}
            </div>
          )}
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
            <label htmlFor="folioInput" className="text-sm font-bold text-gray-600 uppercase">Folio Asignado:</label>
            <input
              id="folioInput"
              type="text"
              value={displayFolio}
              onChange={(e) => setCustomFolio(e.target.value)}
              className={`bg-white font-black px-2 py-1.5 rounded-lg text-xl border-2 shadow-inner w-24 text-center focus:outline-none focus:ring-2 focus:ring-imss-green focus:border-transparent ${isLimitReached ? 'text-red-500 border-red-500' : 'text-imss-dark border-imss-dark'}`}
              disabled={isLimitReached}
            />
          </div>

          <div className={`space-y-5 ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Fecha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="input-field pl-10"
                  required
                  disabled={isLimitReached}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Dirigido A</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={dirigidoA}
                  onChange={(e) => setDirigidoA(e.target.value)}
                  placeholder="Ej. Dr. Genaro Javier Robles"
                  className="input-field pl-10"
                  required
                  disabled={isLimitReached}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Asunto</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <AlignLeft size={18} />
                </div>
                <textarea 
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej. Envío Contratos para Dictamen"
                  rows="3"
                  className="input-field pl-10 resize-none"
                  required
                  disabled={isLimitReached}
                ></textarea>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Estado / Acción</label>
              <select 
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="input-field cursor-pointer tour-form-status"
                disabled={isLimitReached}
              >
                <option value="Pendiente">⏳ Pendiente de Envío</option>
                <option value="Enviado">📨 Enviado</option>
                <option value="Entregado">✅ Entregado / Recibido</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={!isFirebaseConfigured || isLimitReached}
              className="btn-primary w-full"
            >
              <FileText size={20} />
              {isLimitReached ? 'Límite Alcanzado' : 'Registrar Folio'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-imss-green px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-imss-gold" size={20} />
                Confirmar Registro
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 font-medium mb-4">
                ¿Estás seguro que deseas registrar este folio? Revisa que los datos sean correctos:
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mb-6">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Folio No.</span>
                  <span className="font-black text-imss-green text-lg">{displayFolio}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Dirigido a</span>
                  <span className="font-bold text-gray-800">{dirigidoA}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Asunto</span>
                  <span className="font-medium text-gray-600">{asunto}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Salir
                </button>
                <button 
                  onClick={handleGuardarFolio}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-imss-green hover:bg-imss-dark shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Continuar
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
