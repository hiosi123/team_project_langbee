import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board.entity';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],
  providers: [
    SearchResolver, //
    SearchService,
  ],
})
export class SearchModule {}
