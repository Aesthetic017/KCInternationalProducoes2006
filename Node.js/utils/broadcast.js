const User = require('../models/User');
const { sendAnnouncementEmail } = require('./email');

async function broadcastNewItem({ country, type, itemName, itemDesc }) {
  try {
    console.log('--- BROADCAST DEBUG ---');
    console.log('Searching for country:', JSON.stringify(country), typeof country);

    const allUsersInCountry = await User.find({ country });
    console.log(`Users matching country only: ${allUsersInCountry.length}`);
    allUsersInCountry.forEach(u => {
      console.log(`  - ${u.email} | role=${u.role} | emailNotifications=${u.emailNotifications} (${typeof u.emailNotifications})`);
    });

    const users = await User.find({
      country,
      role: 'user',
      emailNotifications: true,
    });
    console.log(`Users matching ALL filters: ${users.length}`);
    console.log('--- END DEBUG ---');

    const siteUrl = `${process.env.CLIENT_URL}/${country}`;

    for (const user of users) {
      const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/${user.unsubscribeToken}`;
      try {
        await sendAnnouncementEmail({
          to: user.email,
          name: user.name,
          country,
          type,
          itemName,
          itemDesc,
          unsubscribeUrl,
          siteUrl,
        });
      } catch (err) {
        console.error(`Failed to send announcement to ${user.email}:`, err.message);
      }
    }

    console.log(`Broadcast sent: ${type} "${itemName}" to ${users.length} ${country} users`);
  } catch (err) {
    console.error('Broadcast failed:', err.message);
  }
}

module.exports = { broadcastNewItem };