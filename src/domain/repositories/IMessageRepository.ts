import { Message } from "../entities/Message";

export interface IMessageRepository {
  create(message: Message): Promise<Message>;
  listConversation(userA: string, userB: string): Promise<Message[]>;
}