import { WeaviateService } from './weaviate.service';
import {
  Controller,
  Post,
  Get,
  UploadedFiles,
  UseInterceptors,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('weaviate')
export class WeaviateController {
  constructor(private readonly weaviateService: WeaviateService) {}

  @Get()
  async createSchema() {
    return await this.weaviateService.createSchema();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<any> {
    // Handle the uploaded images buffers here
    // images.forEach((image) => {
    //   console.log(image.buffer);
    // });

    const res = await this.weaviateService.importImages(images);
    console.log('res', res);

    // Return a success message
    return res;
  }

  @Post('search')
  @UseInterceptors(FilesInterceptor('images'))
  async searchImage(
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<any> {
    // Handle the uploaded images buffers here
    // images.forEach((image) => {
    //   console.log(image.buffer);
    // });

    const res = await this.weaviateService.searchImage(images[0]);
    console.log('res', res);

    // Return a success message
    return res;
  }

  @Get('search')
  async searchText(@Query() query): Promise<any> {
    if (query?.text) {
      return await this.weaviateService.search(query?.text);
    } else {
      throw new UnprocessableEntityException();
    }
  }
}
