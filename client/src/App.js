import React from 'react';
import AddFirearm from './components/AddFirearm';
import ListFirearms from './components/ListFirearms';

function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>FADB — Personal Firearms</h1>
      <AddFirearm />
      <hr />
      <ListFirearms />
    </div>
  );
}

export default App;
