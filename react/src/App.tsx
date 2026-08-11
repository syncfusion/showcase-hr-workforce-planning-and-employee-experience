import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Overview } from './screens/Overview';
import { WorkforcePlanning } from './screens/WorkforcePlanning';
import { HiringPipeline } from './screens/HiringPipeline';
import { EmployeeExperience } from './screens/EmployeeExperience/EmployeeExperience';
import './App.css';
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/workforce" element={<WorkforcePlanning />} />
            <Route path="/hiring" element={<HiringPipeline />} />
            <Route path="/experience" element={<EmployeeExperience />} />
          </Routes>
        </Layout>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
