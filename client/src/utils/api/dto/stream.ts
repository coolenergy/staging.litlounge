import { Entity } from "./entity";
import { User } from "./user";

type Conversation = Entity;

type Message = Entity & {
  conversationId: string;
  type: string;
  fileId: string;
  text: string;
  senderId: string;
  senderSource: string;
  meta: any;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  senderInfo?: User;
};

export type { Conversation, Message };
