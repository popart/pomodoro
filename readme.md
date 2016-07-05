requirements:
  sqlite3, python3, virtualenv

setup:
  npm install
  webpack

  virtualenv -p python3 venv
  source venv/bin/activate
  python scripts/setup_db.py
  pip install flask
  ./runserver
