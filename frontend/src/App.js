import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QualityMetrics from './components/QualityMetrics';
import Anomalies from './components/Anomalies';
import DataOverview from './components/DataOverview';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/metrics" element={<QualityMetrics />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/overview" element={<DataOverview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;