import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { CustomPlace } from './places';
import { RideFareInterface } from '@/interfaces/IRideFare';

// Tipos para cada roteador
export type AuthStackParamList = {
  LangScreen: undefined;
  OnboardingScreen: undefined;
  PermissionsScreen: undefined;
  WelcomeScreen: undefined;
  SignInScreen: undefined;
  SignUpScreen: undefined;

  CreatePasswordScreen: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  SmsVerificationScreen: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    verificationId: string;
  };
  VerificationSuccessScreen: undefined;
  ForgotPasswordScreen: undefined;
  ForgotPasswordSuccessScreen: undefined;
  NewPasswordScreen: undefined;
  NewPasswordSuccessScreen: undefined;

  PinScreen: undefined;
  PinSetupScreen: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MapTab: undefined;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  NotificationsScreen: undefined;

  RideSummaryScreen: {
    id: string;
    location: {
      pickup: CustomPlace;
      dropoff: CustomPlace;
    };
    receiver: {
      name: string;
      phone: string;
    };
    article: {
      type: string;
      description: string;
    };
  };
  RideFinishedScreen: {
    details: {
      rideId?: string;
      pickup: CustomPlace;
      dropoff: CustomPlace;
      distance: string;
      fare: RideFareInterface;
    };
  };
};

export type HistoryStackParamList = {
  HistoryScreen: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  VehiclesScreen: undefined;
  DocumentsScreen: undefined;
  WalletScreen: undefined;
  EditProfileScreen: undefined;
  AboutScreen: undefined;
  FaqScreen: undefined;
  ComplaintsScreen: undefined;
  HelpScreen: undefined;
  PrivacyPolicyScreen: undefined;
  TermsConditionsScreen: undefined;
};

// Merge de todos os tipos
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
