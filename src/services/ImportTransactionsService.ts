import path from 'path';
import neatCsv from 'neat-csv';
import fs from 'fs';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import Type from '../enums/Type.enum';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const userAvatarFilePath = path.join(uploadConfig.directory, filename);

    const createTranscation = new CreateTransactionService();

    const data = await fs.promises.readFile(userAvatarFilePath);

    const transactions = (await neatCsv(data)) as Transaction[];

    const incomes = transactions.filter(
      transaction => transaction.type === Type.INCOME,
    );
    const outcomes = transactions.filter(
      transaction => transaction.type === Type.OUTCOME,
    );

    const promises = incomes.map(async transaction =>
      this.createTransaction(createTranscation, transaction),
    );

    await Promise.all(promises);

    outcomes.map(async transaction =>
      this.createTransaction(createTranscation, transaction),
    );

    return transactions;
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
