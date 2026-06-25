/**
 * mock-data.js
 * --------------------------------------
 * بيانات وهمية تستخدم بدل الباك إند الحقيقي لحد ما يخلص.
 * كل دالة هنا بترجع Promise عشان تتصرف بنفس شكل نداء API حقيقي (fetch).
 * كده لما نوصل بالباك الحقيقي، مش هنغير شكل استخدام الدوال في باقي الصفحات.
 */

const MockData = (function () {

    // ===== الحسابات التجريبية الثلاثة =====
    const USERS = [
        {
            id: 1,
            username: "admin",
            email: "admin@test.com",
            password: "123456",
            phone: "01000000001",
            role: CONFIG.ROLES.ADMIN,
            full_name: "أحمد المدير"
        },
        {
            id: 2,
            username: "lawyer",
            email: "lawyer@test.com",
            password: "123456",
            phone: "01000000002",
            role: CONFIG.ROLES.LAWYER,
            full_name: "محمد المحامي"
        },
        {
            id: 3,
            username: "secretary",
            email: "secretary@test.com",
            password: "123456",
            phone: "01000000003",
            role: CONFIG.ROLES.SECRETARY,
            full_name: "سارة السكرتيرة"
        }
    ];

    // ===== عملاء تجريبيين =====
    const CLIENTS = [
        { id: 1, name: "أحمد علي", phone: "0100000010", address: "القاهرة - مدينة نصر", national_id: "29001011234567", lawyer_id: 2 },
        { id: 2, name: "منى سعيد", phone: "0100000011", address: "الجيزة - الدقي", national_id: "29002021234567", lawyer_id: 2 },
        { id: 3, name: "كريم حسن", phone: "0100000012", address: "الإسكندرية", national_id: "29003031234567", lawyer_id: 2 }
    ];

    // ===== قضايا تجريبية =====
    const CASES = [
        { id: 1, case_number: "123", title: "نزاع تجاري", client_id: 1, lawyer_id: 2, court: "محكمة القاهرة الاقتصادية", status: "active", description: "نزاع على عقد توريد" },
        { id: 2, case_number: "124", title: "قضية إيجار", client_id: 2, lawyer_id: 2, court: "محكمة الجيزة الابتدائية", status: "pending", description: "إخلاء عقار" },
        { id: 3, case_number: "125", title: "قضية أحوال شخصية", client_id: 3, lawyer_id: 2, court: "محكمة الإسكندرية لشؤون الأسرة", status: "closed", description: "نفقة" }
    ];

    // ===== جلسات تجريبية =====
    const HEARINGS = [
        { id: 1, case_id: 1, date: "2026-07-01", court: "محكمة القاهرة الاقتصادية", notes: "تقديم مستندات", result: "" },
        { id: 2, case_id: 1, date: "2026-07-15", court: "محكمة القاهرة الاقتصادية", notes: "", result: "" },
        { id: 3, case_id: 2, date: "2026-06-28", court: "محكمة الجيزة الابتدائية", notes: "جلسة أولى", result: "" }
    ];

    // ===== مدفوعات تجريبية =====
    const PAYMENTS = [
        { id: 1, case_id: 1, amount: 5000, date: "2026-05-01", method: "نقدي", notes: "دفعة مقدمة" },
        { id: 2, case_id: 1, amount: 5000, date: "2026-06-01", method: "تحويل بنكي", notes: "" }
    ];

    // ===== ملفات تجريبية =====
    const DOCUMENTS = [
        { id: 1, case_id: 1, name: "عقد التوريد.pdf", type: "عقد", file_size: "245 KB", uploaded_by: 2, uploaded_at: "2026-05-02" },
        { id: 2, case_id: 1, name: "بطاقة العميل.jpg", type: "بطاقة شخصية", file_size: "1.1 MB", uploaded_by: 2, uploaded_at: "2026-05-02" },
        { id: 3, case_id: 2, name: "عقد الإيجار.pdf", type: "عقد", file_size: "180 KB", uploaded_by: 3, uploaded_at: "2026-06-10" }
    ];

    // ===== إشعارات تجريبية =====
    const NOTIFICATIONS = [
        { id: 1, user_id: 2, title: "جلسة غداً", message: "لديك جلسة في القضية رقم 123 الساعة 10 صباحاً", is_read: false, created_at: "2026-06-24" },
        { id: 2, user_id: 2, title: "دفعة جديدة", message: "تم تسجيل دفعة جديدة في القضية رقم 123", is_read: true, created_at: "2026-06-01" },
        { id: 3, user_id: 1, title: "ملف جديد", message: "تم رفع ملف جديد في القضية رقم 124", is_read: false, created_at: "2026-06-10" },
        { id: 4, user_id: 3, title: "جلسة قادمة", message: "جلسة القضية رقم 124 يوم 28 يونيو", is_read: false, created_at: "2026-06-20" }
    ];

    // محاكاة تأخير الشبكة عشان يحس إنه نداء حقيقي
    function delay(data, ms = 300) {
        return new Promise((resolve) => setTimeout(() => resolve(data), ms));
    }

    function nextId(array) {
        return array.length ? Math.max(...array.map(item => item.id)) + 1 : 1;
    }

    function findUserById(id) {
        const user = USERS.find(u => u.id === id);
        if (!user) return null;
        const { password: _pw, ...safeUser } = user;
        return safeUser;
    }

    return {
        // ----- Auth -----
        login(email, password) {
            const user = USERS.find(u => u.email === email && u.password === password);
            if (!user) {
                return delay({ success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
            }
            const fakeToken = "mock-token-" + user.id + "-" + Date.now();
            const { password: _pw, ...safeUser } = user;
            return delay({ success: true, token: fakeToken, user: safeUser });
        },

        // ----- Clients -----
        getClients(lawyerId = null) {
            const data = lawyerId ? CLIENTS.filter(c => c.lawyer_id === lawyerId) : CLIENTS;
            // إضافة عدد القضايا لكل عميل (مفيد في عرض الجدول)
            const withCounts = data.map(c => ({
                ...c,
                cases_count: CASES.filter(cs => cs.client_id === c.id).length
            }));
            return delay(withCounts);
        },

        getClientById(id) {
            const client = CLIENTS.find(c => c.id === Number(id));
            return delay(client || null);
        },

        createClient(clientData) {
            const newClient = { id: nextId(CLIENTS), ...clientData };
            CLIENTS.push(newClient);
            return delay({ success: true, client: newClient });
        },

        updateClient(id, clientData) {
            const index = CLIENTS.findIndex(c => c.id === Number(id));
            if (index === -1) return delay({ success: false, message: "العميل غير موجود" });
            CLIENTS[index] = { ...CLIENTS[index], ...clientData };
            return delay({ success: true, client: CLIENTS[index] });
        },

        deleteClient(id) {
            const index = CLIENTS.findIndex(c => c.id === Number(id));
            if (index === -1) return delay({ success: false, message: "العميل غير موجود" });

            const hasCases = CASES.some(cs => cs.client_id === Number(id));
            if (hasCases) {
                return delay({ success: false, message: "لا يمكن حذف عميل مرتبط بقضايا قائمة" });
            }

            CLIENTS.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Cases -----
        getCases(lawyerId = null) {
            const data = lawyerId ? CASES.filter(c => c.lawyer_id === lawyerId) : CASES;
            // ربط كل قضية ببيانات العميل بتاعها (مفيد في عرض الجدول)
            const withClientInfo = data.map(c => {
                const client = CLIENTS.find(cl => cl.id === c.client_id);
                return { ...c, client_name: client ? client.name : "غير معروف" };
            });
            return delay(withClientInfo);
        },

        getCaseById(id) {
            const found = CASES.find(c => c.id === Number(id));
            if (!found) return delay(null);

            const client = CLIENTS.find(cl => cl.id === found.client_id) || null;
            const lawyer = findUserById(found.lawyer_id);
            const hearings = HEARINGS.filter(h => h.case_id === found.id);
            const payments = PAYMENTS.filter(p => p.case_id === found.id);

            return delay({ ...found, client, lawyer, hearings, payments });
        },

        createCase(caseData) {
            const newCase = { id: nextId(CASES), ...caseData };
            CASES.push(newCase);
            return delay({ success: true, case: newCase });
        },

        updateCase(id, caseData) {
            const index = CASES.findIndex(c => c.id === Number(id));
            if (index === -1) return delay({ success: false, message: "القضية غير موجودة" });
            CASES[index] = { ...CASES[index], ...caseData };
            return delay({ success: true, case: CASES[index] });
        },

        deleteCase(id) {
            const index = CASES.findIndex(c => c.id === Number(id));
            if (index === -1) return delay({ success: false, message: "القضية غير موجودة" });
            CASES.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Lawyers (لاستخدامها في select بصفحة إضافة قضية/عميل) -----
        getLawyers() {
            return delay(USERS.filter(u => u.role === CONFIG.ROLES.LAWYER).map(u => {
                const { password: _pw, ...safe } = u;
                return safe;
            }));
        },

        // ----- Hearings -----
        getHearings(caseId = null) {
            let data = caseId ? HEARINGS.filter(h => h.case_id === caseId) : HEARINGS;
            // ربط كل جلسة برقم القضية وعنوانها (مفيد في عرض الجدول العام)
            data = data.map(h => {
                const relatedCase = CASES.find(c => c.id === h.case_id);
                return {
                    ...h,
                    case_number: relatedCase ? relatedCase.case_number : "-",
                    case_title: relatedCase ? relatedCase.title : "غير معروف"
                };
            });
            // ترتيب بالتاريخ الأقرب أولاً
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
            return delay(data);
        },

        createHearing(hearingData) {
            const newHearing = { id: nextId(HEARINGS), ...hearingData };
            HEARINGS.push(newHearing);
            return delay({ success: true, hearing: newHearing });
        },

        updateHearing(id, hearingData) {
            const index = HEARINGS.findIndex(h => h.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الجلسة غير موجودة" });
            HEARINGS[index] = { ...HEARINGS[index], ...hearingData };
            return delay({ success: true, hearing: HEARINGS[index] });
        },

        deleteHearing(id) {
            const index = HEARINGS.findIndex(h => h.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الجلسة غير موجودة" });
            HEARINGS.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Payments -----
        getPayments(caseId = null) {
            let data = caseId ? PAYMENTS.filter(p => p.case_id === caseId) : PAYMENTS;
            // ربط كل دفعة برقم القضية وعنوانها (مفيد في عرض الجدول العام)
            data = data.map(p => {
                const relatedCase = CASES.find(c => c.id === p.case_id);
                return {
                    ...p,
                    case_number: relatedCase ? relatedCase.case_number : "-",
                    case_title: relatedCase ? relatedCase.title : "غير معروف"
                };
            });
            return delay(data);
        },

        createPayment(paymentData) {
            const newPayment = { id: nextId(PAYMENTS), ...paymentData };
            PAYMENTS.push(newPayment);
            return delay({ success: true, payment: newPayment });
        },

        updatePayment(id, paymentData) {
            const index = PAYMENTS.findIndex(p => p.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الدفعة غير موجودة" });
            PAYMENTS[index] = { ...PAYMENTS[index], ...paymentData };
            return delay({ success: true, payment: PAYMENTS[index] });
        },

        deletePayment(id) {
            const index = PAYMENTS.findIndex(p => p.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الدفعة غير موجودة" });
            PAYMENTS.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Documents -----
        getDocuments(caseId = null) {
            let data = caseId ? DOCUMENTS.filter(d => d.case_id === caseId) : DOCUMENTS;
            data = data.map(d => {
                const relatedCase = CASES.find(c => c.id === d.case_id);
                const uploader = findUserById(d.uploaded_by);
                return {
                    ...d,
                    case_number: relatedCase ? relatedCase.case_number : "-",
                    case_title: relatedCase ? relatedCase.title : "غير معروف",
                    uploaded_by_name: uploader ? (uploader.full_name || uploader.username) : "-"
                };
            });
            data.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
            return delay(data);
        },

        createDocument(documentData) {
            const newDoc = {
                id: nextId(DOCUMENTS),
                uploaded_at: new Date().toISOString().split("T")[0],
                ...documentData
            };
            DOCUMENTS.push(newDoc);
            return delay({ success: true, document: newDoc });
        },

        deleteDocument(id) {
            const index = DOCUMENTS.findIndex(d => d.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الملف غير موجود" });
            DOCUMENTS.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Notifications -----
        getNotifications(userId = null) {
            let data = userId ? NOTIFICATIONS.filter(n => n.user_id === userId) : NOTIFICATIONS;
            data = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return delay(data);
        },

        markNotificationRead(id) {
            const notification = NOTIFICATIONS.find(n => n.id === Number(id));
            if (!notification) return delay({ success: false, message: "الإشعار غير موجود" });
            notification.is_read = true;
            return delay({ success: true });
        },

        markAllNotificationsRead(userId) {
            NOTIFICATIONS.filter(n => n.user_id === userId).forEach(n => n.is_read = true);
            return delay({ success: true });
        },

        deleteNotification(id) {
            const index = NOTIFICATIONS.findIndex(n => n.id === Number(id));
            if (index === -1) return delay({ success: false, message: "الإشعار غير موجود" });
            NOTIFICATIONS.splice(index, 1);
            return delay({ success: true });
        },

        // ----- Dashboard summary -----
        getDashboardStats(user) {
            const isRestricted = user.role === CONFIG.ROLES.LAWYER; // فقط المحامي مقيد ببياناته الخاصة

            const myClients = isRestricted ? CLIENTS.filter(c => c.lawyer_id === user.id) : CLIENTS;
            const myCases = isRestricted ? CASES.filter(c => c.lawyer_id === user.id) : CASES;
            const myCaseIds = myCases.map(c => c.id);
            const relevantHearings = HEARINGS.filter(h => myCaseIds.includes(h.case_id));
            const relevantPayments = PAYMENTS.filter(p => myCaseIds.includes(p.case_id));

            return delay({
                clientsCount: myClients.length,
                casesCount: myCases.length,
                activeCasesCount: myCases.filter(c => c.status === "active").length,
                hearingsCount: relevantHearings.length,
                totalPayments: relevantPayments.reduce((sum, p) => sum + p.amount, 0)
            });
        }
    };
})();
