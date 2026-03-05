import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('praticiens')
export class Praticien {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
    lastName: string;

    @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
    firstName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    mail: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    city: string;

    @Column({ name: 'postal_code', type: 'int', nullable: true })
    postalCode: number;

    @Column({ name: 'phone_number', type: 'varchar', length: 15, nullable: true })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    schedules: string;

    @Column({ type: 'int', nullable: true })
    price: number;
}
