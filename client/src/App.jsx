import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Report from "./pages/Report";
import ProtectedRoute from "./components/ProtectedRoute";
import MissingPets from "./pages/MissingPets";
import PostPet from "./pages/PostPet";
import MyReports from "./pages/MyReports";
import Adopt from "./pages/Adopt";
import Ngos from "./pages/Ngos";
import Volunteer from "./pages/Volunteer";
import NgoDashboard from "./pages/NgoDashboard";
import AddDog from "./pages/AddDog";
import PetTrail from "./pages/PetTrail";
import Trail from "./pages/Trail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />

      <Route path="/missing" element={<MissingPets />} />

      <Route
        path="/missing/new"
        element={
          <ProtectedRoute>
            <PostPet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <MyReports />
          </ProtectedRoute>
        }
      />

      <Route path="/adopt" element={<Adopt />} />
      <Route path="/ngos" element={<Ngos />} />
      <Route path="/volunteer" element={<Volunteer />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/add-dog" element={<AddDog />} />

      <Route
        path="/pet-trail"
        element={
          <ProtectedRoute>
            <PetTrail />
          </ProtectedRoute>
        }
      />

      {/* Public page: QR scan karne par khulega */}
      <Route path="/trail/:qrCode" element={<Trail />} />
    </Routes>
  );
}

export default App;