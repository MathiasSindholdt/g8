async function createRole(roleName, client, guild) {
    console.log("Attempting to create role:", roleName);

    try {
        const role = await guild.roles.create({
            name: roleName,
        });
        console.log(`Role "${role.name}" created successfully.`);
    } catch (error) {
        console.error('Error creating role:', error);
        throw error; // Rethrowing the error allows the caller to handle it
    }
}

module.exports = createRole;
