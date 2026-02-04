/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770226574097 implements MigrationInterface {
    name = 'Migration1770226574097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "noOfLogin"`);
        await queryRunner.query(`ALTER TABLE "users_session" ADD "otp" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_session" DROP COLUMN "otp"`);
        await queryRunner.query(`ALTER TABLE "auth" ADD "noOfLogin" integer NOT NULL DEFAULT '0'`);
    }

}
