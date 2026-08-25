import React from 'react';
import AddFirearm from './components/AddFirearm';
import ListFirearms from './components/ListFirearms';

function App() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">FADB — Your Personal Arsenal</h1>
          <p className="text-sm text-gray-500">Secure, private catalog of your firearms with photos and serial numbers</p>
        </div>
        <div className="text-right text-sm text-gray-500">Local only • No auth</div>
      </header>

      <main className="space-y-8">
        <AddFirearm />
        <ListFirearms />
      </main>

      <footer className="mt-12 text-center text-xs text-gray-400">
        Built with care — images stored locally in data/images/
      </footer>
    </div>
  );
}

export default App;
