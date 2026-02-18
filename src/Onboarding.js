import React, { useState, useEffect } from "react";
import "./Onboarding.css";

const ONBOARDING_KEY = "l2dps_onboarding_completed";

const slides = [
  {
    id: "welcome",
    icon: "⚔️",
    title: "Welcome to L2 DPS Calculator",
    content: (
      <>
        <p>
          This tool helps you analyze your combat performance in <strong>Lineage II</strong> by
          parsing your combat logs and calculating detailed DPS statistics.
        </p>
        <p style={{ marginTop: "1rem" }}>
          Track your skills, critical hits, and compare different builds or rotations
          to optimize your damage output.
        </p>
      </>
    ),
  },
  {
    id: "capture",
    icon: "📜",
    title: "Capture Combat Logs",
    content: (
      <>
        <p>
          In-game, use the command <code>{"///textcapture on"}</code> to start
          recording your combat logs.
        </p>
        <p style={{ marginTop: "1rem" }}>
          When finished, use <code>{"///textcapture off"}</code> to stop.
        </p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#7a7568" }}>
          Logs are saved in your <code>Lineage2/system</code> folder as{" "}
          <code>CharacterName_L2_MM_DD_HH_MM.log</code>
        </p>
      </>
    ),
  },
  {
    id: "upload",
    icon: "📁",
    title: "Upload & Analyze",
    content: (
      <>
        <p>
          Upload your <strong>.log</strong> file by dragging and dropping it into the
          upload area, or use the file picker.
        </p>
        <p style={{ marginTop: "1rem" }}>
          You can also paste the log content directly into the text area if you prefer.
        </p>
        <p style={{ marginTop: "1rem" }}>
          Set your <strong>fight duration</strong> and click <strong>Calculate DPS</strong> to analyze.
        </p>
      </>
    ),
  },
  {
    id: "results",
    icon: "📊",
    title: "View Your Results",
    content: (
      <>
        <p>
          After calculation, you'll see your total <strong>DPS</strong> and a detailed
          breakdown of each skill used.
        </p>
        <p style={{ marginTop: "1rem" }}>
          Click on any skill name to expand and view individual damage lines.
          Stats include: Min, Max, Average, Hits, and Critical Hit rate.
        </p>
      </>
    ),
  },
  {
    id: "save",
    icon: "💾",
    title: "Save & Compare",
    content: (
      <>
        <p>
          Give your result a name and <strong>save</strong> it to build a collection
          of your DPS tests.
        </p>
        <p style={{ marginTop: "1rem" }}>
          Use the <strong>Compare</strong> button on skills to see side-by-side comparisons
          across different saved runs and track your progress.
        </p>
      </>
    ),
  },
  {
    id: "ready",
    icon: "🎯",
    title: "Ready to Begin?",
    content: (
      <>
        <p>
          You're all set! Start analyzing your combat performance and optimize
          your character's damage output.
        </p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#7a7568" }}>
          <strong>Tip:</strong> You can reopen this guide anytime by clicking the{" "}
          <span style={{ color: "#4a90d9" }}>?</span> button in the top right.
        </p>
      </>
    ),
  },
];

function Onboarding({ isOpen, onClose, forceOpen = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

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
        <button className="onboardingClose" onClick={handleClose} title="Close">
          ×
        </button>

        {/* Skip button */}
        {!isLastSlide && (
          <button className="onboardingSkip" onClick={handleSkip}>
            Skip
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
            Previous
          </button>
          <button
            className="onboardingBtn onboardingBtnNext"
            onClick={handleNext}
          >
            {isLastSlide ? "Get Started" : "Next"}
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
