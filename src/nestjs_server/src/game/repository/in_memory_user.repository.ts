import { Injectable } from '@nestjs/common';
import { IUserRepository, RoundSnapshot, User } from '../game/game.interface';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {

  // Store users in memory
  private users = new Map<string, User>();
  // Store rounds in memory
  private rounds = new Map<string, RoundSnapshot>();

  // Find one user with his id
  async findUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) ?? null;
  }

  // Return all users
  async findAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Save or update one user
  async saveUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  // Save the balance of one user
  async saveBalance(userId: string, balance: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      return;
    }
    user.balance = balance;
  }

  // Save the snapshot of one round
  async saveRoundSnapshot(snapshot: RoundSnapshot): Promise<void> {
    // Avoid duplicate snapshots
    if (!this.rounds.has(snapshot.roundId)) {
      this.rounds.set(snapshot.roundId, { ...snapshot });
    }
  }

  // Mark one round as resolved
  async markRoundResolved(roundId: string): Promise<void> {
    const round = this.rounds.get(roundId);
    if (!round) {
      return;
    }
    round.resolvedAt = new Date();
  }

  // Return one unresolved round after a crash
  async getUnresolvedRound(): Promise<RoundSnapshot | null> {
    for (const round of this.rounds.values()) {
      if (round.resolvedAt === null) {
        return round;
      }
    }
    return null;
  }

  // Internal method used by GameService during registration
  registerUser(user: User): void {
    this.users.set(user.id, user);
  }

  // Return all users map
  getAllUsers() {
    return this.users;
  }
}