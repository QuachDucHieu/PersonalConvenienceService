import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @Column()
  senderId: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  fileUrl: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 