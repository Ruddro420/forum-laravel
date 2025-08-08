import React, { useEffect } from 'react';

const Chat = ({ visitor }) => {
  useEffect(() => {
    // Set the Tawk visitor object before loading the script
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.visitor = {
      userId: visitor.userId,
      name: visitor.name,
      email: visitor.email,
      hash: visitor.hash,
    };

    // Dynamically load Tawk.to widget script
    if (!document.getElementById('tawk-script')) {
      const script = document.createElement('script');
      script.id = 'tawk-script';
      script.async = true;
      script.src = 'https://embed.tawk.to/68951ec07327e019277581d2/default';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    }

    // Optional: listen for widget load event
    window.Tawk_API.onLoad = function () {
      console.log('Tawk.to widget loaded');
    };

    return () => {
      // Optional: cleanup on component unmount
      // Note: tawk.to does not officially support widget removal
    };
  }, [visitor]);

  return (
    <div>
      <h1>Chat with Support</h1>
      {/* The widget appears automatically */}
    </div>
  );
};

export default Chat;
