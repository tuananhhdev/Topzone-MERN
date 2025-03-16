import AppRoutes from './routes';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { ConfettiProvider } from './context/ConfettiContext';
import ConfettiDisplay from './components/ConfettiDisplay';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfettiProvider>
        <ConfettiDisplay />
        <AppRoutes />
      </ConfettiProvider>
    </I18nextProvider>
  );
}

export default App;
