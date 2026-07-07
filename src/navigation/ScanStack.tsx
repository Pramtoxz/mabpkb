import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {ScanStackParamList} from './types';
import {Colors, Fonts} from '../constants';
import ScanIdentityScreen from '../screens/scan/ScanIdentityScreen';
import ScanNoMesinScreen from '../screens/scan/ScanNoMesinScreen';
import ScanBarcodeScreen from '../screens/scan/ScanBarcodeScreen';
import ReviewScreen from '../screens/scan/ReviewScreen';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.primary},
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: {fontFamily: Fonts.heading.semiBold, fontSize: 18},
      }}>
      <Stack.Screen
        name="ScanIdentity"
        component={ScanIdentityScreen}
        options={{title: 'Foto Identitas'}}
      />
      <Stack.Screen
        name="ScanNoMesin"
        component={ScanNoMesinScreen}
        options={{title: 'No Mesin'}}
      />
      <Stack.Screen
        name="ScanBarcode"
        component={ScanBarcodeScreen}
        options={{title: 'Barcode BPKB'}}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{title: 'Review & Kirim'}}
      />
    </Stack.Navigator>
  );
}
