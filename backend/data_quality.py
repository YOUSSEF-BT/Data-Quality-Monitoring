class DataQualityChecker:
    def __init__(self, db_manager):
        self.db = db_manager
    
    def check_completeness(self, data, table_name):
        results = []
        if not data:
            return results
        
        columns = list(data[0].keys()) if data else []
        
        for column in columns:
            null_count = sum(1 for row in data if row.get(column) is None)
            total_count = len(data)
            completeness_rate = ((total_count - null_count) / total_count) * 100 if total_count > 0 else 0
            
            status = 'PASS' if completeness_rate >= 95 else 'FAIL' if completeness_rate < 80 else 'WARNING'
            
            self.db.insert_metric([
                f'Completeness_{column}',
                completeness_rate,
                95.0,
                status,
                table_name,
                column,
                f'Taux de complétude: {completeness_rate:.2f}%'
            ])
            
            if null_count > 0:
                for row in data:
                    if row.get(column) is None:
                        self.db.insert_anomaly([
                            'Missing Value',
                            table_name,
                            column,
                            str(row.get('id', 'unknown')),
                            'NULL',
                            'Non-null value',
                            'MEDIUM'
                        ])
            
            results.append({
                'column': column,
                'completeness': completeness_rate,
                'null_count': null_count,
                'status': status
            })
        
        return results
    
    def check_consistency(self, data, table_name):
        results = []
        
        for row in data:
            if 'quantity' in row and row['quantity'] is not None and row['quantity'] < 0:
                self.db.insert_anomaly([
                    'Negative Value',
                    table_name,
                    'quantity',
                    str(row.get('id', 'unknown')),
                    str(row['quantity']),
                    'Positive value',
                    'HIGH'
                ])
            
            if 'total_amount' in row and row['total_amount'] is not None and row['total_amount'] < 0:
                self.db.insert_anomaly([
                    'Negative Value',
                    table_name,
                    'total_amount',
                    str(row.get('id', 'unknown')),
                    str(row['total_amount']),
                    'Positive value',
                    'HIGH'
                ])
        
        # Calculer les métriques
        negative_quantity = sum(1 for row in data if row.get('quantity', 0) < 0)
        negative_total = sum(1 for row in data if row.get('total_amount', 0) < 0)
        
        if 'quantity' in data[0]:
            quantity_rate = ((len(data) - negative_quantity) / len(data) * 100) if data else 0
            self.db.insert_metric([
                'Non_Negative_quantity',
                quantity_rate,
                100.0,
                'PASS' if negative_quantity == 0 else 'FAIL',
                table_name,
                'quantity',
                f'Valeurs non-négatives: {quantity_rate:.2f}%'
            ])
        
        if 'total_amount' in data[0]:
            total_rate = ((len(data) - negative_total) / len(data) * 100) if data else 0
            self.db.insert_metric([
                'Non_Negative_total_amount',
                total_rate,
                100.0,
                'PASS' if negative_total == 0 else 'FAIL',
                table_name,
                'total_amount',
                f'Valeurs non-négatives: {total_rate:.2f}%'
            ])
        
        return results
    
    def run_all_checks(self):
        data = self.db.get_sales_data()
        
        checks_results = {
            'completeness': self.check_completeness(data, 'sales_data'),
            'consistency': self.check_consistency(data, 'sales_data')
        }
        
        return checks_results