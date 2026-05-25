import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { IUserRepository, RoundSnapshot, User } from '../game/game.interface';

// Shape of the JSON file
interface GameStorage {
    users: User[];
    rounds: RoundSnapshot[];
}

@Injectable()
export class JsonUserRepository implements IUserRepository {
    // File where we save the game data
    private readonly filePath = join(process.cwd(), 'data', 'game-storage.json');
    // Data kept in memory while the server is running
    private storage: GameStorage = {
        users: [],
        rounds: [],
    };
    constructor() {
        // Load old data when the server starts
        this.load();
    }

    // Find one user with his id
    async findUserById(userId: string): Promise<User | null> {
        return this.storage.users.find((user) => user.id === userId) ?? null;
    }

    // Return all saved users
    async findAllUsers(): Promise<User[]> {
        return this.storage.users;
    }

    // Save a new user or update an existing user
    async saveUser(user: User): Promise<void> {
        const index = this.storage.users.findIndex((savedUser) => savedUser.id === user.id);
        if (index === -1) {
            // User does not exist yet, so we add him
            this.storage.users.push(user);
        } else {
            // User already exists, so we update him
            this.storage.users[index] = user;
        }
        this.persist();
    }

    // Save the new balance of a user
    async saveBalance(userId: string, balance: number): Promise<void> {
        const user = await this.findUserById(userId);
        if (!user) {
            return;
        }
        user.balance = balance;
        this.persist();
    }

    // Save the state of one round before paying gains
    async saveRoundSnapshot(snapshot: RoundSnapshot): Promise<void> {
        const index = this.storage.rounds.findIndex((round) => round.roundId === snapshot.roundId);
        if (index === -1) {
            // Round does not exist yet, so we add it
            this.storage.rounds.push(snapshot);
        } else {
            // Round already exists, so we update it
            this.storage.rounds[index] = snapshot;
        }
        this.persist();
    }

    // Mark a round as finished
    async markRoundResolved(roundId: string): Promise<void> {
        const round = this.storage.rounds.find((savedRound) => savedRound.roundId === roundId);
        if (!round) {
            return;
        }
        round.resolvedAt = new Date();
        this.persist();
    }

    // Find a round that was saved but not finished
    async getUnresolvedRound(): Promise<RoundSnapshot | null> {
        return this.storage.rounds.find((round) => round.resolvedAt === null) ?? null;
    }

    // Load data from the JSON file
    private load(): void {
        if (!existsSync(this.filePath)) {
            // If the file does not exist, we create it
            this.persist();
            return;
        }
        const content = readFileSync(this.filePath, 'utf-8');
        this.storage = JSON.parse(content) as GameStorage;
    }

    // Write the data into the JSON file
    private persist(): void {
        const directory = dirname(this.filePath);
        if (!existsSync(directory)) {
            // Create the data folder if it does not exist
            mkdirSync(directory, { recursive: true });
        }
        const temporaryFilePath = `${this.filePath}.tmp`;
        // First write in a temporary file
        writeFileSync(temporaryFilePath, JSON.stringify(this.storage, null, 2));
        // Then replace the real file
        renameSync(temporaryFilePath, this.filePath);
    }
}