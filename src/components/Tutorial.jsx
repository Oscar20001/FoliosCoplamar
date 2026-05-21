import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function Tutorial({ run, setRun }) {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('imss_has_seen_tutorial');
    const timer = setTimeout(() => {
      if (!hasSeenTutorial && !run) {
        setShowPrompt(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [run]);

  const handleStart = () => {
    setShowPrompt(false);
    setRun(true);
  };

  const handleSkip = () => {
    setShowPrompt(false);
    localStorage.setItem('imss_has_seen_tutorial', 'true');
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('imss_has_seen_tutorial', 'true');
    }
  };

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">¡Bienvenido al Control de Folios!</h3>
          <p>Esta aplicación te permite llevar un registro digital de los folios de la oficina. Vamos a dar un rápido recorrido para ver cómo funciona cada sección.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-form',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">Generar Nuevo Folio</h3>
          <p>Aquí puedes registrar un nuevo folio. El número se asigna automáticamente. Solo debes completar la fecha, a quién va dirigido y el asunto.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-form-status',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">Estados del Folio</h3>
          <p className="mb-2">Cada folio tiene un estado que indica su progreso:</p>
          <ul className="text-sm list-disc pl-4 space-y-1 text-gray-700">
            <li><strong>Pendiente:</strong> El documento aún no se ha enviado.</li>
            <li><strong>Enviado:</strong> El documento está en tránsito.</li>
            <li><strong>Entregado:</strong> El documento ha sido recibido.</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-table',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">Tabla de Registros</h3>
          <p>Aquí verás todos los folios en tiempo real. Puedes usar la barra superior para buscar palabras clave o filtrar por estado. Si eres administrador, podrás eliminarlos desde aquí.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-archive',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">Archivo y Descarga</h3>
          <p>En este botón puedes acceder al archivo histórico y descargar toda la base de datos en un archivo de Excel con un diseño estructurado y filtros automáticos.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.tour-help',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2 text-imss-green">Ayuda en cualquier momento</h3>
          <p>Si alguna vez necesitas volver a ver este recorrido, simplemente haz clic en este botón.</p>
        </div>
      ),
      placement: 'bottom',
    }
  ];

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center p-6">
            <div className="w-16 h-16 bg-imss-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-imss-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">¿Deseas ver un tutorial?</h2>
            <p className="text-gray-600 mb-6 text-sm">Te explicaremos cómo funciona la aplicación, cómo crear folios y exportarlos a Excel paso a paso.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleSkip}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Saltar
              </button>
              <button 
                onClick={handleStart}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-imss-green hover:bg-imss-dark shadow-md transition-colors"
              >
                Ver Tutorial
              </button>
            </div>
          </div>
        </div>
      )}

      {run && (
        <Joyride
          steps={steps}
          run={true}
          continuous={true}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#006450', // imss-green
              zIndex: 10000,
            },
            buttonClose: {
              display: 'none',
            }
          }}
          locale={{
            back: 'Atrás',
            close: 'Cerrar',
            last: 'Finalizar',
            next: 'Siguiente',
            skip: 'Saltar',
          }}
        />
      )}
    </>
  );
}
