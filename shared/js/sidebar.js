/**
 * sidebar.js
 * --------------------------------------
 * يُستخدم في كل الصفحات الداخلية (بعد تسجيل الدخول).
 * - يتحقق إن المستخدم مسجل دخول
 * - يبني عناصر القائمة الجانبية حسب دور المستخدم
 * - يحدد العنصر النشط حسب الصفحة الحالية
 *
 * ملاحظة الصلاحيات (مؤقتة لحد ما الباك إند يتأكد منها رسمياً):
 * - ADMIN: يشوف كل شيء
 * - LAWYER: يشوف عملاءه وقضاياه وجلساته وملفاته ومدفوعاته
 * - SECRETARY: يشوف العملاء والقضايا والجلسات (بدون المدفوعات)
 */

$(function () {

    Auth.requireLogin();

    const user = Auth.getUser();
    const currentPage = window.location.pathname.split("/").pop();

    const MENU_ITEMS = [
        { page: CONFIG.PAGES.DASHBOARD, icon: "bi-speedometer2", label: "الرئيسية", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.CLIENTS, icon: "bi-people", label: "العملاء", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.CASES, icon: "bi-briefcase", label: "القضايا", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.HEARINGS, icon: "bi-calendar-event", label: "الجلسات", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.DOCUMENTS, icon: "bi-folder2-open", label: "الملفات", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.PAYMENTS, icon: "bi-cash-coin", label: "الأتعاب والمدفوعات", roles: ["ADMIN", "LAWYER", "SECRETARY"] },
        { page: CONFIG.PAGES.NOTIFICATIONS, icon: "bi-bell", label: "الإشعارات", roles: ["ADMIN", "LAWYER", "SECRETARY"] }
    ];

    const $nav = $("#sidebarNav");

    MENU_ITEMS
        .filter(item => item.roles.includes(user.role))
        .forEach(item => {
            const isActive = item.page === currentPage ? "active" : "";
            $nav.append(`
                <li class="nav-item">
                    <a class="nav-link ${isActive}" href="${item.page}">
                        <i class="bi ${item.icon}"></i> ${item.label}
                    </a>
                </li>
            `);
        });

    // عرض اسم المستخدم ودوره في الـ Topbar (لو موجود في الصفحة)
    const roleLabels = {
        ADMIN: "مدير",
        LAWYER: "محامي",
        SECRETARY: "سكرتيرة"
    };

    $("#welcomeUserName").text(user.full_name || user.username);
    $("#welcomeUserRole").text(roleLabels[user.role] || user.role);

    // زر تسجيل الخروج (موجود في كل الصفحات الداخلية)
    $("#logoutBtn").on("click", function () {
        Auth.logout();
    });

});
