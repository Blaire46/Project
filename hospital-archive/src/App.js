import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServicesPage from "./pages/ServicesPage";
import YearsPage from "./pages/YearsPage";
import DossiersPage from "./pages/DossiersPage";
import DossierDetails from "./pages/DossierDetails";

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServicesPage />} />
        <Route path="/years/:serviceId" element={<YearsPage />} />
        <Route path="/dossiers/:year" element={<DossiersPage />} />
        <Route path="/dossier/:id" element={<DossierDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;