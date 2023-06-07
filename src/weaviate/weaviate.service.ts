import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import axios from 'axios';
import config from 'src/config';
import client from 'src/utils/weaviate';
// import client from 'src/utils/weaviate';

@Injectable()
export class WeaviateService {
  async createSchema() {
    try {
      // const postData = {
      //   class: 'MultiModal',
      //   moduleConfig: {
      //     'multi2vec-clip': {
      //       imageFields: ['image'],
      //     },
      //   },
      //   vectorIndexType: 'hnsw',
      //   vectorizer: 'multi2vec-clip',
      //   properties: [
      //     {
      //       dataType: ['string'],
      //       name: 'filename',
      //     },
      //     {
      //       dataType: ['blob'],
      //       name: 'image',
      //     },
      //   ],
      // };

      // text
      const postData = {
        class: 'SearchText',
        moduleConfig: {
          'multi2vec-clip': {
            textFields: ['text'],
          },
        },
        vectorIndexType: 'hnsw',
        vectorizer: 'multi2vec-clip',
        properties: [
          {
            dataType: ['string'],
            name: 'text',
          },
        ],
      };

      const res = await fetch(config.weaviate.dockerUrl + '/v1/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          return data;
        })
        .catch((error) => {
          console.error('Error:', error);
          throw error;
        });

      console.log('schema res', res);
      return res;
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException(err);
    }
  }

  async importImages(images?: Express.Multer.File[]) {
    try {
      const results = images?.map(async (image) => {
        const postData = {
          class: 'MultiModal',
          properties: {
            filename: image.filename,
            image: image.buffer.toString('base64'),
          },
        };

        const res = await fetch(config.weaviate.dockerUrl + '/v1/objects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log('Success:', data);
            return data;
          })
          .catch((error) => {
            console.error('Error:', error);
            throw error;
          });
        // console.log('res', res);
        return res;
      });

      //   console.log('results', results);

      return await Promise.all(results);
    } catch (err) {
      console.log('importImages error', err);
      throw new UnprocessableEntityException(err);
    }
  }

  async importSearchText(text: string) {
    try {
      const postData = {
        class: 'SearchText',
        properties: {
          text,
        },
      };

      const res = await fetch(config.weaviate.dockerUrl + '/v1/objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log('Success:', data);
          return data;
        })
        .catch((error) => {
          console.error('Error:', error);
          throw error;
        });
      // console.log('res', res);
      return res;
    } catch (err) {
      console.log('importImages error', err);
      throw new UnprocessableEntityException(err);
    }
  }

  async searchImage(image: Express.Multer.File) {
    try {
      const res = await client.graphql
        .get()
        .withClassName('MultiModal')
        .withFields('filename image _additional{ certainty id }')
        .withNearImage({
          image: image.buffer.toString('base64'),
        })
        .withLimit(10)
        .do();

      return res;
    } catch (err) {
      console.log('seachImage error', err);
      throw new UnprocessableEntityException(err);
    }
  }

  async suggestSearchText(vector: number[]) {
    return await client.graphql
      .get()
      .withClassName('SearchText')
      .withFields('text')
      .withNearVector({
        vector,
      })
      .do();
  }

  async search(searchTerm: string) {
    let suggestions: any = null;

    const searchTextRes = await client.graphql
      .get()
      .withClassName('SearchText')
      .withFields('text')
      .withNearText({
        concepts: [searchTerm],
      })
      .do();

    suggestions = searchTextRes?.data?.Get?.SearchText?.map(
      (result) => result?.text,
    );
    if (!suggestions.includes(searchTerm)) {
      const savedSearchtext = await this.importSearchText(searchTerm);
    }

    const res = await client.graphql
      .get()
      .withClassName('MultiModal')
      .withNearText({ concepts: [searchTerm] })
      .withFields('filename image _additional{ certainty id }')
      .withLimit(10)
      .do();

    return {
      images: res?.data?.Get?.MultiModal,
      suggestions,
    };
  }
}
