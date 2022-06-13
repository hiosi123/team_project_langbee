import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findAll({ pageSize, page, userId, bestboardCount, myLang, newLang }) {
    if (page <= 0) {
      page = 1;
    }
    const userInfo = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (pageSize && page && myLang) {
      return await this.boardRepository.find({
        where: { writer: { myLang: myLang } },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['writer'],
      });
    }
    if (pageSize && page && newLang) {
      return await this.boardRepository.find({
        where: { writer: { newLang: newLang } },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['writer'],
      });
    }

    if (bestboardCount && userId) {
      return await this.boardRepository.find({
        order: {
          likes: 'DESC',
        },
        where: { writer: { newLang: userInfo.newLang, id: userId } },
        take: bestboardCount,
        relations: ['writer'],
      });
    }
    if (bestboardCount && myLang) {
      return await this.boardRepository.find({
        order: {
          likes: 'DESC',
        },
        where: { writer: { myLang: myLang } },
        take: bestboardCount,
        relations: ['writer'],
      });
    }

    if (bestboardCount && newLang) {
      return await this.boardRepository.find({
        order: {
          likes: 'DESC',
        },
        where: { writer: { newLang: newLang } },
        take: bestboardCount,
        relations: ['writer'],
      });
    }
    if (bestboardCount) {
      return await this.boardRepository.find({
        order: {
          likes: 'DESC',
        },
        take: bestboardCount,
        relations: ['writer'],
      });
    }

    if (pageSize && page && userId) {
      return await this.boardRepository.find({
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
      return await this.boardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['writer'],
      });
    }
    if (userId) {
      return await this.boardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        where: { writer: { id: userId } },
        relations: ['writer'],
      });
    }

    return await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.writer', 'user')
      .orderBy('board.createdat', 'DESC')
      .getMany();
  }

  async count({ userId }) {
    if (userId) {
      const allsaved = await this.boardRepository.count({
        where: {
          writer: userId,
        },
      });
      return allsaved;
    }

    return (await this.boardRepository.find()).length;
  }

  // async findAllId({ userId }) {
  //   return await this.boardRepository
  //     .createQueryBuilder('board')
  //     .where('board.writer.id = :id', { id: userId })
  //     .leftJoinAndSelect('board.writer', 'user')
  //     .orderBy('board.createdat', 'DESC')
  //     .getMany();
  // }

  async findMyBoards({ currentUser }) {
    return await this.boardRepository.find({
      where: { writer: currentUser },
    });
  }

  async findOne({ boardId }) {
    return await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['writer'],
    });
  }

  async create({ createBoardInput, currentUser }) {
    const writer = await this.userRepository.findOne({
      email: currentUser.email,
    });

    await this.userRepository.update(
      {
        email: currentUser.email,
      },
      {
        boardCounts: writer.boardCounts + 1,
      },
    );

    return await this.boardRepository.save({
      ...createBoardInput,
      writer: writer,
    });
  }

  async update({ currentUser, boardId, updateBoardInput }) {
    const oldBoard = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (oldBoard.writer.id !== currentUser.id) {
      throw new UnauthorizedException('업데이트 권한이 없습니다.');
    }
    const newBoard = { ...oldBoard, ...updateBoardInput };

    return await this.boardRepository.save(newBoard);
  }

  async delete({ currentUser, boardId }) {
    const findUserFromBoard = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['writer'],
    });
    if (findUserFromBoard.writer.id !== currentUser.id) {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }

    await this.boardRepository.update(
      {
        id: boardId,
      },
      {
        elasticdelete: 'dead',
      },
    );
    console.log(findUserFromBoard);

    await this.userRepository.update(
      {
        email: findUserFromBoard.writer.email,
      },
      {
        boardCounts: findUserFromBoard.writer.boardCounts - 1,
      },
    );
    const parent = await this.boardRepository.findOneOrFail(
      { id: boardId },
      { relations: ['comment'] },
    );

    const result = await this.boardRepository.softRemove(parent);

    return result ? true : false;
  }
}
