import React from 'react';
import { createRoot } from 'react-dom/client';
import MaintenanceApp from './App.jsx';

// Mount the React app to the DOM
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<MaintenanceApp />);
} else {
    console.error('Could not find app container element');
}
