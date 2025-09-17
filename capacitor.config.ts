import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.temple.agent',
  appName: 'TempleAgent',
  webDir: 'www',
  android: {
    minSdkVersion: 21,  // Asegúrate de que la versión mínima del SDK es suficiente
    cordova: {
      preferences: {
        SplashScreen: 'none',  // Opcional: ajusta si tienes splash screen
        ScrollEnabled: 'true', // Asegúrate de que el desplazamiento sea habilitado
        // Añadir soporte para animaciones y transiciones si se necesita
      }
    },
    backgroundColor: '#ffffff', // Opcional: puedes definir el color de fondo de la app
  },
};

export default config;
