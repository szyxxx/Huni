import Constants, { ExecutionEnvironment } from 'expo-constants';

/** expo-notifications' remote-push APIs throw on import/call in Expo Go on SDK 53+; gate on this first. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
