import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Bid } from './bid.entity';

@Entity('bid_messages')
export class BidMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bidId: string;

  @ManyToOne(() => Bid, (b) => b.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bidId' })
  bid: Bid;

  @Column()
  senderId: string;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
