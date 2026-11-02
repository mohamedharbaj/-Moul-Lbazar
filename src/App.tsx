import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Categories } from './components/Categories';
import { HowItWorks } from './components/HowItWorks';
import { SubmitItemSection } from './components/SubmitItemSection';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

function MainApp() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedCategoryForForm, setSelectedCategoryForForm] = useState<string>('');

  const scrollToSubmit = () => {
    const elem = document.getElementById('submit-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryForForm = (catId: string) => {
    setSelectedCategoryForForm(catId);
    scrollToSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EFE3] text-[#292521]">
      {/* Top Navbar */}
      <Navbar
        onOpenSubmit={scrollToSubmit}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero with official Facebook cover image */}
        <Hero onOpenSubmit={scrollToSubmit} />

        {/* 2. About Us with official Facebook profile photo */}
        <AboutUs />

        {/* 3. Nine Categories */}
        <Categories onSelectCategoryForForm={handleSelectCategoryForForm} />

        {/* 4. How It Works (3 Steps) */}
        <HowItWorks />

        {/* 5. Submit Your Item Form */}
        <SubmitItemSection initialCategoryId={selectedCategoryForForm} />

        {/* 6. Contact Section (WhatsApp, Facebook, Photo tips) */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSubmit={scrollToSubmit}
      />

      {/* Floating Sticky WhatsApp button */}
      <FloatingWhatsApp />

      {/* Protected Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
