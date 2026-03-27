from flask import Flask, jsonify
from flask_cors import CORS
from extensions import socketio 
import logging
from routes.asignaciones_routes import bp as asignaciones_bp
from routes.usuarios_routes import bp as usuarios_bp

def create_app():
    app = Flask(__name__)
    
    # 1. Configuración de CORS para peticiones HTTP normales (JSON/API)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuración de Logs
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s'
    )

    # 2. Registro de Blueprints
    app.register_blueprint(asignaciones_bp, url_prefix='/api')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')

    # Manejo de Errores
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Ruta no encontrada"}), 404

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": e.description}), 400

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Error interno del servidor"}), 500

    # 3. Vincular SocketIO a la app
    socketio.init_app(app)
    
    return app

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)