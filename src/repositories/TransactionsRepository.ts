import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    const income = this.reduce(transactions, 'income');
    const outcome = this.reduce(transactions, 'outcome');
    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  private reduce(transactions: Transaction[], type: string): number {
    return transactions
      .filter(transaction => transaction.type === type)
      .reduce((Acumulador, valorAtual) => {
        return Acumulador + valorAtual.value;
      }, 0);
  }
}

export default TransactionsRepository;
