import { SearchRequest } from 'src/kernel/common';

export class CategorySearchRequestPayload extends SearchRequest {
  name?: string;
}
