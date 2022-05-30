import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UsePointService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async use({ currentUser }) {
    const user = await this.userRepository.findOne({
      where: { email: currentUser.email },
    });

    if (user.points < 20) {
      throw new UnprocessableEntityException(
        "You don't have enough point to enter the chat room",
      );
    }

    return await this.userRepository.save({
      ...user,
      where: { email: currentUser.email },
      points: user.points - 20,
    });
  }
}
