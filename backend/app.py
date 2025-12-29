from flask import Flask
from flask_cors import CORS
from routes.asignaciones_routes import bp as asignaciones_bp
from routes.usuarios_routes import bp as usuarios_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(asignaciones_bp, url_prefix='/api')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')

if __name__ == "__main__":
    print("🚀 Servidor iniciado en http://localhost:5000")
    app.run(debug=True, port=5000)