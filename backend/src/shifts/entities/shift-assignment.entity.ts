import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm"
import { Shift } from "./shift.entity"
import { User } from "../../users/entities/user.entity"

export enum AssignmentStatus {
  SCHEDULED = "scheduled",
  ABSENT = "absent",
}

@Entity("shift_assignments")
@Unique("uq_sa_user_shift_date", ["userId", "shiftId", "workDate"])
@Index("idx_sa_work_date", ["workDate"])
@Index("idx_sa_user_date", ["userId", "workDate"])
@Index("idx_sa_shift_date", ["shiftId", "workDate"])
export class ShiftAssignment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "user_id", type: "int" })
  userId: number

  @Column({ name: "shift_id", type: "int" })
  shiftId: number

  @Column({ name: "work_date", type: "date" })
  workDate: string

  @Column({
    type: "enum",
    enum: AssignmentStatus,
    default: AssignmentStatus.SCHEDULED,
  })
  status: AssignmentStatus

  @Column({ type: "text", nullable: true })
  note?: string

  @Column({ name: "assigned_by", type: "int" })
  assignedBy: number

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date

  // ─── RELATIONS ────────────────────────────────────────────────

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(() => Shift, { eager: true })
  @JoinColumn({ name: "shift_id" })
  shift: Shift

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assignedByUser: User
}
