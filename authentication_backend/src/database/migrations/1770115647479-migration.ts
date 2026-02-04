/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770115647479 implements MigrationInterface {
    name = 'Migration1770115647479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth" ("userid" SERIAL NOT NULL, "username" character varying NOT NULL, "useremail" character varying NOT NULL, "userPassword" character varying NOT NULL, CONSTRAINT "UQ_b7d0374c39c28b6fe5184baf1e7" UNIQUE ("useremail"), CONSTRAINT "PK_539bbd044e649dc9d35ff7f8b35" PRIMARY KEY ("userid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auth"`);
    }

}
