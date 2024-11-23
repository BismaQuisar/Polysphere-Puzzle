# app.py
from flask import Flask, render_template

# Set custom template and static folder paths
app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route('/')
def home():
    return render_template('index.html')  # Home page

@app.route('/polysphere')
def polysphere():
    return render_template('polysphere.html')  # Polysphere page

@app.route('/nqueen')
def nqueen():
    return render_template('n_queen.html')  # N-Queen page

if __name__ == '__main__':
    app.run(debug=True)
