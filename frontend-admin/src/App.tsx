import AppRoutes from './routes';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppRoutes />
    </I18nextProvider>
  );
}

export default App;
