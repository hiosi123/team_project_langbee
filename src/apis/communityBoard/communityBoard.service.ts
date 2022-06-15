import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CommunityBoard } from './entities/communityBoard.entity';

@Injectable()
export class CommunityBoardService {
  constructor(
    @InjectRepository(CommunityBoard)
    private readonly communityBoardRepository: Repository<CommunityBoard>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll({ pageSize, page, userId }) {
    if (page <= 0) {
      page = 1;
    }
    if (pageSize && page && userId) {
      return await this.communityBoardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        where: { writer: { id: userId } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['writer'],
      });
    }

    if (pageSize && page) {
      return await this.communityBoardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['writer'],
      });
    }

    if (userId) {
      return await this.communityBoardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        where: { writer: { id: userId } },
        relations: ['writer'],
      });
    }

    return await this.communityBoardRepository
      .createQueryBuilder('communityboard')
      .leftJoinAndSelect('communityboard.writer', 'user')
      .orderBy('communityboard.createdat', 'DESC')
      .getMany();
  }

  async findAllId({ userId }) {
    return await this.communityBoardRepository
      .createQueryBuilder('communityboard')
      .where('communityboard.writer.id = :id', { id: userId })
      .leftJoinAndSelect('communityboard.writer', 'user')
      .orderBy('communityboard.createdat', 'DESC')
      .getMany();
  }

  async findMyCommunity({ currentUser }) {
    return await this.communityBoardRepository.find({
      where: {
        writer: {
          id: currentUser.id,
        },
      },
    });
  }

  async findOne({ communityBoardId }) {
    return this.communityBoardRepository.findOne({
      where: { id: communityBoardId },
      relations: ['writer'],
    });
  }

  async create({ createCommunityBoardInput, currentUser }) {
    const writer = await this.userRepository.findOne({
      email: currentUser.email,
    });

    await this.userRepository.findOne({
      email: currentUser.email,
    });

    await this.userRepository.update(
      {
        email: currentUser.email,
      },
      {
        communityBoardCounts: writer.communityBoardCounts + 1,
      },
    );

    return await this.communityBoardRepository.save({
      ...createCommunityBoardInput,
      writer: writer,
    });
  }

  async update({ currentUser, communityBoardId, updateCommunityBoardInput }) {
    const oldBoard = await this.communityBoardRepository.findOne({
      where: { id: communityBoardId },
      relations: ['writer'],
    });
    if (oldBoard.writer.id !== currentUser.id) {
      throw new UnauthorizedException('수정 권한이 없습니다.');
    }
    const newBoard = { ...oldBoard, ...updateCommunityBoardInput };

    return await this.communityBoardRepository.save(newBoard);
  }

  async delete({ currentUser, communityBoardId }) {
    const findUserFromBoard = await this.communityBoardRepository.findOne({
      where: {
        id: communityBoardId,
      },
      relations: ['writer'],
    });

    if (findUserFromBoard.writer.id !== currentUser.id) {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }

    await this.userRepository.update(
      {
        email: findUserFromBoard.writer.email,
      },
      {
        communityBoardCounts: findUserFromBoard.writer.communityBoardCounts - 1,
      },
    );
    const result = await this.communityBoardRepository.softDelete({
      id: communityBoardId,
    });
    return result.affected ? true : false;
  }
}
