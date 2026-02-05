import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    JoinColumn,
} from 'typeorm';
import { Credential } from './credential.entity';

export enum SuperAdminStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum UserType {
    SUPER_ADMIN = 'SUPER ADMIN',
}

@Entity()
export class SuperAdmin {
    @PrimaryGeneratedColumn()
    id: number;



    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;



    @Column({ name: 'phone_number', nullable: true })
    phoneNumber?: string;

    @Column({ name: 'country_code', nullable: true })
    countryCode?: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.SUPER_ADMIN })
    userType: UserType;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    otp?: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpireTime?: Date;

    @Column({ default: 'ACTIVE' })
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

    @Column({ type: 'json', nullable: true })
    address?: Record<string, any>;

    @Column({ type: 'json', nullable: true })
    coordinates?: { lat: number; lng: number };

    @OneToOne(() => Credential, credential => credential.user, { cascade: true })
    @JoinColumn() // SuperAdmin is the owner
    credential: Credential;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
