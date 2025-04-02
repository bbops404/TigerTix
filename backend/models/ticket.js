const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ticket = sequelize.define(
    "Ticket",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
      },
      seat_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ticket_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      available_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_per_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "tickets",
      timestamps: true,
      hooks: {
        beforeCreate: (ticket) => {
          // Set available quantity equal to total quantity on creation
          ticket.available_quantity = ticket.total_quantity;
        },
      },
    }
  );

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.Event, { foreignKey: "event_id", as: "event" });
  };

  return Ticket;
};
