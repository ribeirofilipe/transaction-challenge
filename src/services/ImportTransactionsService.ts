import csv from 'csvtojson';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import Type from '../enums/Type.enum';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const transactions = (await csv().fromFile(
      `${uploadConfig.directory}/${filename}`,
    )) as Transaction[];

    const incomes = this.getTypes(transactions, Type.INCOME);

    const outcomes = this.getTypes(transactions, Type.OUTCOME);

    await Promise.all(
      incomes.map(async transaction => {
        return this.createTransaction(createTransaction, transaction);
      }),
    );

    await Promise.all(
      outcomes.map(async transaction => {
        return this.createTransaction(createTransaction, transaction);
      }),
    );

    return transactions;
  }

  private getTypes(transactions: Transaction[], type: Type): Transaction[] {
    return transactions.filter(transaction => transaction.type === type);
  }

  private async createTransaction(
    createTransaction: CreateTransactionService,
    transaction: Transaction,
  ): Promise<void> {
    await createTransaction.execute({
      title: transaction.title,
      type: transaction.type,
      category: transaction.category,
      value: transaction.value,
    });
  }
}

export default ImportTransactionsService;
