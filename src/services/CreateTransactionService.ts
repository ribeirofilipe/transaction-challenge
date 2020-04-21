// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import Type from '../enums/Type.enum';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (!type.includes(Type.INCOME) && !type.includes(Type.OUTCOME)) {
      throw new AppError('Type accepts only income or outcome');
    }

    const balance = await transactionsRepository.getBalance();

    if (type === Type.OUTCOME && value > balance.total) {
      throw new AppError("You don't have enough money");
    }

    const categoriesRepository = getRepository(Category);

    let categoryExisting = await categoriesRepository.findOne({
      title: category,
    });

    if (!categoryExisting) {
      categoryExisting = await categoriesRepository.save({ title: category });
    }

    const transaction = await transactionsRepository.save({
      title,
      value,
      type,
      category_id: categoryExisting.id,
    });

    return transaction;
  }
}

export default CreateTransactionService;
