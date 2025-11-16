import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {useTheme} from '../contexts/ThemeContext';
import {useSettings} from '../contexts/SettingsContext';
import {ThemeName} from '../theme/themes';
import {changeLanguage, Language, languages} from '../i18n/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const {theme, themeName, setTheme} = useTheme();
  const {soundEnabled, hapticsEnabled, setSoundEnabled, setHapticsEnabled, triggerHaptic} =
    useSettings();

  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleThemeChange = (newTheme: ThemeName) => {
    triggerHaptic('impactLight');
    setTheme(newTheme);
    setShowThemeSelector(false);
  };

  const handleLanguageChange = async (lang: Language) => {
    triggerHaptic('impactLight');
    await changeLanguage(lang);
    setShowLanguageSelector(false);
  };

  const handleSoundToggle = (value: boolean) => {
    triggerHaptic('selection');
    setSoundEnabled(value);
  };

  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    if (value) {
      triggerHaptic('selection');
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: theme.colors.border}]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          android_ripple={{color: theme.colors.primary, borderless: true}}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          {t('settings.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
            {t('settings.appearance')}
          </Text>

          {/* Theme */}
          <Pressable
            style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}
            onPress={() => {
              triggerHaptic('selection');
              setShowThemeSelector(true);
            }}
            android_ripple={{color: theme.colors.primary}}>
            <View style={styles.settingLeft}>
              <Icon name="color-palette" size={22} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
                {t('settings.theme')}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, {color: theme.colors.textSecondary}]}>
                {t(`themes.${themeName}`)}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
            {t('settings.language')}
          </Text>

          {/* Language */}
          <Pressable
            style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}
            onPress={() => {
              triggerHaptic('selection');
              setShowLanguageSelector(true);
            }}
            android_ripple={{color: theme.colors.primary}}>
            <View style={styles.settingLeft}>
              <Icon name="language" size={22} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
                {t('settings.language')}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, {color: theme.colors.textSecondary}]}>
                {currentLanguage.nativeName}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
            {t('settings.audio')}
          </Text>

          {/* Sound */}
          <View style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.settingLeft}>
              <Icon
                name={soundEnabled ? 'volume-high' : 'volume-mute'}
                size={22}
                color={theme.colors.primary}
              />
              <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
                {t('settings.sound')}
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={soundEnabled ? theme.colors.primary : theme.colors.textTertiary}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          {/* Haptics */}
          <View style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.settingLeft}>
              <Icon name="phone-portrait" size={22} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
                {t('settings.haptics')}
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={hapticsEnabled ? theme.colors.primary : theme.colors.textTertiary}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>
      </ScrollView>

      {/* Theme Selector Modal */}
      <Modal
        visible={showThemeSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeSelector(false)}>
        <Pressable
          style={[styles.modalOverlay, {backgroundColor: theme.colors.overlay}]}
          onPress={() => setShowThemeSelector(false)}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
              {t('settings.selectTheme')}
            </Text>
            {(['light', 'dark', 'solar', 'mono'] as ThemeName[]).map(themeOption => (
              <Pressable
                key={themeOption}
                style={[
                  styles.modalOption,
                  themeName === themeOption && {backgroundColor: theme.colors.backgroundSecondary},
                ]}
                onPress={() => handleThemeChange(themeOption)}
                android_ripple={{color: theme.colors.primary}}>
                <Text
                  style={[
                    styles.modalOptionText,
                    {color: theme.colors.text},
                    themeName === themeOption && {fontWeight: '700', color: theme.colors.primary},
                  ]}>
                  {t(`themes.${themeOption}`)}
                </Text>
                {themeName === themeOption && (
                  <Icon name="checkmark" size={22} color={theme.colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageSelector(false)}>
        <Pressable
          style={[styles.modalOverlay, {backgroundColor: theme.colors.overlay}]}
          onPress={() => setShowLanguageSelector(false)}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View
              style={[
                styles.modalContent,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
              ]}>
              <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
                {t('settings.selectLanguage')}
              </Text>
              {languages.map(lang => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.modalOption,
                    i18n.language === lang.code && {
                      backgroundColor: theme.colors.backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  android_ripple={{color: theme.colors.primary}}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: theme.colors.text},
                      i18n.language === lang.code && {
                        fontWeight: '700',
                        color: theme.colors.primary,
                      },
                    ]}>
                    {lang.nativeName}
                  </Text>
                  {i18n.language === lang.code && (
                    <Icon name="checkmark" size={22} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 15,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
