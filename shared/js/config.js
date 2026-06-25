/**
 * config.js
 * ملف الإعدادات العام للمشروع
 */

const CONFIG = {
    USE_MOCK_DATA: true,
    API_BASE_URL: "http://127.0.0.1:8000/api",

    PAGES: {
        LOGIN: "../login/index.html",
        DASHBOARD: "../dashboard/dashboard.html",
        CLIENTS: "../clients/clients.html",
        CASES: "../cases/cases.html",
        HEARINGS: "../hearings/hearings.html",
        DOCUMENTS: "../documents/documents.html",
        PAYMENTS: "../payments/payments.html",
        NOTIFICATIONS: "../notifications/notifications.html"
    },

    ROLES: {
        ADMIN: "ADMIN",
        LAWYER: "LAWYER",
        SECRETARY: "SECRETARY"
    }
};
