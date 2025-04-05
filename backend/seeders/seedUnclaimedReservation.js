const db = require("../models");

async function seedUnclaimedReservations() {
    try {
        await db.sequelize.authenticate();
        console.log("Database connected successfully!");

        const eventId = "ae37d828-caf5-49cd-aefe-102dfa47044f"; // Event ID for "Sample Event"
        const ticketId = "fa1d1c92-7317-43e3-adb9-29ef50790c23"; // Ticket ID for "VIP"
        const claimingSlotId = "60e2c125-7fbd-4a4d-835a-835f970b19f6"; // Claiming slot ID
        const userIds = [
            "64602232-53ad-4a2f-ad9a-b642d4aac816", // User ID 1
            "7ba9ced7-bc52-4277-b7ef-b5e806321935", // User ID 2
            "ddb95a0b-acab-47a1-8436-41f5e7d8d40b", // User ID 3
        ]; // Add more user IDs as needed

        for (const userId of userIds) {
            // Check if the reservation already exists
            const existingReservation = await db.Reservation.findOne({
                where: { event_id: eventId, user_id: userId },
            });

            if (existingReservation) {
                console.log(`Reservation already exists for user ${userId} and event.`);
                continue;
            }

            // Create a reservation with "unclaimed" status
            const reservation = await db.Reservation.create({
                user_id: userId,
                event_id: eventId,
                ticket_id: ticketId,
                claiming_id: claimingSlotId,
                quantity: 1,
                reservation_status: "unclaimed", // Set status to "unclaimed"
            });

            console.log(`✅ Unclaimed reservation created successfully for user ${userId}:`, reservation);
        }
    } catch (error) {
        console.error("❌ Error creating unclaimed reservations:", error);
    }
}

seedUnclaimedReservations();