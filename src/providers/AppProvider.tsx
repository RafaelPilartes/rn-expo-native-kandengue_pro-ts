// src/providers/HomeProvider.ts
import { useState, useEffect, useCallback, use } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, MainTabParamList } from '@/types/navigation';
import { RideInterface } from '@/interfaces/IRide';
import { DriverInterface } from '@/interfaces/IDriver';
import { useDriversViewModel } from '@/viewModels/DriverViewModel';
import { useRidesViewModel } from '@/viewModels/RideViewModel';
import { useAuthStore } from '@/storage/store/useAuthStore';
import ROUTES from '@/constants/routes';
import { WalletInterface } from '@/interfaces/IWallet';
import { useWalletsViewModel } from '@/viewModels/WalletViewModel';
import { Alert } from 'react-native';
import { useVehiclesViewModel } from '@/viewModels/VehicleViewModel';
import { VehicleInterface } from '@/interfaces/IVehicle';

interface AppContextReturn {
  // Estado
  currentDriverData: DriverInterface | null;
  rides: RideInterface[] | undefined;
  ridesCount: number;
  wallet: WalletInterface | null;
  vehicle: VehicleInterface | null;

  // Ações
  handleIsOnline: () => Promise<void>;
  handleToDocuments: () => void;
  handleToWallet: () => void;
  handleDetailsRide: (ride: RideInterface) => void;
  handleNotifications: () => void;
  handleGoBack: () => void;

  // Navegação
  navigationHomeStack: NativeStackNavigationProp<HomeStackParamList>;
  navigationMainStack: NativeStackNavigationProp<MainTabParamList>;
}

