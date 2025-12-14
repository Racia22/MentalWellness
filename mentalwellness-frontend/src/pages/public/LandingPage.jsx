import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Clock, Heart, Users, Award, Play, Star, CheckCircle, Menu, X, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    { 
      name: "Uwase Claudine", 
      role: "Teacher at Green Hills Academy", 
      text: "This platform has truly changed my life. The therapists understand our culture and provide excellent support. I feel much better now.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&q=80"
    },
    { 
      name: "Mugisha Patrick", 
      role: "Software Developer at Irembo", 
      text: "As someone with a busy schedule, finding time for therapy was difficult. This service allows me to get help anytime. The 24/7 support is incredible.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80"
    },
    { 
      name: "Mukamana Grace", 
      role: "Nurse at King Faisal Hospital", 
      text: "Professional, private, and effective. I have seen real improvement in my mental health. The therapists are caring and truly listen.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80"
    }
  ];

  const organizations = [
    { name: 'AUCA', icon: <GraduationCap className="w-12 h-12" />, fullName: 'Adventist University of Central Africa' },
    { name: 'RDB', icon: <Briefcase className="w-12 h-12" />, fullName: 'Rwanda Development Board' },
    { name: 'RSSB', icon: <Shield className="w-12 h-12" />, fullName: 'Rwanda Social Security Board' },
    { name: 'KHI', icon: <Heart className="w-12 h-12" />, fullName: 'King Faisal Hospital' },
    { name: 'UR', icon: <GraduationCap className="w-12 h-12" />, fullName: 'University of Rwanda' }
  ];

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background-color: #F5F5F0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Navigation Styles */
        .nav-bar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
          transition: all 0.3s ease;
        }

        .nav-bar.scrolled {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .nav-bar.transparent {
          background-color: transparent;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0A1D56;
        }

        .nav-links {
          display: none;
          align-items: center;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .nav-links {
            display: flex;
          }
        }

        .nav-link {
          color: #6B7280;
          font-weight: 500;
          transition: color 0.3s ease;
          text-decoration: none;
        }

        .nav-link:hover {
          color: #1E40AF;
        }

        .btn-login {
          color: #1E40AF;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .btn-login:hover {
          color: #2563EB;
        }

        .btn-primary {
          background: #1E40AF;
          color: white;
          padding: 0.625rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #2563EB;
          transform: scale(1.05);
        }

        .mobile-menu-btn {
          display: block;
          background: none;
          border: none;
          color: #0A1D56;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-menu {
          background: white;
          border-top: 1px solid #f3f4f6;
        }

        .mobile-menu-content {
          padding: 1rem;
        }

        .mobile-menu-link {
          display: block;
          color: #6B7280;
          padding: 0.5rem 0;
          text-decoration: none;
        }

        .mobile-menu-link:hover {
          color: #1E40AF;
        }

        /* Hero Section */
        .hero-section {
          padding-top: 8rem;
          padding-bottom: 5rem;
          padding-left: 1rem;
          padding-right: 1rem;
          background: linear-gradient(180deg, #F5F5F0 0%, #EEEEE8 100%);
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .hero-badge {
          display: inline-block;
          background: rgba(30, 64, 175, 0.1);
          color: #1E40AF;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 3.75rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-title {
            font-size: 4.5rem;
          }
        }

        .hero-title .accent {
          color: #1E40AF;
        }

        .hero-title .primary {
          color: #0A1D56;
        }

        .hero-title .gradient {
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: #6B7280;
          line-height: 1.75;
          margin-bottom: 2rem;
          max-width: 40rem;
        }

        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 640px) {
          .hero-buttons {
            flex-direction: row;
          }
        }

        .btn-hero-primary {
          background: #1E40AF;
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-hero-primary:hover {
          background: #2563EB;
          transform: scale(1.05);
        }

        .btn-hero-secondary {
          border: 2px solid #1E40AF;
          color: #1E40AF;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-hero-secondary:hover {
          background: #1E40AF;
          color: white;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .stat-avatars {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .avatar-group {
          display: flex;
          margin-left: -0.5rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid white;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
        }

        .star-rating {
          display: flex;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: #dcfce7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-number {
          font-weight: 700;
          color: #0A1D56;
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
        }

        .hero-card-main {
          position: relative;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          border-radius: 1.5rem;
          padding: 0;
          box-shadow: 0 20px 60px rgba(30, 64, 175, 0.3);
          overflow: hidden;
          min-height: 400px;
        }

        .hero-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30, 64, 175, 0.2);
          backdrop-filter: blur(2px);
          z-index: 1;
        }

        .hero-card-content {
          position: relative;
          z-index: 0;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }

        .hero-card-content img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .floating-card {
          position: absolute;
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
          z-index: 2;
        }

        .floating-card:hover {
          transform: rotate(0deg) !important;
        }

        .floating-card-1 {
          top: -1.5rem;
          right: -1.5rem;
          width: 12rem;
          transform: rotate(3deg);
        }

        .floating-card-2 {
          bottom: -1.5rem;
          left: -1.5rem;
          width: 14rem;
          transform: rotate(-3deg);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon.green {
          background: #dcfce7;
          color: #16a34a;
        }

        .card-icon.blue {
          background: rgba(30, 64, 175, 0.1);
          color: #1E40AF;
        }

        /* Trust Section */
        .trust-section {
          padding: 3rem 1rem;
          background: white;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
        }

        .trust-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .trust-title {
          text-align: center;
          color: #6B7280;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          align-items: center;
        }

        @media (min-width: 640px) {
          .trust-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .trust-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .trust-card {
          background: #F5F5F0;
          padding: 1.5rem;
          border-radius: 1rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 2px solid #EEEEE8;
        }

        .trust-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: #1E40AF;
        }

        .trust-icon {
          color: #1E40AF;
          margin: 0 auto 0.75rem;
        }

        .trust-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0A1D56;
          margin-bottom: 0.25rem;
        }

        .trust-fullname {
          font-size: 0.75rem;
          color: #6B7280;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 1rem;
          background: #F5F5F0;
        }

        .features-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          background: rgba(30, 64, 175, 0.1);
          color: #1E40AF;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          color: #0A1D56;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.25rem;
          color: #6B7280;
          max-width: 48rem;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .feature-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          transform: translateY(-8px);
          border-color: rgba(30, 64, 175, 0.2);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-icon.blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .feature-icon.purple {
          background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
        }

        .feature-icon.green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .feature-icon.pink {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0A1D56;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          color: #6B7280;
          line-height: 1.6;
        }

        /* Services Section */
        .services-section {
          padding: 6rem 1rem;
          background: #EEEEE8;
        }

        .services-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .services-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .service-card {
          position: relative;
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .service-card.popular {
          border: 2px solid #1E40AF;
          transform: scale(1.05);
        }

        .popular-badge {
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          color: white;
          padding: 0.375rem 1.5rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .service-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0A1D56;
          margin-bottom: 0.5rem;
        }

        .service-price {
          margin-bottom: 1.5rem;
        }

        .price-amount {
          font-size: 3rem;
          font-weight: 700;
          color: #1E40AF;
        }

        .price-period {
          color: #6B7280;
        }

        .service-description {
          color: #6B7280;
          margin-bottom: 1.5rem;
        }

        .service-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem 0;
        }

        .service-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #6B7280;
          margin-bottom: 0.75rem;
        }

        .btn-service {
          width: 100%;
          padding: 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-service.primary {
          background: #1E40AF;
          color: white;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .btn-service.primary:hover {
          background: #2563EB;
        }

        .btn-service.secondary {
          border: 2px solid #1E40AF;
          color: #1E40AF;
          background: white;
        }

        .btn-service.secondary:hover {
          background: #1E40AF;
          color: white;
        }

        /* Stats Section */
        .stats-section {
          padding: 5rem 1rem;
          background: linear-gradient(135deg, #0A1D56 0%, #1E40AF 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .stats-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
        }

        .stats-container {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .stat-card {
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          opacity: 1;
        }

        .stat-card-icon {
          color: rgba(255, 255, 255, 0.8);
          margin: 0 auto 1rem;
          transition: color 0.3s ease;
        }

        .stat-card:hover .stat-card-icon {
          color: white;
        }

        .stat-number {
          font-size: 3.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, white 0%, #bfdbfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: #bfdbfe;
          font-size: 1.125rem;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 6rem 1rem;
          background: #F5F5F0;
        }

        .testimonials-container {
          max-width: 64rem;
          margin: 0 auto;
        }

        .testimonial-card {
          background: white;
          border-radius: 1.5rem;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .testimonial-stars {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }

        .testimonial-text {
          font-size: 1.5rem;
          color: #0A1D56;
          margin-bottom: 2rem;
          text-align: center;
          line-height: 1.75;
        }

        .testimonial-author {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #1E40AF;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
        }

        .author-name {
          font-weight: 700;
          color: #0A1D56;
          font-size: 1.125rem;
        }

        .author-role {
          color: #6B7280;
        }

        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #1E40AF;
          width: 32px;
          border-radius: 6px;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 1rem;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .cta-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.05);
        }

        .cta-container {
          max-width: 64rem;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .cta-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .cta-title {
            font-size: 3.75rem;
          }
        }

        .cta-description {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          color: #bfdbfe;
        }

        .btn-cta {
          background: white;
          color: #1E40AF;
          padding: 1.25rem 2.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1.125rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-cta:hover {
          transform: scale(1.05);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
        }

        .cta-note {
          margin-top: 1.5rem;
          color: #bfdbfe;
        }

        /* Footer */
        .footer {
          padding: 4rem 1rem;
          background: #0A1D56;
          color: white;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-text {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .footer-description {
          color: #bfdbfe;
        }

        .footer-title {
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          color: #bfdbfe;
          margin-bottom: 0.5rem;
          text-decoration: none;
          display: block;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid rgba(30, 64, 175, 0.3);
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .footer-copyright {
          color: #bfdbfe;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-bottom-link {
          color: #bfdbfe;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-bottom-link:hover {
          color: white;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`nav-bar ${scrolled ? 'scrolled' : 'transparent'}`}>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="nav-logo" style={{textDecoration: 'none'}}>
              <div className="logo-icon">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="logo-text">MindCare</span>
            </Link>
            
            <div className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#services" className="nav-link">Services</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <a href="#contact" className="nav-link">Contact</a>
              <Link to="/login" className="btn-login" style={{textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer'}}>Login</Link>
              <Link to="/register" className="btn-primary" style={{textDecoration: 'none'}}>Get Started</Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <a href="#features" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#services" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#testimonials" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <a href="#contact" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <Link to="/login" className="btn-login" style={{width: '100%', textAlign: 'left', padding: '0.5rem 0', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', display: 'block'}} onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary" style={{width: '100%', marginTop: '0.5rem', textDecoration: 'none', display: 'block', textAlign: 'center'}} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div style={{order: 2}} className="lg:order-1">
              <div className="hero-badge">
                🎉 Trusted by 50,000+ Happy Clients
              </div>
              <h1 className="hero-title">
                <span className="accent">Your Journey to</span><br/>
                <span className="primary">Mental Wellness</span><br/>
                <span className="gradient">Starts Here</span>
              </h1>
              <p className="hero-description">
                Connect with certified mental health professionals from the comfort of your home. Get professional support anytime, anywhere in Rwanda.
              </p>
              
              <div className="hero-buttons">
                <Link to="/register" className="btn-hero-primary" style={{textDecoration: 'none'}}>
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="btn-hero-secondary">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat-avatars">
                  <div className="avatar-group">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="avatar" />
                    ))}
                  </div>
                  <div>
                    <div className="star-rating">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4" style={{fill: '#facc15', color: '#facc15'}} />)}
                    </div>
                    <p className="stat-label">500+ Therapists</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <CheckCircle className="w-6 h-6" style={{color: '#16a34a'}} />
                  </div>
                  <div>
                    <p className="stat-number">98%</p>
                    <p className="stat-label">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{order: 1}} className="lg:order-2">
              <div className="hero-visual">
                <div className="hero-card-main">
                  <div className="hero-card-content">
                    <img 
                      src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80" 
                      alt="Black doctor providing mental wellness support"
                    />
                  </div>
                  <div className="hero-card-overlay" />
                  
                  <div className="floating-card floating-card-1">
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div className="card-icon green">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <p style={{fontSize: '0.75rem', color: '#6B7280'}}>Health Score</p>
                        <p style={{fontSize: '1.5rem', fontWeight: 700, color: '#0A1D56'}}>94%</p>
                      </div>
                    </div>
                  </div>

                  <div className="floating-card floating-card-2">
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div className="card-icon blue">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p style={{fontSize: '0.75rem', color: '#6B7280'}}>Next Session</p>
                        <p style={{fontWeight: 700, color: '#0A1D56'}}>Today at 3:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-container">
          <p className="trust-title">Trusted by leading organizations in Rwanda</p>
          <div className="trust-grid">
            {organizations.map((org, i) => (
              <div key={i} className="trust-card">
                <div className="trust-icon">
                  {org.icon}
                </div>
                <div className="trust-name">{org.name}</div>
                <div className="trust-fullname">{org.fullName}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <div className="section-badge">Why Choose Us</div>
            <h2 className="section-title">Everything You Need for Mental Wellness</h2>
            <p className="section-description">
              Complete tools and expert support designed specifically for your mental health journey
            </p>
          </div>
          
          <div className="features-grid">
            {[
              { icon: <Users className="w-8 h-8" />, title: 'Expert Therapists', desc: 'Connect with 500+ certified mental health professionals across Rwanda', color: 'blue' },
              { icon: <Clock className="w-8 h-8" />, title: 'Flexible Sessions', desc: 'Book therapy sessions at times that work perfectly for your schedule', color: 'purple' },
              { icon: <Shield className="w-8 h-8" />, title: '100% Confidential', desc: 'Your privacy and security are our absolute top priority always', color: 'green' },
              { icon: <Heart className="w-8 h-8" />, title: '24/7 Support', desc: 'Round-the-clock assistance available whenever you need it most', color: 'pink' },
            ].map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className={`feature-icon ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="features-container">
          <div className="section-header">
            <div className="section-badge">Our Services</div>
            <h2 className="section-title">Choose Your Perfect Plan</h2>
            <p className="section-description">
              Flexible pricing options designed to fit your needs and budget
            </p>
          </div>
          
          <div className="services-grid">
            {[
              { title: 'Individual Therapy', price: '$99', desc: 'One-on-one personalized sessions with licensed therapists', features: ['50-minute sessions', 'Personal treatment plan', 'Progress tracking', 'Chat support'], popular: false },
              { title: 'Group Sessions', price: '$49', desc: 'Small group therapy with peers facing similar challenges', features: ['90-minute sessions', 'Maximum 8 participants', 'Community support', 'Weekly meetings'], popular: true },
              { title: 'Wellness Programs', price: '$199', desc: 'Complete wellness package with therapy and resources', features: ['Unlimited sessions', 'Priority booking', 'Resource library', '24/7 crisis support'], popular: false },
            ].map((service, idx) => (
              <div key={idx} className={`service-card ${service.popular ? 'popular' : ''}`}>
                {service.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <h3 className="service-title">{service.title}</h3>
                <div className="service-price">
                  <span className="price-amount">{service.price}</span>
                  <span className="price-period">/session</span>
                </div>
                <p className="service-description">{service.desc}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i} className="service-feature">
                      <CheckCircle className="w-5 h-5" style={{color: '#10b981', flexShrink: 0}} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn-service ${service.popular ? 'primary' : 'secondary'}`} style={{textDecoration: 'none', display: 'block', textAlign: 'center'}}>
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-overlay" />
        <div className="stats-container">
          <div className="stats-grid">
            {[
              { number: '500+', label: 'Licensed Therapists', icon: <Users className="w-8 h-8" style={{margin: '0 auto 1rem'}} /> },
              { number: '50,000+', label: 'Happy Clients', icon: <Heart className="w-8 h-8" style={{margin: '0 auto 1rem'}} /> },
              { number: '98%', label: 'Satisfaction Rate', icon: <Award className="w-8 h-8" style={{margin: '0 auto 1rem'}} /> },
              { number: '24/7', label: 'Support Available', icon: <Clock className="w-8 h-8" style={{margin: '0 auto 1rem'}} /> },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-card-icon">
                  {stat.icon}
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <div className="section-badge">Testimonials</div>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-description">
              Real stories from real people in Rwanda who transformed their lives
            </p>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6" style={{fill: '#facc15', color: '#facc15'}} />)}
            </div>
            <p className="testimonial-text">"{testimonials[activeTestimonial].text}"</p>
            <div className="testimonial-author">
              <img 
                src={testimonials[activeTestimonial].image} 
                alt={testimonials[activeTestimonial].name}
                className="author-avatar"
              />
              <div>
                <p className="author-name">{testimonials[activeTestimonial].name}</p>
                <p className="author-role">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTestimonial(i)} 
                  className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-overlay" />
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-description">
            Take the first step towards a healthier, happier you today. Join thousands who have transformed their lives.
          </p>
          <Link to="/register" className="btn-cta" style={{textDecoration: 'none'}}>
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="cta-note">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="footer-brand" style={{textDecoration: 'none'}}>
                <div className="footer-logo">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <span className="footer-brand-text">MindCare</span>
              </Link>
              <p className="footer-description">
                Your trusted partner in mental wellness and personal growth in Rwanda.
              </p>
            </div>
            
            <div>
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/about" className="footer-link">About Us</Link></li>
                <li><Link to="/doctors" className="footer-link">Our Therapists</Link></li>
                <li><Link to="/services" className="footer-link">Services</Link></li>
                <li><a href="#services" className="footer-link">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#contact" className="footer-link">Help Center</a></li>
                <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/terms" className="footer-link">Terms of Service</a></li>
                <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer-title">Contact</h4>
              <ul className="footer-links">
                <li style={{color: '#bfdbfe'}}>+250 788 123 456</li>
                <li style={{color: '#bfdbfe'}}>support@mindcare.rw</li>
                <li style={{color: '#bfdbfe'}}>KN 4 Ave, Kigali</li>
                <li style={{color: '#bfdbfe'}}>Rwanda</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">© 2025 MindCare Rwanda. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="/privacy" className="footer-bottom-link">Privacy</a>
              <a href="/terms" className="footer-bottom-link">Terms</a>
              <Link to="/register" className="footer-bottom-link">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;