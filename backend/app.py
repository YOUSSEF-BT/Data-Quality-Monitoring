from flask import Flask, jsonify, request
from flask_cors import CORS
from database import DatabaseManager
from data_quality import DataQualityChecker
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

db = DatabaseManager()
quality_checker = DataQualityChecker(db)

@app.route('/api/run-checks', methods=['POST'])
def run_quality_checks():
    try:
        results = quality_checker.run_all_checks()
        return jsonify({
            'success': True,
            'message': 'Contrôles exécutés avec succès',
            'results': results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/quality-metrics', methods=['GET'])
def get_quality_metrics():
    try:
        metrics = db.get_quality_metrics()
        return jsonify({'success': True, 'data': metrics})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    try:
        anomalies = db.get_anomalies()
        return jsonify({'success': True, 'data': anomalies})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    try:
        dashboard_data = db.get_dashboard_data()
        return jsonify({'success': True, 'data': dashboard_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/sales-data', methods=['GET'])
def get_sales_data():
    try:
        data = db.get_sales_data()
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/quality-summary', methods=['GET'])
def get_quality_summary():
    try:
        metrics = db.get_quality_metrics()
        anomalies = db.get_anomalies()
        
        if metrics:
            df = pd.DataFrame(metrics)
            summary = {
                'total_checks': len(df),
                'passed_checks': len(df[df['status'] == 'PASS']),
                'failed_checks': len(df[df['status'] == 'FAIL']),
                'warning_checks': len(df[df['status'] == 'WARNING']),
                'success_rate': (len(df[df['status'] == 'PASS']) / len(df) * 100) if len(df) > 0 else 0,
                'total_anomalies': len(anomalies) if anomalies else 0,
                'new_anomalies': len([a for a in anomalies if a['status'] == 'NEW']) if anomalies else 0,
                'high_severity_anomalies': len([a for a in anomalies if a['severity'] == 'HIGH']) if anomalies else 0
            }
        else:
            summary = {}
        
        return jsonify({'success': True, 'summary': summary})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/update-anomaly-status', methods=['POST'])
def update_anomaly_status():
    try:
        data = request.json
        query = "UPDATE data_anomalies SET status = %s WHERE id = %s"
        db.execute_query(query, (data['status'], data['id']))
        return jsonify({'success': True, 'message': 'Statut mis à jour'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

if __name__ == '__main__':
    print("🚀 Backend démarré sur http://localhost:5001")
    app.run(debug=True, port=5001)

@app.route('/api/run-checks', methods=['POST'])
def run_checks():
    try:
        # Ici vous appelez votre logique de contrôle de qualité
        # Pour l'exemple, nous allons simuler l'exécution
        
        # Simulation : générer de nouvelles métriques
        import random
        from datetime import datetime
        
        # Nouvelles métriques simulées
        new_metrics = [
            ('Complétude client', random.uniform(90, 100), 98.0, 
             'PASS' if random.random() > 0.3 else 'FAIL', 
             'sales_data', 'customer_id', 
             'Pourcentage de valeurs non nulles', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            ('Valeurs négatives', random.uniform(0, 5), 0.0, 
             'FAIL' if random.random() > 0.7 else 'PASS',
             'sales_data', 'quantity', 
             'Pourcentage de valeurs négatives', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            ('Exactitude calcul', random.uniform(95, 100), 99.0, 
             'PASS' if random.random() > 0.2 else 'FAIL',
             'sales_data', 'total_amount', 
             'Exactitude des calculs', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        ]
        
        # Insérer dans la base de données
        for metric in new_metrics:
            db.execute_query('''
                INSERT INTO data_quality_metrics 
                (metric_name, metric_value, threshold, status, table_name, column_name, description, check_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', metric)
        
        return jsonify({
            'success': True,
            'message': f'{len(new_metrics)} contrôles exécutés avec succès',
            'checks_executed': len(new_metrics)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})