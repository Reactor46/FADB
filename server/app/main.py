# Minimal FastAPI app for FADB
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
from typing import List
import csv
import io
import os
from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title='FADB API')

@app.get('/api/manufacturers')
def list_manufacturers(q: str = Query(None)):
    db = SessionLocal()
    try:
        items = crud.get_manufacturers(db, q)
        return items
    finally:
        db.close()

@app.get('/api/firearms')
def list_firearms(q: str = Query(None), manufacturer: str = Query(None)):
    db = SessionLocal()
    try:
        items = crud.get_firearms(db, q, manufacturer)
        return items
    finally:
        db.close()

@app.get('/api/export')
def export(type: str = Query('firearms')):
    db = SessionLocal()
    try:
        if type == 'manufacturers':
            rows = crud.get_manufacturers(db)
            fieldnames = ['ManufacturerId','Name','FullName','Country','FoundedYear','DefunctYear','IsActive','WebsiteUrl','SourceRef']
            def iter_csv():
                buf = io.StringIO()
                writer = csv.writer(buf)
                writer.writerow(fieldnames)
                yield buf.getvalue()
                buf.seek(0); buf.truncate(0)
                for r in rows:
                    writer.writerow([r.ManufacturerId, r.Name, r.FullName or '', r.Country or '', r.FoundedYear or '', r.DefunctYear or '', int(r.IsActive), r.WebsiteUrl or '', r.SourceRef or ''])
                    yield buf.getvalue()
                    buf.seek(0); buf.truncate(0)
                
            return StreamingResponse(iter_csv(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=manufacturers.csv'})
        else:
            rows = crud.get_firearms(db)
            fieldnames = ['FirearmId','ModelName','ManufacturerId','Caliber','ActionType','ProductionStartYear','ProductionEndYear','IsInProduction','CountryOfOrigin','MarketSegment','SourceRef']
            def iter_csv():
                buf = io.StringIO()
                writer = csv.writer(buf)
                writer.writerow(fieldnames)
                yield buf.getvalue()
                buf.seek(0); buf.truncate(0)
                for r in rows:
                    writer.writerow([r.FirearmId, r.ModelName, r.ManufacturerId or '', r.Caliber or '', r.ActionType or '', r.ProductionStartYear or '', r.ProductionEndYear or '', int(r.IsInProduction), r.CountryOfOrigin or '', r.MarketSegment or '', r.SourceRef or ''])
                    yield buf.getvalue()
                    buf.seek(0); buf.truncate(0)
            return StreamingResponse(iter_csv(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=firearms.csv'})
    finally:
        db.close()
