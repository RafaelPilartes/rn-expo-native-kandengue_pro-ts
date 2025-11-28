import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/types/navigation';
import HomeScreen from '@/screens/Main/Home';
import ROUTES from '@/constants/routes';
import RideFinishedScreen from '@/screens/Rides/RideFinished';
import RideSummaryScreen from '@/screens/Rides/RideSummary';
import NotificationsScreen from '@/screens/Main/Notifications';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeRouter() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name={ROUTES.HomeStack.HOME} component={HomeScreen} />

      <Stack.Screen
        name={ROUTES.HomeStack.NOTIFICATIONS}
        component={NotificationsScreen}
      />

      {/* RideStack fora do Tab */}
      <Stack.Screen name={ROUTES.Rides.SUMMARY} component={RideSummaryScreen} />
      <Stack.Screen
        name={ROUTES.Rides.FINISHED}
        component={RideFinishedScreen}
      />
    </Stack.Navigator>
  );
}
