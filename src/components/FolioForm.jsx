import React, { useState } from 'react';
import { Plus, Calendar, User, AlignLeft, FileText, AlertTriangle } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export default function FolioForm({ user, nextFolioNum, isLimitReached }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [dirigidoA, setDirigidoA] = useState('');
  const [asunto, setAsunto] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuardarFolio = async (e) => {
    e.preventDefault();
    if (isLimitReached) {
      setErrorMsg("Se ha alcanzado el límite de 500 folios.");
      return;
    }
    if (!isFirebaseConfigured) {
      alert("Por favor, configura Firebase en el archivo .env para usar la base de datos.");
      return;
    }
    if (!fecha || !dirigidoA || !asunto) {
      setErrorMsg("Por favor completa todos los campos.");
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = `folio_${Date.now()}`;
      
      await setDoc(doc(collection(db, 'folios_imss'), newId), {
        num: nextFolioNum,
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
      setErrorMsg('');
    } catch (error) {
      console.error("Guardar error:", error);
      setErrorMsg("Error al generar el folio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
      <div className="px-6 py-5 bg-imss-green">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-imss-gold"><Plus size={20} /></span>
          Generar Nuevo Folio
        </h2>
        <p className="text-emerald-100 text-xs mt-1">Completa los datos para asignar un número</p>
      </div>
      
      <form onSubmit={handleGuardarFolio} className="p-6 space-y-6">
        {isLimitReached && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold mb-1">Límite Anual Alcanzado</p>
              <p>Se han registrado los 500 folios permitidos. Por favor revisa el Archivo Histórico.</p>
            </div>
          </div>
        )}
        
        {errorMsg && !isLimitReached && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium animate-pulse border border-red-200">
            {errorMsg}
          </div>
        )}
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-600 uppercase">Folio Asignado:</span>
          <span className={`bg-white font-black px-4 py-1.5 rounded-lg text-xl border-2 shadow-inner ${isLimitReached ? 'text-red-500 border-red-500' : 'text-imss-dark border-imss-dark'}`}>
            {nextFolioNum}
          </span>
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
              className="input-field cursor-pointer"
              disabled={isLimitReached}
            >
              <option value="Pendiente">⏳ Pendiente de Envío</option>
              <option value="Enviado">📨 Enviado</option>
              <option value="Entregado">✅ Entregado / Recibido</option>
              <option value="Cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting || !isFirebaseConfigured || isLimitReached}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrando...
              </>
            ) : (
              <>
                <FileText size={20} />
                {isLimitReached ? 'Límite Alcanzado' : 'Registrar Folio'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
