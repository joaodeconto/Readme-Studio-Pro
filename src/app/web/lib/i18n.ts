import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: 'pt-BR',
    fallbackLng: 'en',
    resources: {
      'pt-BR': { translation: { editor: { save: 'Salvar', publish: 'Publicar' } } },
      en: { translation: { editor: { save: 'Save', publish: 'Publish' } } },
    },
    interpolation: { escapeValue: false },
  });
}
export default i18next;
