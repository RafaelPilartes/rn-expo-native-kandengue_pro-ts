// viewModels/UserViewModel.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserEntity } from '@/core/entities/User';
import type { ListResponseType } from '@/interfaces/IApiResponse';
import { firebaseCollections } from '@/constants/firebaseCollections';
import { UserUseCase } from '@/domain/usecases/usersUseCase';

const userUseCase = new UserUseCase();

export function useUsersViewModel(
  limit?: number,
  offset?: number,
  searchTerm?: string,
  filters?: Partial<UserEntity>,
) {
  const queryClient = useQueryClient();

  const filtersKey = filters ? JSON.stringify(filters) : '';

  /** 🔹 Buscar lista de usuários */
  const {
    data: usersResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<ListResponseType<UserEntity[]>>({
    queryKey: [
      firebaseCollections.users.root,
      limit,
      offset,
      searchTerm,
      filtersKey,
    ],
    queryFn: () => userUseCase.getAll(limit, offset, searchTerm, filters),
    staleTime: 1000 * 60, // cache 1min
  });

  /** 🔹 Buscar lista de usuários por field */
  const fetchAllUsersByField = async (
    field: string,
    value: any,
    limit?: number,
    offset?: number,
  ) => {
    try {
      return await userUseCase.getAllByField(field, value, limit, offset);
    } catch (err) {
      console.error('Erro ao buscar usuários por campo:', err);
      return null;
    }
  };

  /** 🔹 Criar usuário */
  const createUser = useMutation({
    mutationFn: (user: Omit<UserEntity, 'id'>) => userUseCase.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.users.root],
      });
    },
  });

  /** 🔹 Atualizar usuário */
  const updateUser = useMutation({
    mutationFn: ({ id, user }: { id: string; user: Partial<UserEntity> }) =>
      userUseCase.update(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.users.root],
      });
    },
  });

  /** 🔹 Deletar usuário */
  const deleteUser = useMutation({
    mutationFn: (id: string) => userUseCase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.users.root],
      });
    },
  });

  /** 🔹 Buscar usuário único (on-demand) */
  const fetchUserById = async (id: string) => {
    try {
      return await userUseCase.getById(id);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return null;
    }
  };

  /** 🔹 Buscar usuário único (on-demand) */
  const fetchUserByEmail = async (email: string) => {
    try {
      return await userUseCase.getByEmail(email);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return null;
    }
  };

  /** 🔹 Buscar user por field */
  const fetchOneUserByField = async (
    field: keyof UserEntity,
    value: string,
  ) => {
    try {
      return await userUseCase.getOneByField(field, value);
    } catch (err) {
      console.error('Erro ao buscar usuario por campo:', err);
      return null;
    }
  };

  return {
    users: usersResponse?.data ?? [],
    pagination: usersResponse?.pagination,
    isLoadingUsers: loading,
    error,
    refresh: refetch,

    fetchAllUsersByField,
    fetchOneUserByField,
    fetchUserByEmail,

    createUser,
    updateUser,
    deleteUser,
    fetchUserById,
  };
}
