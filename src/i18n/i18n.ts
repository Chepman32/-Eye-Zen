import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {NativeModules, Platform} from 'react-native';
import {storageService} from '../services/storageService';

// Import translations
import en from './translations/en.json';
import ru from './translations/ru.json';
import es from './translations/es.json';
import de from './translations/de.json';
import fr from './translations/fr.json';
import pt from './translations/pt.json';
import ja from './translations/ja.json';
import it from './translations/it.json';
import pl from './translations/pl.json';
import zh from './translations/zh.json';
import hi from './translations/hi.json';
import uk from './translations/uk.json';

export const resources = {
  en: {translation: en},
  ru: {translation: ru},
  es: {translation: es},
  de: {translation: de},
  fr: {translation: fr},
  pt: {translation: pt},
  ja: {translation: ja},
  it: {translation: it},
  pl: {translation: pl},
  zh: {translation: zh},
  hi: {translation: hi},
  uk: {translation: uk},
};

export type Language = keyof typeof resources;

export const languages: {code: Language; name: string; nativeName: string; flag: string}[] = [
  {code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧'},
  {code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸'},
  {code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪'},
  {code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷'},
  {code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹'},
  {code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺'},
  {code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵'},
  {code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹'},
  {code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱'},
  {code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳'},
  {code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳'},
  {code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦'},
];

const FALLBACK_LANGUAGE: Language = 'en';

const getDeviceLanguage = (): Language => {
  try {
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (!locale || typeof locale !== 'string') {
      return FALLBACK_LANGUAGE;
    }

    const normalized = locale.replace('_', '-').split('-')[0]?.toLowerCase();

    if (normalized && normalized in resources) {
      return normalized as Language;
    }
  } catch (error) {
    console.warn('Failed to detect device language, falling back to English:', error);
  }

  return FALLBACK_LANGUAGE;
};

const getInitialLanguage = async (): Promise<Language> => {
  const savedLanguage = await storageService.getItem<Language>('language_preference');

  if (savedLanguage && savedLanguage in resources) {
    return savedLanguage;
  }

  return getDeviceLanguage();
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  try {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: FALLBACK_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
  } catch (error) {
    console.error('Error initializing i18n:', error);
    // Fallback initialization
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: FALLBACK_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

initI18n();

export const changeLanguage = async (language: Language) => {
  try {
    await i18n.changeLanguage(language);
    await storageService.setItem('language_preference', language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;
