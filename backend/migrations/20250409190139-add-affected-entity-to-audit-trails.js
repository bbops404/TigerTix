'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the ENUM type first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_audit_trails_affected_entity') THEN
          CREATE TYPE "enum_audit_trails_affected_entity" AS ENUM ('Reservation', 'User', 'Event', 'Report');
        END IF;
      END $$;
    `);

    // Add the column using the ENUM type
    await queryInterface.addColumn('audit_trails', 'affected_entity', {
      type: Sequelize.ENUM('Reservation', 'User', 'Event', 'Report'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column
    await queryInterface.removeColumn('audit_trails', 'affected_entity');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_audit_trails_affected_entity";
    `);
  },
};