import React from 'react';
import './Alert.css';

export const Alert = ({ children, type = 'info', onDismiss }) => (
  <div className={`alert alert--type-${ type }`}>
    <p>
      { children }
    </p>

    <button class="alert__dismiss-button" onClick={onDismiss}>Dismiss</button>
  </div>
)