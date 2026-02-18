import React, { useState, useEffect } from "react";
import "./Onboarding.css";
import { useLanguage } from "./i18n/LanguageContext";

const ONBOARDING_KEY = "l2dps_onboarding_completed";

// Helper component to render HTML content
function HtmlContent({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function Onboarding({ isOpen, onClose, forceOpen = false }) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Define slides using translation keys
  const getSlides = () => [
    {
      id: "welcome",
      icon: t('onboarding.slides.welcome.icon'),
      title: t('onboarding.slides.welcome.title'),
      content: (
        <>
          <p>
            <HtmlContent html={t('onboarding.slides.welcome.content1')} />
          </p>
          <p style={{ marginTop: "1rem" }}>
            {t('onboarding.slides.welcome.content2')}
          </p>
        </>
      ),
    },
    {
      id: "capture",
      icon: t('onboarding.slides.capture.icon'),
      title: t('onboarding.slides.capture.title'),
      content: (
        <>
          <p>
            <HtmlContent html={t('onboarding.slides.capture.content1')} />
          </p>
          <p style={{ marginTop: "1rem" }}>
            <HtmlContent html={t('onboarding.slides.capture.content2')} />
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#7a7568" }}>
            <HtmlContent html={t('onboarding.slides.capture.content3')} />
          </p>
        </>
      ),
    },
    {
      id: "upload",
      icon: t('onboarding.slides.upload.icon'),
      title: t('onboarding.slides.upload.title'),
      content: (
        <>
          <p>
            <HtmlContent html={t('onboarding.slides.upload.content1')} />
          </p>
          <p style={{ marginTop: "1rem" }}>
            {t('onboarding.slides.upload.content2')}
          </p>
          <p style={{ marginTop: "1rem" }}>
            <HtmlContent html={t('onboarding.slides.upload.content3')} />
          </p>
        </>
      ),
    },
    {
      id: "results",
      icon: t('onboarding.slides.results.icon'),
      title: t('onboarding.slides.results.title'),
      content: (
        <>
          <p>
            <HtmlContent html={t('onboarding.slides.results.content1')} />
          </p>
          <p style={{ marginTop: "1rem" }}>
            {t('onboarding.slides.results.content2')}
          </p>
        </>
      ),
    },
    {
      id: "save",
      icon: t('onboarding.slides.save.icon'),
      title: t('onboarding.slides.save.title'),
      content: (
        <>
          <p>
            <HtmlContent html={t('onboarding.slides.save.content1')} />
          </p>
          <p style={{ marginTop: "1rem" }}>
            <HtmlContent html={t('onboarding.slides.save.content2')} />
          </p>
        </>
      ),
    },
    {
      id: "ready",
      icon: t('onboarding.slides.ready.icon'),
      title: t('onboarding.slides.ready.title'),
      content: (
        <>
          <p>
            {t('onboarding.slides.ready.content1')}
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#7a7568" }}>
            <HtmlContent html={t('onboarding.slides.ready.content2')} />
          </p>
        </>
      ),
    },
  ];

  const slides = getSlides();

  useEffect(() => {
    // Check if this is the first visit
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    
    if (forceOpen || isOpen) {
      setIsVisible(true);
    } else if (!hasCompletedOnboarding && !forceOpen) {
      // Auto-show on first visit after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, forceOpen]);

  const handleClose = () => {
    setIsVisible(false);
    // Mark onboarding as completed
    localStorage.setItem(ONBOARDING_KEY, "true");
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!isVisible && !isOpen) return null;

  const slide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="onboardingOverlay visible" onClick={handleClose} />

      {/* Modal */}
      <div className="onboardingModal">
        {/* Close button */}
        <button className="onboardingClose" onClick={handleClose} title={t('onboarding.close')}>
          ×
        </button>

        {/* Skip button */}
        {!isLastSlide && (
          <button className="onboardingSkip" onClick={handleSkip}>
            {t('onboarding.skip')}
          </button>
        )}

        {/* Content */}
        <div className="onboardingContent">
          <div className="onboardingIcon">{slide.icon}</div>
          <h2 className="onboardingTitle">{slide.title}</h2>
          <div className="onboardingText">{slide.content}</div>
        </div>

        {/* Progress dots */}
        <div className="onboardingProgress">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`onboardingDot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="onboardingNav">
          <button
            className="onboardingBtn onboardingBtnPrev"
            onClick={handlePrev}
            disabled={isFirstSlide}
          >
            {t('onboarding.previous')}
          </button>
          <button
            className="onboardingBtn onboardingBtnNext"
            onClick={handleNext}
          >
            {isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </>
  );
}

// Utility function to reset onboarding (can be called from console or settings)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  window.location.reload();
};

export default Onboarding;
