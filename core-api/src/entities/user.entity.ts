import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id_users: number;

  @Column()
  last_name: string;

  @Column()
  first_name: string;

  @Column({ unique: true })
  mail: string;

  @Column()
  password: string;
}