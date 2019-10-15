import './OHIFLogo.css';

//import { Icon } from 'react-viewerbase';
import React from 'react';

function OHIFLogo() {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="header-brand"
      href="http://www.hz-iiat.com"
    >
      {/*<Icon name="ohif-head" className="header-logo-image" />*/}
      <i src= "" className="header-logo-image"></i>
      <div className="header-logo-text">Ocean&apos;s Smart Viewer</div>
</a>
  );
}

export default OHIFLogo;
