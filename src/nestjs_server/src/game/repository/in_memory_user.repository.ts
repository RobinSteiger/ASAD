import { Injectable } from '@nestjs/common';
import { IUserRepository, RoundSnapshot, User } from '../game/game.interface';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();
  private rounds = new Map<string, RoundSnapshot>();

  async findUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) ?? null;
  }

  async saveBalance(userId: string, balance: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) user.balance = balance;
  }

  async saveRoundSnapshot(snapshot: RoundSnapshot): Promise<void> {
    // Idempotent : on n'écrase pas un snapshot déjà existant
    if (!this.rounds.has(snapshot.roundId)) {
      this.rounds.set(snapshot.roundId, { ...snapshot });
    }
  }

  async markRoundResolved(roundId: string): Promise<void> {
    const round = this.rounds.get(roundId);
    if (round) round.resolvedAt = new Date();
  }

  async getUnresolvedRound(): Promise<RoundSnapshot | null> {
    for (const round of this.rounds.values()) {
      if (round.resolvedAt === null) return round;
    }
    return null;
  }

  // Méthode interne utilisée par GameService lors du registerUser
  registerUser(user: User): void {
    this.users.set(user.id, user);
  }

  getAllUsers() {
    return this.users;
  }
}