import React from 'react';
import AssistantWidget from './AssistantWidget';
import SOSButton from './SOSButton';

// Renders global floating widgets (Assistant + SOS) pinned to viewport
// so they remain visible while navigating/scrolling across the app.
const GlobalFloaters: React.FC = () => {
  return (
    <>
      {/* Assistant widget floats bottom-right by itself */}
      <AssistantWidget />
      {/* SOS button floats near bottom-right as well */}
      <SOSButton />
    </>
  );
};

export default GlobalFloaters;