export const useAppProvider = (): AppContextReturn => {
  // Navegação
  const navigationHomeStack =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const navigationMainStack =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  // Store e ViewModels
  const { driver, setCurrentMissionId } = useAuthStore();
  const { listenDriverRealtime, updateDriver } = useDriversViewModel();
  const { fetchAllVehiclesByField } = useVehiclesViewModel();

  const {
    listenAllByField: listenAllRidesByField,
    fetchRideById,
    fetchAllRidesByField,
  } = useRidesViewModel();
  const { listenByField: listenWalletByField } = useWalletsViewModel();

  // Estado local
  // Driver
  const [currentDriverData, setCurrentDriverData] =
    useState<DriverInterface | null>(driver);
  // Rides
  const [rides, setRides] = useState<RideInterface[]>();
  const [ridesCount, setRidesCount] = useState<number>(0);
  // Wallet
  const [wallet, setWallet] = useState<WalletInterface | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInterface | null>(null);

  // Listeners em tempo real
  // Driver
  // const refetchDriver = useCallback(async () => {}, [driver?.id]);

  useEffect(() => {
    if (!driver?.id) return;

    const unsubscribeDriver = listenDriverRealtime(
      driver.id,
      setCurrentDriverData,
    );

    return unsubscribeDriver;
  }, [driver?.id, listenDriverRealtime]);

  // Rides
  useEffect(() => {
    if (!driver?.id) return;

    console.log('🔹 Iniciando listener de corridas idle');
    const unsubscribeRides = listenAllRidesByField('status', 'idle', setRides);

    return unsubscribeRides;
  }, [
    driver?.id,
    // listenAllRidesByField
  ]);
  async function fetchDriverRides() {
    if (!driver?.id) return;

    const rides = await fetchAllRidesByField('driver.id' as any, driver.id);

    if (rides) {
      setRidesCount(rides.data.length);
    }
  }

  // Wallet
  useEffect(() => {
    if (!driver?.id) return;

    console.log('🔹 Iniciando listener de carteira');
    const unsubscribeWallet = listenWalletByField(
      'user.id' as any,
      driver.id,
      setWallet,
    );

    return unsubscribeWallet;
  }, [driver?.id]);

  // Veículos
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!driver?.id) return;
      await fetchAllVehiclesByField('user_id', driver?.id)
        .then(response => {
          // filter isDefault vehicles
          const filteredVehicles = response?.data.filter(
            (vehicle: VehicleInterface) => vehicle.isDefault,
          );

          if (filteredVehicles) {
            setVehicle(filteredVehicles[0]);
          }
        })
        .catch(error => {
          console.error('Erro ao buscar veículo:', error);
        });
    };
    fetchVehicle();
  }, [driver?.id]);

  useEffect(() => {
    fetchDriverRides();

    // console.log('🔹 Driver atualizado:', currentDriverData);
    // console.log('🔹 Rides atualizadas:', rides);
    // console.log('🔹 Wallet atualizada:', wallet);
  }, []);

  // Ações
  const handleIsOnline = useCallback(async (): Promise<void> => {
    if (!currentDriverData?.id) {
      console.error('❌ Driver ID não encontrado');
      return;
    }

    const newValue = !currentDriverData.is_online;

    try {
      console.log(`🔄 Alterando status online para: ${newValue}`);

      // Otimista update
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_online: newValue } : prev,
      );

      await updateDriver.mutateAsync({
        id: currentDriverData.id,
        driver: { is_online: newValue },
      });

      console.log('✅ Status online atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar status online:', error);

      // Revert otimista update em caso de erro
      setCurrentDriverData(prev =>
        prev ? { ...prev, is_online: !newValue } : prev,
      );
    }
  }, [currentDriverData, updateDriver]);

  const handleToDocuments = useCallback((): void => {
    navigationMainStack.navigate(ROUTES.MainTab.PROFILE, {
      screen: ROUTES.ProfileStack.DOCUMENTS,
    });
  }, [navigationMainStack]);

  const handleToWallet = useCallback((): void => {
    navigationMainStack.navigate(ROUTES.MainTab.PROFILE, {
      screen: ROUTES.ProfileStack.WALLET,
    });
  }, [navigationMainStack]);

  const handleDetailsRide = useCallback(
    async (ride: RideInterface): Promise<void> => {
      if (!ride.id) {
        console.error('❌ ID da corrida não encontrado');
        return;
      }
      if (!ride.pickup || !ride.dropoff) {
        Alert.alert(
          'Erro na localização',
          'A corrida selecionada não possui localização.',
          [{ text: 'OK' }],
        );
        return;
      }

      // Buscar corrida e verificar status
      const rideById = await fetchRideById(ride.id);

      if (!rideById) {
        Alert.alert(
          'Erro ao buscar corrida',
          'A corrida selecionada foi excluida ou não existe.',
          [{ text: 'OK' }],
        );
        return;
      }

      if (rideById.status !== 'idle') {
        if (rideById.driver?.id !== driver?.id) {
          Alert.alert(
            'Corrida indisponível',
            'A corrida selecionada já não está disponível.',
            [{ text: 'OK' }],
          );
          setCurrentMissionId(null);
          return;
        }
      }

      // Navegar para tela de detalhes
      navigationHomeStack.navigate(ROUTES.Rides.SUMMARY, {
        id: ride.id,
        location: {
          pickup: ride.pickup,
          dropoff: ride.dropoff,
        },
        receiver: {
          name: ride.details?.receiver.name ?? '',
          phone: ride.details?.receiver.phone ?? '',
        },
        article: {
          type: ride.details?.item.type ?? '',
          description: ride.details?.item.description ?? '',
        },
      });
    },
    [navigationHomeStack],
  );

  const handleNotifications = useCallback((): void => {
    navigationHomeStack.navigate(ROUTES.HomeStack.NOTIFICATIONS);
  }, [navigationMainStack]);

  const handleGoBack = useCallback((): void => {
    navigationMainStack.goBack();
  }, [navigationMainStack]);

  return {
    // Estado
    currentDriverData,
    rides,
    ridesCount,
    wallet,
    vehicle,

    // Ações
    handleIsOnline,
    handleToDocuments,
    handleToWallet,
    handleDetailsRide,
    handleNotifications,
    handleGoBack,

    // Navegação
    navigationHomeStack,
    navigationMainStack,
  };
};
