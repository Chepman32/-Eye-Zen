/**
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import App from './App';
import { name as appName } from './app.json';

Ionicons.loadFont().catch(() => {});

AppRegistry.registerComponent(appName, () => App);
