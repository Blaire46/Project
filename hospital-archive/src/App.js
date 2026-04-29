import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ServicesPage from "./pages/ServicesPage";
import YearsPage from "./pages/YearsPage";
import DossiersPage from "./pages/DossiersPage";
import DossierDetails from "./pages/DossierDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path="/years/:serviceId" element={<ProtectedRoute><YearsPage /></ProtectedRoute>} />
        <Route path="/dossiers/:year" element={<ProtectedRoute><DossiersPage /></ProtectedRoute>} />
        <Route path="/dossier/:id" element={<ProtectedRoute><DossierDetails /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;