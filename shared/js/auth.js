/**
 * auth.js
 * --------------------------------------
 * مسؤول عن:
 * - حفظ التوكن وبيانات المستخدم بعد تسجيل الدخول
 * - استرجاعهم في أي صفحة
 * - حماية الصفحات (منع الدخول لو مفيش تسجيل دخول)
 * - تسجيل الخروج
 *
 * ملاحظة: استخدمنا sessionStorage بدل localStorage
 * عشان الجلسة تتقفل لما المستخدم يقفل المتصفح (أنسب لنظام بمعلومات حساسة).
 * تقدر تغيرها لـ localStorage لو عايز "تذكرني" دايمة.
 */

const Auth = (function () {

    const TOKEN_KEY = "lms_token";
    const USER_KEY = "lms_user";

    function saveSession(token, user) {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        const raw = sessionStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function isLoggedIn() {
        return !!getToken();
    }

    function logout() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        window.location.href = CONFIG.PAGES.LOGIN;
    }

    /**
     * يستخدم في أول كل صفحة محمية (الداشبورد وكل الصفحات الداخلية)
     * لو المستخدم مش داخل، يرجعه لصفحة اللوجن فوراً
     */
    function requireLogin() {
        if (!isLoggedIn()) {
            window.location.href = CONFIG.PAGES.LOGIN;
        }
    }

    /**
     * يستخدم في صفحة اللوجن نفسها
     * لو المستخدم داخل بالفعل، يوديه على طول للداشبورد
     */
    function redirectIfLoggedIn() {
        if (isLoggedIn()) {
            window.location.href = CONFIG.PAGES.DASHBOARD;
        }
    }

    /**
     * Header جاهز للاستخدام مع أي نداء API حقيقي بعدين
     */
    function getAuthHeader() {
        const token = getToken();
        return token ? { "Authorization": "Bearer " + token } : {};
    }

    /**
     * يتحقق إن دور المستخدم الحالي مسموح له بالصفحة
     * مثال استخدام: Auth.requireRole([CONFIG.ROLES.ADMIN])
     */
    function requireRole(allowedRoles) {
        const user = getUser();
        if (!user || !allowedRoles.includes(user.role)) {
            alert("لا تملك صلاحية الوصول لهذه الصفحة");
            window.location.href = CONFIG.PAGES.DASHBOARD;
        }
    }

    return {
        saveSession,
        getToken,
        getUser,
        isLoggedIn,
        logout,
        requireLogin,
        redirectIfLoggedIn,
        getAuthHeader,
        requireRole
    };
})();
