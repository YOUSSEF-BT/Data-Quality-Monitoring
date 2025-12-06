import mysql.connector
from mysql.connector import Error

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                database='data_quality_monitoring',
                user='root',
                password='',
                auth_plugin='mysql_native_password'
            )
            if self.connection.is_connected():
                print("✅ Connexion MySQL réussie")
        except Error as e:
            print(f"❌ Erreur MySQL: {e}")
    
    def execute_query(self, query, params=None):
        cursor = self.connection.cursor(dictionary=True)
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                result = cursor.fetchall()
                return result
            else:
                self.connection.commit()
                return cursor.rowcount
        except Error as e:
            print(f"❌ Erreur requête: {e}")
            return None
        finally:
            cursor.close()
    
    def get_sales_data(self):
        query = "SELECT * FROM sales_data"
        return self.execute_query(query)
    
    def insert_metric(self, metric_data):
        query = """
        INSERT INTO data_quality_metrics 
        (metric_name, metric_value, threshold, status, table_name, column_name, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        return self.execute_query(query, metric_data)
    
    def insert_anomaly(self, anomaly_data):
        query = """
        INSERT INTO data_anomalies 
        (anomaly_type, table_name, column_name, record_id, anomaly_value, 
         expected_value, severity, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'NEW')
        """
        return self.execute_query(query, anomaly_data)
    
    def get_quality_metrics(self):
        query = "SELECT * FROM data_quality_metrics ORDER BY check_date DESC LIMIT 100"
        return self.execute_query(query)
    
    def get_anomalies(self):
        query = "SELECT * FROM data_anomalies ORDER BY detection_date DESC LIMIT 50"
        return self.execute_query(query)
    
    def get_dashboard_data(self):
        query = "SELECT * FROM quality_dashboard ORDER BY check_day DESC"
        return self.execute_query(query)