import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MapStackParamList } from '@/types/navigation'
import MapScreen from '@/screens/Map'
import ROUTES from '@/constants/routes'

const Stack = createNativeStackNavigator<MapStackParamList>()

export default function MapRouter() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen name={ROUTES.MapStack.HISTORY} component={MapScreen} />
    </Stack.Navigator>
  )
}
