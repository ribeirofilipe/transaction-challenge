// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
}

class CreateTransactionService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const categoryAlreadyExisting = await categoriesRepository.findOne({
      where: { title },
    });

    if (categoryAlreadyExisting) {
      throw new AppError('Category already exists');
    }

    const category = await categoriesRepository.save({ title });

    return category;
  }
}

export default CreateTransactionService;
