import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Stored as comma-separated UUIDs by TypeORM simple-array.
   * Example: "uuid-a,uuid-b"
   */
  @Column('simple-array')
  participantIds: string[];

  @Column({ nullable: true })
  lastMessage: string;

  @Column({ nullable: true, type: 'timestamptz' })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
