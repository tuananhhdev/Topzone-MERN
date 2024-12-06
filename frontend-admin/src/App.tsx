import AppRoutes from './routes';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Chủ đề
import 'primereact/resources/primereact.min.css'; // PrimeReact CSS
import 'primeicons/primeicons.css'; // PrimeIcons CSS

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppRoutes />
    </I18nextProvider>
  );
}

export default App;
