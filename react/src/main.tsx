import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { registerLicense, setCulture, setCurrencyCode } from '@syncfusion/ej2-base';
import { initTheme } from './theme/ThemeProvider';

const licenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY as string | undefined;

if (licenseKey) {
  registerLicense(licenseKey);
}


// Pin every Syncfusion component to en-US so dates (M/d/yyyy), 12-hour times,
// number grouping (., ,), currency ($/USD), and calendar/day/month names render
// consistently regardless of the user's browser locale. en-US is Syncfusion's
// built-in culture, so no CLDR data needs to be loaded.
setCulture('en-US')
setCurrencyCode('USD')

// Apply the persisted theme before the first paint to avoid a flash of the
// wrong theme for returning dark-mode users.
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
