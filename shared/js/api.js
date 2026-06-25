/**
 * api.js
 * --------------------------------------
 * نقطة الاتصال الوحيدة بين الصفحات والبيانات (سواء mock أو حقيقية).
 * كل صفحة تنادي على Api.xxx() فقط، ومش لازم تعرف هل البيانات وهمية أو حقيقية.
 *
 * لما الباك إند يخلص:
 * 1. غيّر CONFIG.USE_MOCK_DATA إلى false في config.js
 * 2. تأكد إن CONFIG.API_BASE_URL صحيح
 * 3. كل حاجة تشتغل من غير تعديل في الصفحات
 */

const Api = (function () {

    async function realRequest(endpoint, options = {}) {
        const res = await fetch(CONFIG.API_BASE_URL + endpoint, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...Auth.getAuthHeader(),
                ...(options.headers || {})
            }
        });

        if (res.status === 401) {
            // التوكن غير صالح أو منتهي -> رجّعه لصفحة اللوجن
            Auth.logout();
            return null;
        }

        return res.json();
    }

    return {
        // ===== Auth =====
        async login(email, password) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.login(email, password);
            }
            return realRequest("/accounts/login/", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
        },

        // ===== Clients =====
        async getClients() {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                // المحامي يشوف عملاءه فقط، الأدمن والسكرتيرة يشوفوا الكل
                const lawyerId = user.role === CONFIG.ROLES.LAWYER ? user.id : null;
                return MockData.getClients(lawyerId);
            }
            return realRequest("/clients/");
        },

        async getClientById(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getClientById(id);
            }
            return realRequest(`/clients/${id}/`);
        },

        async createClient(clientData) {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                return MockData.createClient({ ...clientData, lawyer_id: user.id });
            }
            return realRequest("/clients/", { method: "POST", body: JSON.stringify(clientData) });
        },

        async updateClient(id, clientData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.updateClient(id, clientData);
            }
            return realRequest(`/clients/${id}/`, { method: "PUT", body: JSON.stringify(clientData) });
        },

        async deleteClient(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deleteClient(id);
            }
            return realRequest(`/clients/${id}/`, { method: "DELETE" });
        },

        // ===== Cases =====
        async getCases() {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                const lawyerId = user.role === CONFIG.ROLES.LAWYER ? user.id : null;
                return MockData.getCases(lawyerId);
            }
            return realRequest("/cases/");
        },

        async getCaseById(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getCaseById(id);
            }
            return realRequest(`/cases/${id}/`);
        },

        async createCase(caseData) {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                const lawyerId = caseData.lawyer_id || user.id;
                return MockData.createCase({ ...caseData, lawyer_id: lawyerId });
            }
            return realRequest("/cases/", { method: "POST", body: JSON.stringify(caseData) });
        },

        async updateCase(id, caseData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.updateCase(id, caseData);
            }
            return realRequest(`/cases/${id}/`, { method: "PUT", body: JSON.stringify(caseData) });
        },

        async deleteCase(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deleteCase(id);
            }
            return realRequest(`/cases/${id}/`, { method: "DELETE" });
        },

        async getLawyers() {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getLawyers();
            }
            return realRequest("/accounts/users/?role=LAWYER");
        },

        // ===== Hearings =====
        async getHearings(caseId = null) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getHearings(caseId);
            }
            return realRequest(caseId ? `/hearings/?case=${caseId}` : "/hearings/");
        },

        async createHearing(hearingData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.createHearing(hearingData);
            }
            return realRequest("/hearings/", { method: "POST", body: JSON.stringify(hearingData) });
        },

        async updateHearing(id, hearingData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.updateHearing(id, hearingData);
            }
            return realRequest(`/hearings/${id}/`, { method: "PUT", body: JSON.stringify(hearingData) });
        },

        async deleteHearing(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deleteHearing(id);
            }
            return realRequest(`/hearings/${id}/`, { method: "DELETE" });
        },

        // ===== Payments =====
        async getPayments(caseId = null) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getPayments(caseId);
            }
            return realRequest(caseId ? `/payments/?case=${caseId}` : "/payments/");
        },

        async createPayment(paymentData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.createPayment(paymentData);
            }
            return realRequest("/payments/", { method: "POST", body: JSON.stringify(paymentData) });
        },

        async updatePayment(id, paymentData) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.updatePayment(id, paymentData);
            }
            return realRequest(`/payments/${id}/`, { method: "PUT", body: JSON.stringify(paymentData) });
        },

        async deletePayment(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deletePayment(id);
            }
            return realRequest(`/payments/${id}/`, { method: "DELETE" });
        },

        // ===== Documents =====
        async getDocuments(caseId = null) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.getDocuments(caseId);
            }
            return realRequest(caseId ? `/documents/?case=${caseId}` : "/documents/");
        },

        async createDocument(documentData) {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                return MockData.createDocument({ ...documentData, uploaded_by: user.id });
            }
            // ملاحظة: مع الباك الحقيقي، الرفع غالباً هيكون multipart/form-data بدل JSON
            return realRequest("/documents/", { method: "POST", body: JSON.stringify(documentData) });
        },

        async deleteDocument(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deleteDocument(id);
            }
            return realRequest(`/documents/${id}/`, { method: "DELETE" });
        },

        // ===== Notifications =====
        async getNotifications() {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                return MockData.getNotifications(user.id);
            }
            return realRequest("/notifications/");
        },

        async markNotificationRead(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.markNotificationRead(id);
            }
            return realRequest(`/notifications/${id}/read/`, { method: "POST" });
        },

        async markAllNotificationsRead() {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                return MockData.markAllNotificationsRead(user.id);
            }
            return realRequest(`/notifications/read-all/`, { method: "POST" });
        },

        async deleteNotification(id) {
            if (CONFIG.USE_MOCK_DATA) {
                return MockData.deleteNotification(id);
            }
            return realRequest(`/notifications/${id}/`, { method: "DELETE" });
        },

        // ===== Dashboard =====
        async getDashboardStats() {
            if (CONFIG.USE_MOCK_DATA) {
                const user = Auth.getUser();
                return MockData.getDashboardStats(user);
            }
            return realRequest("/dashboard/stats/");
        }
    };
})();
