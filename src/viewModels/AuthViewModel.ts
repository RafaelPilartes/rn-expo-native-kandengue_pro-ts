import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUseCase } from '@/domain/usecases/authUseCase';
import type {
  LoginCredentials,
  RegisterData,
} from '@/core/interfaces/IAuthRepository';
import { useAuthStore } from '@/storage/store/useAuthStore';
import { DriverInterface } from '@/interfaces/IDriver';

const authUseCase = new AuthUseCase();

export function useAuthViewModel() {
  const queryClient = useQueryClient();
  const { driver, setDriver, logout: clearAuth } = useAuthStore();

  // 🧠 QUERY: motorista atual sincronizado com Firebase
  const {
    data: currentDriver,
    isLoading: isLoadingDriver,
    error: driverError,
    refetch: refetchDriver,
  } = useQuery<DriverInterface | null>({
    queryKey: ['currentDriver'],
    queryFn: () => authUseCase.getCurrentDriver(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    initialData: driver, // 🔹 inicializa com Zustand
  });

  // 🧠 Computed flag — evita query extra só pra isso
  const isAuthenticated = !!currentDriver;

  // 🔹 MUTATION: Registrar motorista
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authUseCase.register(data),
    onSuccess: ({ driver }) => {
      queryClient.setQueryData(['currentDriver'], driver);
    },
    onError: (error: Error) => {
      console.error('Erro no registro:', error);
    },
  });

  // 🔹 MUTATION: Login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authUseCase.login(credentials),
    onSuccess: ({ driver }) => {
      // 🔹 VERIFICAR: Se usuário é válido antes de sincronizar
      const isValid = driver.email_verified && driver.status === 'active';

      if (isValid) {
        setDriver(driver);
        queryClient.setQueryData(['currentDriver'], driver);
      }
    },
    onError: (error: Error) => {
      console.error('Erro no login:', error);
      // 🔹 LIMPAR: cache em caso de erro
      setDriver(null);
      queryClient.clear(); // limpa cache de autenticação
    },
  });

  // 🔹 MUTATION: Logout
  const logoutMutation = useMutation({
    mutationFn: () => authUseCase.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // limpa cache de autenticação
    },
    onError: (error: Error) => {
      console.error('Erro no logout:', error);
    },
  });

  // 🔹 MUTATION: Recuperação de senha
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authUseCase.forgotPassword(email),
    onError: (error: Error) => console.error('Erro na recuperação:', error),
  });

  // 🔹 MUTATION: Enviar verificação de email
  const sendEmailVerificationMutation = useMutation({
    mutationFn: () => authUseCase.sendEmailVerification(),
    onSuccess: () => console.log('Email de verificação enviado'),
    onError: (error: Error) =>
      console.error('Erro ao enviar verificação:', error),
  });

  // 🔹 MUTATION: Verificar email
  const checkEmailVerificationMutation = useMutation({
    mutationFn: () => authUseCase.checkEmailVerification(),
    onSuccess: async isVerified => {
      if (isVerified) await refetchDriver();
    },
    onError: (error: Error) => console.error('Erro ao verificar email:', error),
  });

  // 🔹 MUTATION: Recarregar motorista
  const reloadDriverMutation = useMutation({
    mutationFn: () => authUseCase.reloadDriver(),
    onSuccess: () => refetchDriver(),
    onError: (error: Error) => console.error('Erro ao recarregar:', error),
  });

  return {
    // Estado
    currentDriver,
    isAuthenticated,
    isLoading: isLoadingDriver,
    driverError,

    // Mutations
    register: registerMutation,
    login: loginMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,

    // 🔹 Mutations para email
    sendEmailVerification: sendEmailVerificationMutation,
    checkEmailVerification: checkEmailVerificationMutation,
    reloadDriver: reloadDriverMutation,

    // Utilitários
    refetchDriver,
  };
}
