import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {BatchStackParamList} from './types';
import {Colors, Fonts} from '../constants';
import TrackStatusScreen from '../screens/track/TrackStatusScreen';

const Stack = createNativeStackNavigator<BatchStackParamList>();

export default function BatchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.primary},
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: {fontFamily: Fonts.heading.semiBold, fontSize: 18},
      }}>
      <Stack.Screen
        name="TrackStatus"
        component={TrackStatusScreen}
        options={{title: 'Status Proses'}}
      />
    </Stack.Navigator>
  );
}
