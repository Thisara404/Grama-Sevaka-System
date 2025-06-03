import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GramasewakaDashboard from './pages/dashboard/gramasewaka.dashboard';
import CitizenDashboard from './pages/dashboard/citizen.dashboard';
import AppointmentScreen from './pages/appointments/gramasewaka.appointments';
import EmergencyReportGramasewaka from './pages/emegency.Report/emegency.report.gramasewaka';
import EmergencyReportCitizen from './pages/emegency.Report/emegency.report.citizen';
import ProfilePage from './pages/profile/gramasewaka.profile';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CitizenAppointmentScreen from './pages/appointments/citizen.appointment';
import CitizenLegalCase from './pages/LegalCase/citizenLegal.jsx';
import GSLegalCase from './pages/LegalCase/gsLegal.jsx';
import CitizenService from './pages/service mngt/citizenService';
import GSService from './pages/service mngt/gsService';
import CitizenProfile from './pages/profile/citizen.profile';
import GISMappingCitizen from './pages/gis & mapping/gis.mapping.citizen';
import ResidenceApproval from './pages/gis & mapping/residence.approval';
import GISMappingGramaSewaka from './pages/gis & mapping/gis.mapping.gramasewaka';
import GSAnnouncements from './pages/Announcements/GSannouncements';
import CitizenAnnouncements from './pages/Announcements/CitizenAnnouncements';
import CitizenAnnouncementDetail from './pages/Announcements/CitizenAnnouncementDetail';
import GSForum from './pages/Forum/GSforum';
import CitizenForum from './pages/Forum/Citizenforum';
import DiscussionDetail from './pages/Forum/DiscussionDetail';
import CitizenServiceRequest from './pages/service mngt/citizen.service.request.form';
import CitizenServiceRequests from './pages/service mngt/citizen.service.requests';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* GS Officer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['gs']}>
            <GramasewakaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute roles={['gs']}>
            <AppointmentScreen />
          </ProtectedRoute>
        } />
        <Route path="/emergency-reports" element={
          <ProtectedRoute roles={['gs']}>
            <EmergencyReportGramasewaka />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['gs']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/gis-mapping" element={
          <ProtectedRoute roles={['gs']}>
            <GISMappingGramaSewaka />
          </ProtectedRoute>
        } />
        <Route path="/residence-approval" element={
          <ProtectedRoute roles={['gs']}>
            <ResidenceApproval />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute roles={['gs']}>
            <GSService />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute roles={['gs']}>
            <GSAnnouncements />
          </ProtectedRoute>
        } />
        <Route path="/forum" element={
          <ProtectedRoute roles={['gs']}>
            <GSForum />
          </ProtectedRoute>
        } />
        <Route path="/forum/:id" element={
          <ProtectedRoute roles={['gs']}>
            <DiscussionDetail />
          </ProtectedRoute>
        } />
        <Route path="/legal-cases" element={
          <ProtectedRoute roles={['gs']}>
            <GSLegalCase />
          </ProtectedRoute>
        } />
        
        {/* Citizen Routes */}
        <Route path="/citizen/dashboard" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/citizen/appointment" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenAppointmentScreen />
          </ProtectedRoute>
        } />
        <Route path="/citizen/emergency" element={
          <ProtectedRoute roles={['citizen']}>
            <EmergencyReportCitizen />
          </ProtectedRoute>
        } />
        <Route path="/citizen/profile" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenProfile />
          </ProtectedRoute>
        } />
        <Route path="/citizen/gis-mapping" element={
          <ProtectedRoute roles={['citizen']}>
            <GISMappingCitizen />
          </ProtectedRoute>
        } />
        <Route path="/citizen/services" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenService />
          </ProtectedRoute>
        } />
        <Route path="/citizen/service-requests" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenServiceRequests />
          </ProtectedRoute>
        } />
        <Route path="/citizen/service-request" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenServiceRequest />
          </ProtectedRoute>
        } />
        <Route path="/citizen/announcements" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenAnnouncements />
          </ProtectedRoute>
        } />
        <Route path="/citizen/announcements/:id" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenAnnouncementDetail />
          </ProtectedRoute>
        } />
        <Route path="/citizen/forum" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenForum />
          </ProtectedRoute>
        } />
        <Route path="/citizen/forum/:id" element={
          <ProtectedRoute roles={['citizen']}>
            <DiscussionDetail />
          </ProtectedRoute>
        } />
        {/* Fix the route path to match what's being used in navigation */}
        <Route path="/citizen/legal-cases" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenLegalCase />
          </ProtectedRoute>
        } />
        
        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;