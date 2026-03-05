// Admin Authorization Registry
// Dedicated file for administrative credentials and role definitions

export const ADMIN_REGISTRY = {
    credentials: {
        username: "admin",
        password: "ar-matrix-2026"
    },
    users: [
        {
            id: "ADM-001",
            name: "Admin Lead",
            role: "SuperAdmin",
            email: "admin@ar-mushrooms.com",
            avatar: "A"
        }
    ],
    roles: {
        SUPER_ADMIN: "SuperAdmin",
        FARM_MANAGER: "FarmManager",
        AUDITOR: "Auditor"
    }
};
