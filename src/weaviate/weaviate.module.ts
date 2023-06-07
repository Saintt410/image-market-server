import { Module } from '@nestjs/common';
import { WeaviateService } from './weaviate.service';
import { WeaviateController } from './weaviate.controller';

@Module({
  controllers: [WeaviateController],
  providers: [WeaviateService]
})
export class WeaviateModule {}
