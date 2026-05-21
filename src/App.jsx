import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, signInAnonymously } from './firebase/config';
import Header from './components/Header';
import FolioForm from './components/FolioForm';
import FolioTable from './components/FolioTable';
import ArchiveFab from './components/ArchiveFab';
import Tutorial from './components/Tutorial';

function App() {
  const [user, setUser] = useState(null);
  const [folios, setFolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('imss_admin_mode') === 'true');
  const [runTutorial, setRunTutorial] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    signInAnonymously(auth).catch((error) => {
      console.error("Error auth:", error);
      setLoading(false);
    });

    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      if (isFirebaseConfigured && !user) return; // wait for user
      return;
    }

    const unsubscribeDb = onSnapshot(collection(db, 'folios_imss'), (snapshot) => {
      const foliosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      foliosData.sort((a, b) => parseInt(b.num) - parseInt(a.num));
      setFolios(foliosData);
      setLoading(false);
    }, (error) => {
      console.error("Error folios:", error);
      setLoading(false);
    });

    return () => unsubscribeDb();
  }, [user]);

  const maxNum = folios.length === 0 ? 0 : Math.max(...folios.map(f => parseInt(f.num) || 0));
  const isLimitReached = maxNum >= 800;

  const getNextFolioNum = () => {
    if (isLimitReached) return "LIM";
    if (folios.length === 0) return "001";
    return String(maxNum + 1).padStart(3, '0');
  };

  if (loading && isFirebaseConfigured) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-imss-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">
            Sincronizando sistema en tiempo real...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} onStartTutorial={() => setRunTutorial(true)} />
      <Tutorial run={runTutorial} setRun={setRunTutorial} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isFirebaseConfigured && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm flex items-center gap-3 animate-pulse">
            <p className="text-red-700 font-medium">
              ⚠️ IMPORTANTE: Necesitas configurar las credenciales de Firebase en el archivo .env para que el sistema funcione en tiempo real.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4">
            <FolioForm user={user} nextFolioNum={getNextFolioNum()} isLimitReached={isLimitReached} />
          </div>

          <div className="xl:col-span-8">
            <FolioTable folios={folios} isAdmin={isAdmin} />
          </div>
        </div>
      </main>

      {/* Botón flotante para el archivo histórico */}
      <ArchiveFab folios={folios} />
    </div>
  );
}

export default App;
