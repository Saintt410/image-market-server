import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeaviateModule } from './weaviate/weaviate.module';

@Module({
  imports: [WeaviateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
