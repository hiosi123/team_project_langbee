import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './apis/auth/auth.module';
import { BoardModule } from './apis/board/board.module';
import { CommunityBoardModule } from './apis/communityBoard/communityBoard.module';
import { UserModule } from './apis/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as redisStore from 'cache-manager-redis-store';
import { CommentModule } from './apis/comment/comment.module';
import { FileModule } from './apis/file/file.module';
import { BoardImageModule } from './apis/boardImage/boardImage.module';
import { SaveModule } from './apis/save/save.module';
import { CurrentRegion } from './apis/currentRegion/entities/currentRegion.entity';
import { SearchModule } from './apis/search/search.module';
import { ReceiptModule } from './apis/receipt/receipt.module';
import { LikeCommentModule } from './apis/likeComment/likeComment.module';
import { LikeCommunityBoard } from './apis/likeCommunityBoard/entities/likeCommunity.entity';
import { CurrentRegionModule } from './apis/currentRegion/currentRegion.module';

@Module({
  imports: [
    AuthModule,
    BoardModule,
    BoardImageModule,
    UserModule,
    CommunityBoardModule,
    CommentModule,
    CurrentRegionModule,
    FileModule,
    SaveModule,
    SearchModule,
    ReceiptModule,
    LikeCommentModule,
    LikeCommunityBoard,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cors: {
        origin: 'http://127.0.0.1:5501',
        credentials: true,
      },
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: '10.127.112.4', //team04backend.shop
      // host: '172.27.48.3', //hiosi123.shop
      host: 'my-database', // localhost
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'teamproject',
      entities: [__dirname + '/apis/**/*.entity.*'], //각 경로 설정
      synchronize: true,
      logging: true,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://my-redis:6379', // localhost
      // url: 'redis://:oj4tpyWX@10.140.0.3:6379', //team04backend.shop
      // url: 'redis://:NvUF5Lwg@10.140.0.2:6379', //hiosi123.shop
      isGlobal: true,
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
