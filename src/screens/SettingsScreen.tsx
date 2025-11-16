import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
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

const SWITCH_TRACK_OFF = '#D1D5DB';
const SWITCH_THUMB_OFF = '#FFFFFF';
const ACTIVE_TRACK_ALPHA = 0.35;

const applyOpacity = (color: string, alpha: number) => {
  if (!color.startsWith('#')) {
    return color;
  }

  let hex = color.replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }

  if (hex.length !== 6) {
    return color;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const normalizedAlpha = Math.min(1, Math.max(0, alpha));

  return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha})`;
};

const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const {theme, themeName, setTheme} = useTheme();
  const {soundEnabled, hapticsEnabled, setSoundEnabled, setHapticsEnabled, triggerHaptic} =
    useSettings();

  const [expandedTheme, setExpandedTheme] = useState(false);
  const [expandedLanguage, setExpandedLanguage] = useState(false);

  const handleThemeChange = (newTheme: ThemeName) => {
    triggerHaptic('impactLight');
    setTheme(newTheme);
    setExpandedTheme(false);
  };

  const handleLanguageChange = async (lang: Language) => {
    triggerHaptic('impactLight');
    await changeLanguage(lang);
    setExpandedLanguage(false);
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

  const switchTrackColors = useMemo(
    () => ({
      false: SWITCH_TRACK_OFF,
      true: applyOpacity(theme.colors.primary, ACTIVE_TRACK_ALPHA),
    }),
    [theme.colors.primary],
  );

  const getThumbColor = (enabled: boolean) =>
    enabled ? theme.colors.primaryDark : SWITCH_THUMB_OFF;

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
          <View style={[styles.accordionContainer, {backgroundColor: theme.colors.surface}]}>
            <Pressable
              style={styles.settingItem}
              onPress={() => {
                triggerHaptic('selection');
                setExpandedTheme(!expandedTheme);
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
                <Icon
                  name={expandedTheme ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </View>
            </Pressable>

            {expandedTheme && (
              <View style={styles.accordionContent}>
                {(['light', 'dark', 'solar', 'mono'] as ThemeName[]).map(themeOption => (
                  <Pressable
                    key={themeOption}
                    style={[
                      styles.accordionOption,
                      themeName === themeOption && {
                        backgroundColor: theme.colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => handleThemeChange(themeOption)}
                    android_ripple={{color: theme.colors.primary}}>
                    <Text
                      style={[
                        styles.accordionOptionText,
                        {color: theme.colors.text},
                        themeName === themeOption && {
                          fontWeight: '700',
                          color: theme.colors.primary,
                        },
                      ]}>
                      {t(`themes.${themeOption}`)}
                    </Text>
                    {themeName === themeOption && (
                      <Icon name="checkmark" size={22} color={theme.colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
            {t('settings.language')}
          </Text>

          {/* Language */}
          <View style={[styles.accordionContainer, {backgroundColor: theme.colors.surface}]}>
            <Pressable
              style={styles.settingItem}
              onPress={() => {
                triggerHaptic('selection');
                setExpandedLanguage(!expandedLanguage);
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
                <Icon
                  name={expandedLanguage ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </View>
            </Pressable>

            {expandedLanguage && (
              <View style={styles.accordionContent}>
                {languages.map(lang => (
                  <Pressable
                    key={lang.code}
                    style={[
                      styles.accordionOption,
                      i18n.language === lang.code && {
                        backgroundColor: theme.colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                    android_ripple={{color: theme.colors.primary}}>
                    <Text
                      style={[
                        styles.accordionOptionText,
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
            )}
          </View>
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
              trackColor={switchTrackColors}
              thumbColor={getThumbColor(soundEnabled)}
              ios_backgroundColor={SWITCH_TRACK_OFF}
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
              trackColor={switchTrackColors}
              thumbColor={getThumbColor(hapticsEnabled)}
              ios_backgroundColor={SWITCH_TRACK_OFF}
            />
          </View>
        </View>
      </ScrollView>
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
  accordionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  accordionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  accordionOptionText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
