import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770209383672 implements MigrationInterface {
    name = 'Migration1770209383672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth" ("userid" SERIAL NOT NULL, "username" character varying NOT NULL, "useremail" character varying NOT NULL, "userPassword" character varying NOT NULL, "noOfLogin" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_b7d0374c39c28b6fe5184baf1e7" UNIQUE ("useremail"), CONSTRAINT "PK_539bbd044e649dc9d35ff7f8b35" PRIMARY KEY ("userid"))`);
        await queryRunner.query(`CREATE TABLE "users_session" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "sessionId" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8010a1ca1f72425183803cc5e44" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users_session"`);
        await queryRunner.query(`DROP TABLE "auth"`);
    }

}
