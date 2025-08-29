import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './Components/Nabar'
import Homepage from './Paages/Homepage'
import Signup from './Components/SignUp'
import LogIn from './Components/Login'
import Dashboard from './DashboardComponent/Dashboard'
import { subscribeToAuthChanges } from './Firebase Auth/Firebase' // Adjust path to your firebase config
import CreateListing from './ListingForms/CreateListing'
import PropertiesForSale from './Paages/PropertyForSale'
import PropertyDetails from './Paages/PropertyDetails';
import { useParams } from 'react-router-dom';
import Wishlist from './Paages/Wishlist'
import { Home } from "lucide-react";
import UserProfileView from './Paages/UserProfileView'
import Footer from './Components/Footer'
import NewsletterSubscribersTable from './Components/NewslettersubcribersTable'
import AgentsList from './Paages/AgentListing'
import PropertySearch from './Paages/PropertySearch'
import PropertiesForRent from './Paages/PropertyForRent'
import PropertiesForShortlet from './Paages/PropertyForShortlet'
import HousesForSale from './DropdownNavigation/HousesForSale'
import ApartmentForSale from './DropdownNavigation/ApartmentForSale'
import CommercialProperties from './DropdownNavigation/CommercialProperties'
import LandForSale from './DropdownNavigation/LandForSale'
import NewDevelopment from './DropdownNavigation/NewDevelopment'
import HousesForRent from './DropdownNavigation/HousesForRent'
import ApartmentForRent from './DropdownNavigation/ApartmenForRent'
import OfficeSpace from './DropdownNavigation/OfficespaceForRent'
import FurnishedForRent from './DropdownNavigation/FurnishedForRent'

// Loading spinner component
const LoadingSpinner = () => (
   <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative flex items-center justify-center">
        {/* Static House */}
        <Home className="text-blue-600 h-10 w-10 z-10" />

        {/* Spinning Circle Around House */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>

      {/* Loading Text */}
      <span className="mt-4 text-gray-600 text-lg font-medium">
        Property Premium
      </span>
    </div>
);


// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/Property_Premium/login" replace />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/Property_Premium/dashboard" replace />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false); // Stop loading once we get the auth state
      
      // Update localStorage for compatibility
      if (user) {
        localStorage.setItem("Status", "Authenticated");
        localStorage.setItem("userData", JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
      } else {
        localStorage.removeItem("Status");
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Router basename='/Property_Premium'>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Homepage />} />
          <Route path='/property_for_shortlet' element={<PropertiesForShortlet />} />
          {/* Properties for Sale */}
          <Route path='/property_for_sale' element={<PropertiesForSale />} />
          <Route path='/Houses_for_Sale' element={<HousesForSale />} />
          <Route path='/Apartment_for_Sale' element={<ApartmentForSale />} />
          <Route path='/CommercialProperties' element={<CommercialProperties />} />
          <Route path='/Land_for_Sale' element={<LandForSale />} />
          <Route path='/NewDevelopmnt' element={<NewDevelopment />} />
          {/* Properties for Rent */}
          <Route path='/property_for_rent' element={<PropertiesForRent />} />
          <Route path='/Houses_for_rent' element={<HousesForRent />} />
          <Route path='/Apartment_for_rent' element={<ApartmentForRent />} />
          <Route path='/Office_Space' element={<OfficeSpace />} />
          <Route path='/Furnished_House_&_Apartment' element={<FurnishedForRent />} />
          

          <Route path='/newsletter_table' element={<NewsletterSubscribersTable />} />
          <Route path='/Agents' element={<AgentsList />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          {/* <Route path="/user" element={<UserProfileView />} /> */}
        <Route path="/profile/:userId" element={<UserProfileView />} />
        <Route path="/search" element={<PropertySearch />} />
          
          {/* Public routes that redirect to dashboard if user is logged in */}
          <Route 
            path='/signup' 
            element={
              <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path='/login' 
            element={
              <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <LogIn />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path='/dashboard/*' 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path='/post_a_listing' element={ <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <CreateListing />
              </ProtectedRoute>} />
          <Route path='/wishlist' element={ <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Wishlist />
              </ProtectedRoute>} />
          
          {/* Catch all route - redirect to home */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App