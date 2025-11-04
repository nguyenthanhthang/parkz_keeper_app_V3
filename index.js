import { registerRootComponent } from 'expo';
// Import flash theme TRƯỚC App để đảm bảo theme được set sớm nhất
import './src/lib/flash-theme';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

