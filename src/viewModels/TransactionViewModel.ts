// viewModels/TransactionViewModel.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionUseCase } from '@/domain/usecases/transactionUseCase';
import { TransactionEntity } from '@/core/entities/Transaction';
import type { ListResponseType } from '@/interfaces/IApiResponse';
import { firebaseCollections } from '@/constants/firebaseCollections';
import { WalletUseCase } from '@/domain/usecases/walletUseCase';
import type { TransactionType, TransactionCategoryType } from '@/types/enum';

const transactionUseCase = new TransactionUseCase();
const walletUseCase = new WalletUseCase();

export function useTransactionsViewModel(
  limit?: number,
  offset?: number,
  searchTerm?: string,
  filters?: Partial<TransactionEntity>,
) {
  const queryClient = useQueryClient();

  const filtersKey = filters ? JSON.stringify(filters) : '';

  /** 🔹 Buscar lista de transações */
  const {
    data: transactionsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<ListResponseType<TransactionEntity[]>>({
    queryKey: [
      firebaseCollections.transactions.root,
      limit,
      offset,
      searchTerm,
      filtersKey,
    ],
    queryFn: () =>
      transactionUseCase.getAll(limit, offset, searchTerm, filters),
    staleTime: 1000 * 60, // cache 1min
  });

  /** 🔹 Buscar lista de transações por field */
  const fetchAllTransactionsByField = async (
    field: keyof TransactionEntity,
    value: any,
    limit?: number,
    offset?: number,
  ) => {
    try {
      return await transactionUseCase.getAllByField(
        field,
        value,
        limit,
        offset,
      );
    } catch (err) {
      console.error('Erro ao buscar transações por campo:', err);
      return null;
    }
  };

  /** 🔹 Criar transação */
  const createTransaction = useMutation({
    mutationFn: (transaction: Omit<TransactionEntity, 'id'>) =>
      transactionUseCase.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.transactions.root],
      });
    },
  });

  /** 🔹 Atualizar transação */
  const updateTransaction = useMutation({
    mutationFn: ({
      id,
      transaction,
    }: {
      id: string;
      transaction: Partial<TransactionEntity>;
    }) => transactionUseCase.update(id, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.transactions.root],
      });
    },
  });

  /** 🔹 Deletar transação */
  const deleteTransaction = useMutation({
    mutationFn: (id: string) => transactionUseCase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [firebaseCollections.transactions.root],
      });
    },
  });

  /** 🔹 Buscar transação único (on-demand) */
  const fetchTransactionById = async (id: string) => {
    try {
      return await transactionUseCase.getById(id);
    } catch (err) {
      console.error('Erro ao buscar transação:', err);
      return null;
    }
  };

  /** 🔹 Função composta: atualizar saldo + registrar transação */
  const updateBalanceAndAddTransaction = useMutation({
    mutationFn: async ({
      walletId,
      amount,
      type,
      category,
      description,
    }: {
      walletId: string;
      amount: number;
      type: TransactionType;
      category: TransactionCategoryType;
      description?: string;
    }) => {
      // 1. Buscar carteira atual
      const wallet = await walletUseCase.getById(walletId);
      if (!wallet) throw new Error('Transação não encontrada');

      // 2. Calcular novo saldo
      const newBalance =
        type === 'credit' ? wallet.balance + amount : wallet.balance - amount;

      // 3. Atualiza saldo da carteira
      const updatedWallet = await walletUseCase.update(walletId, {
        balance: newBalance,
      });

      // 4. Cria a transação correspondente
      const transaction: Omit<TransactionEntity, 'id'> = {
        wallet_id: walletId,
        amount,
        type,
        category,
        description: description ?? '',
      };

      const createdTransaction = await transactionUseCase.create(transaction);

      return { updatedWallet, createdTransaction };
    },
  });

  /** 🔹 Buscar transaction por field */
  const fetchOneTransactionByField = async (
    field: keyof TransactionEntity,
    value: string,
  ) => {
    try {
      return await transactionUseCase.getOneByField(field, value);
    } catch (err) {
      console.error('Erro ao buscar transação por campo:', err);
      return null;
    }
  };

  return {
    transactions: transactionsResponse?.data ?? [],
    pagination: transactionsResponse?.pagination,
    loading,
    error,
    refresh: refetch,

    fetchAllTransactionsByField,
    fetchOneTransactionByField,

    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactionById,

    updateBalanceAndAddTransaction,
  };
}
