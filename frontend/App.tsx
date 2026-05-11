// frontend/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Funcionario from './pages/Funcionario';
import Psicologo from './pages/Psicologo';
import Gestor from './pages/Gestor';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 140px)', padding: '24px', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            
            {/* Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['funcionario', 'psicologo', 'gestor']} />}>
              <Route path="/funcionario" element={<Funcionario />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['psicologo']} />}>
              <Route path="/psicologo" element={<Psicologo />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['gestor']} />}>
              <Route path="/gestor" element={<Gestor />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;