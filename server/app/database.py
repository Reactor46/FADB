from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# NOTE: the SQLite database file lives under DB_DIR, which is a *separate*,
# writable location from DATA_DIR (where the read-only source CSV lives).
# Keeping them separate means the source data volume can stay mounted
# read-only (see docker-compose.yml) while SQLAlchemy still has a writable
# path to create/update fadb.sqlite.
DB_DIR = os.environ.get('DB_DIR', '/app/db')
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, 'fadb.sqlite')
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
