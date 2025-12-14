import { Friendship } from "../entities/Friendship";

export interface IFriendshipRepository {
  create(friendship: Friendship): Promise<Friendship>;
  findByUsers(userA: string, userB: string): Promise<Friendship | null>;
  findById(id: string): Promise<Friendship | null>;
  update(friendship: Friendship): Promise<Friendship>;
}