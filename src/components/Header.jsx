import React from 'react';
import { isFirebaseConfigured } from '../firebase/config';
import { Lock, Unlock, HelpCircle } from 'lucide-react';

export default function Header({ isAdmin, setIsAdmin, onStartTutorial }) {
  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem('imss_admin_mode');
    } else {
      const password = window.prompt("Introduce la contraseña de administrador para habilitar la eliminación de folios:");
      if (password === "chiapas2026") {
        setIsAdmin(true);
        localStorage.setItem('imss_admin_mode', 'true');
        alert("¡Modo Administrador activado! Ahora puedes eliminar folios.");
      } else if (password !== null) {
        alert("Contraseña incorrecta.");
      }
    }
  };

  return (
    <header className="bg-white shadow-md relative border-b-4 border-imss-gold">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Logo_de_IMSS-Bienestar.svg" 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.imss.gob.mx/sites/all/statics/logo_imss.png'; }}
            alt="IMSS Bienestar Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="border-l-2 border-gray-200 pl-5">
            <h1 className="text-2xl font-black text-imss-green tracking-tight">
              OOAD CHIAPAS
            </h1>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">JEFATURA DE SERVICIOS DE DESARROLLO DE PERSONAL</p>
            <p className="text-xs text-gray-500 font-medium">OFICINA DE PERSONAL Y PRESUPUESTO IMSS-BIENESTAR Y PNP</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onStartTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-imss-green border-imss-green hover:bg-imss-green hover:text-white font-bold text-xs transition-all tour-help shadow-sm"
            title="Ver Tutorial"
          >
            <HelpCircle size={14} />
            Tutorial
          </button>
          
          <div className="bg-green-50 px-4 py-2.5 rounded-lg border border-green-100 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFirebaseConfigured ? 'bg-imss-green' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isFirebaseConfigured ? 'bg-imss-green' : 'bg-red-500'}`}></span>
            </div>
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${isFirebaseConfigured ? 'text-imss-dark' : 'text-red-800'}`}>Estado</span>
              <span className="block text-sm font-semibold text-gray-800">
                {isFirebaseConfigured ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleAdminToggle}
            title={isAdmin ? "Desactivar Modo Administrador" : "Activar Modo Administrador"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
              isAdmin 
                ? "bg-imss-dark text-white border-imss-dark shadow-md" 
                : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            {isAdmin ? "Admin Activo" : "Admin"}
          </button>
        </div>
      </div>
    </header>
  );
}
