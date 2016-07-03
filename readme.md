npm install webpack -g
babel install -g babel-cli

npm install babel-preset-es2015 babel-preset-react
npm install --save react react-dom babel-preset-react babel-loader babel-core


babel --presets es2015,react --watch src/ --out-dir lib/

export FLASK_APP=main.py
flask run
