from flask import Flask, jsonify
from flask_cors import CORS
import logging
from routes.asignaciones_routes import bp as asignaciones_bp
from routes.usuarios_routes import bp as usuarios_bp

def create_app():
    """
    Factory Function: Configura y crea la instancia de la aplicación Flask.
    Modularizar la creación permite realizar tests unitarios más fácilmente.
    """
    app = Flask(__name__)
    
    # Configuración de CORS: En producción podrías restringir los orígenes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuración de Logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime) +3688s %(levelname)s: %(message)s'
    )

    # Registro de Blueprints
    app.register_blueprint(asignaciones_bp, url_prefix='/api')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')

    # Manejador de errores global para JSON
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    # Usamos host='0.0.0.0' para facilitar el acceso en redes locales si fuera necesario
    print("🚀 Servidor Flask modularizado iniciado en http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)