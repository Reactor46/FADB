import React, { useEffect, useState } from 'react'
import './styles.css'

const API = '/api'

export default function App(){
  const [manufacturers, setManufacturers] = useState([])
  const [firearms, setFirearms] = useState([])
  const [q, setQ] = useState('')

  useEffect(()=>{ fetchManufacturers(); fetchFirearms(); }, [])

  function fetchManufacturers(){
    fetch(`${API}/manufacturers`).then(r=>r.json()).then(setManufacturers)
  }
  function fetchFirearms(){
    fetch(`${API}/firearms`).then(r=>r.json()).then(setFirearms)
  }

  function search(){
    fetch(`${API}/firearms?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(setFirearms)
  }

  return (
    <div className="container">
      <header>
        <h1>FADB</h1>
        <p>Firearms & Manufacturers — responsive web front end</p>
      </header>

      <section className="controls">
        <input placeholder="Search firearms" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={search}>Search</button>
        <a className="export" href={`${API}/export?type=firearms`}>Export CSV</a>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Manufacturers</h2>
          <ul>
            {manufacturers.map(m=> <li key={m.ManufacturerId}>{m.Name} {m.Country?`(${m.Country})`:''}</li>)}
          </ul>
        </div>

        <div className="panel">
          <h2>Firearms</h2>
          <ul>
            {firearms.map(f=> (
              <li key={f.FirearmId} className="firearm">
                <div className="title">{f.ModelName}</div>
                <div className="meta">Caliber: {f.Caliber} • {f.ActionType}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer>
        <small>FADB — sample dataset. Mobile-friendly responsive layout.</small>
      </footer>
    </div>
  )
}
