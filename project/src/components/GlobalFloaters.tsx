import React from 'react';
import AssistantWidget from './AssistantWidget';
import SOSButton from './SOSButton';
import DraggableFloat from './ui/DraggableFloat';
import ScrollProgress from './ui/ScrollProgress';
import ScrollToTop from './ui/ScrollToTop';

// Renders global floating widgets (Assistant + SOS) pinned to viewport
// so they remain visible while navigating/scrolling across the app.
const GlobalFloaters: React.FC = () => {
  return (
    <>
      {/* Global progress bar */}
      <ScrollProgress />
      {/* Assistant widget floats bottom-right by default, draggable */}
      <div className="fixed bottom-4 right-4 z-50">
        <DraggableFloat id="assistant" className="relative">
          <AssistantWidget />
        </DraggableFloat>
      </div>
      {/* SOS button floats near bottom-right as well, draggable */}
      <div className="fixed bottom-24 right-5 z-50">
        <DraggableFloat id="sos" className="relative">
          <SOSButton />
        </DraggableFloat>
      </div>
      {/* Scroll to top button */}
      <ScrollToTop />
    </>
  );
};

export default GlobalFloaters;
