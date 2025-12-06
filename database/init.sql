-- Créer la base de données
CREATE DATABASE IF NOT EXISTS data_quality_monitoring;
USE data_quality_monitoring;

-- Table des ventes
CREATE TABLE sales_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50),
    customer_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    transaction_date DATE,
    region VARCHAR(50),
    sales_person VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des métriques de qualité
CREATE TABLE data_quality_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2),
    threshold DECIMAL(10, 2),
    status ENUM('PASS', 'FAIL', 'WARNING'),
    table_name VARCHAR(100),
    column_name VARCHAR(100),
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Table des anomalies
CREATE TABLE data_anomalies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    anomaly_type VARCHAR(50),
    table_name VARCHAR(100),
    column_name VARCHAR(100),
    record_id VARCHAR(100),
    anomaly_value VARCHAR(255),
    expected_value VARCHAR(255),
    severity ENUM('LOW', 'MEDIUM', 'HIGH'),
    detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED')
);

-- Table d'historique
CREATE TABLE quality_checks_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    check_name VARCHAR(100),
    check_type VARCHAR(50),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    records_checked INT,
    anomalies_found INT,
    success_rate DECIMAL(5, 2)
);

-- Vue pour le dashboard
CREATE VIEW quality_dashboard AS
SELECT 
    DATE(check_date) as check_day,
    table_name,
    COUNT(*) as total_checks,
    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as passed_checks,
    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as failed_checks,
    ROUND(SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
FROM data_quality_metrics
GROUP BY DATE(check_date), table_name;

-- Insérer des données d'exemple
INSERT INTO sales_data (transaction_id, customer_id, product_id, quantity, unit_price, total_amount, transaction_date, region, sales_person) VALUES
('TX001', 1001, 1, 2, 25.50, 51.00, '2024-01-15', 'North', 'John Doe'),
('TX002', 1002, 2, 1, 100.00, 100.00, '2024-01-16', 'South', 'Jane Smith'),
('TX003', 1003, 3, 5, 15.75, 78.75, '2024-01-17', 'East', 'Bob Johnson'),
('TX004', NULL, 4, 3, 45.00, 135.00, NULL, 'West', 'Alice Brown'),
('TX005', 1005, 5, -2, 30.00, -60.00, '2024-01-18', 'North', 'Charlie Wilson');