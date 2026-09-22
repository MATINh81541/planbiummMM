/*
 * PlanBium UI translations for all supported locales.
 *
 * These are UI-string translations (navigation, hero, FAQ, footer, etc.).
 * Product content translations come from the product_translations database table.
 *
 * The frontend translates backend error codes through this system too.
 */

import type { ErrorCode } from '@/lib/errors';

export type TranslationKey =
  // Brand
  | 'brand.tagline'
  // Nav
  | 'nav.home'
  | 'nav.pricing'
  | 'nav.about'
  | 'nav.faq'
  | 'nav.login'
  | 'nav.signup'
  | 'nav.contact'
  | 'nav.menu'
  | 'nav.close'
  // Hero
  | 'hero.slogan'
  | 'hero.subtitle'
  | 'hero.ctaPrimary'
  | 'hero.ctaSecondary'
  | 'hero.scrollHint'
  // About
  | 'about.title'
  | 'about.subtitle'
  | 'about.whatIsTitle'
  | 'about.whatIsBody'
  | 'about.whatItProvidesTitle'
  | 'about.whatItProvidesBody'
  | 'about.whyPlanningTitle'
  | 'about.whyPlanningBody'
  | 'about.whyBeautifulTitle'
  | 'about.whyBeautifulBody'
  // FAQ
  | 'faq.title'
  | 'faq.subtitle'
  | 'faq.q1'
  | 'faq.a1'
  | 'faq.q2'
  | 'faq.a2'
  | 'faq.q3'
  | 'faq.a3'
  | 'faq.q4'
  | 'faq.a4'
  | 'faq.q5'
  | 'faq.a5'
  // Pricing
  | 'pricing.title'
  | 'pricing.subtitle'
  | 'pricing.continue'
  | 'pricing.perPeriod'
  | 'pricing.loading'
  | 'pricing.error'
  | 'pricing.retry'
  | 'pricing.noProducts'
  | 'pricing.features'
  | 'pricing.popular'
  // Footer
  | 'footer.tagline'
  | 'footer.rights'
  | 'footer.legal.terms'
  | 'footer.legal.privacy'
  | 'footer.legal.refunds'
  | 'footer.nav.pricing'
  | 'footer.nav.about'
  | 'footer.nav.contact'
  | 'footer.nav.faq'
  // Language selector
  | 'language.label'
  | 'language.select'
  // Legal
  | 'legal.terms.title'
  | 'legal.privacy.title'
  | 'legal.refunds.title'
  | 'legal.lastUpdated'
  | 'legal.placeholder'
  // Contact
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.name'
  | 'contact.email'
  | 'contact.message'
  | 'contact.send'
  | 'contact.sending'
  | 'contact.sent'
  | 'contact.error'
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.back'
  | 'common.backHome'
  | 'common.notFound.title'
  | 'common.notFound.body'
  // Auth
  | 'auth.login.title'
  | 'auth.login.subtitle'
  | 'auth.signup.title'
  | 'auth.signup.subtitle'
  | 'auth.email'
  | 'auth.emailPlaceholder'
  | 'auth.sendOtp'
  | 'auth.sendingOtp'
  | 'auth.otpTitle'
  | 'auth.otpSubtitle'
  | 'auth.otpPlaceholder'
  | 'auth.verifyOtp'
  | 'auth.verifying'
  | 'auth.resendOtp'
  | 'auth.resendIn'
  | 'auth.googleLogin'
  | 'auth.googleSignup'
  | 'auth.orContinueWith'
  | 'auth.noAccount'
  | 'auth.haveAccount'
  | 'auth.signupLink'
  | 'auth.loginLink'
  | 'auth.otpSent'
  | 'auth.otpInvalid'
  | 'auth.otpExpired'
  | 'auth.loginFailed'
  | 'auth.signupFailed'
  | 'auth.authFailed'
  | 'auth.authFailedDescription'
  | 'auth.retryAuth'
  | 'auth.backToHome'
  | 'auth.dashboardRedirect'
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.nav.pricing'
  | 'dashboard.nav.cart'
  | 'dashboard.nav.purchases'
  | 'dashboard.nav.account'
  | 'dashboard.nav.logout'
  | 'dashboard.theme.gray'
  | 'dashboard.theme.lime'
  | 'dashboard.theme.blueberry'
  | 'dashboard.theme.label'
  // Cart
  | 'cart.title'
  | 'cart.empty'
  | 'cart.emptyDescription'
  | 'cart.browsePlanners'
  | 'cart.product'
  | 'cart.price'
  | 'cart.quantity'
  | 'cart.total'
  | 'cart.checkout'
  | 'cart.remove'
  | 'cart.removeConfirm'
  | 'cart.loading'
  // Purchases
  | 'purchases.title'
  | 'purchases.empty'
  | 'purchases.emptyDescription'
  | 'purchases.orderId'
  | 'purchases.date'
  | 'purchases.status'
  | 'purchases.total'
  | 'purchases.items'
  | 'purchases.download'
  | 'purchases.open'
  | 'purchases.purchased'
  | 'purchases.status.pending'
  | 'purchases.status.paid'
  | 'purchases.status.refunded'
  | 'purchases.status.cancelled'
  | 'purchases.status.expired'
  // Account
  | 'account.title'
  | 'account.displayName'
  | 'account.preferredLocale'
  | 'account.billingCountry'
  | 'account.dashboardTheme'
  | 'account.save'
  | 'account.saving'
  | 'account.saved'
  | 'account.error'
  // Checkout
  | 'checkout.title'
  | 'checkout.billingCountry'
  | 'checkout.selectCountry'
  | 'checkout.confirmCountry'
  | 'checkout.changingCountry'
  | 'checkout.paymentMethod'
  | 'checkout.selectMethod'
  | 'checkout.noMethods'
  | 'checkout.noMethodsDescription'
  | 'checkout.orderSummary'
  | 'checkout.pay'
  | 'checkout.paying'
  | 'checkout.processing'
  | 'checkout.unavailableProducts'
  | 'checkout.unavailableWarning'
  | 'checkout.expired'
  | 'checkout.expiredDescription'
  | 'checkout.startNew'
  | 'checkout.geoMismatch'
  | 'checkout.redirecting'
  | 'checkout.continueToPay'
  | 'checkout.total'
  // Checkout result
  | 'checkoutResult.processing'
  | 'checkoutResult.processingDescription'
  | 'checkoutResult.success'
  | 'checkoutResult.successDescription'
  | 'checkoutResult.failed'
  | 'checkoutResult.failedDescription'
  | 'checkoutResult.retry'
  | 'checkoutResult.cancelled'
  | 'checkoutResult.cancelledDescription'
  | 'checkoutResult.expired'
  | 'checkoutResult.expiredDescription'
  | 'checkoutResult.viewPurchases'
  | 'checkoutResult.backToCart'
  // Admin
  | 'admin.title'
  | 'admin.nav.products'
  | 'admin.nav.orders'
  | 'admin.nav.payments'
  | 'admin.nav.entitlements'
  | 'admin.nav.users'
  | 'admin.notAdmin'
  | 'admin.notAdminDescription'
  | 'admin.products.title'
  | 'admin.products.slug'
  | 'admin.products.status'
  | 'admin.products.actions'
  | 'admin.products.archive'
  | 'admin.products.activate'
  | 'admin.products.edit'
  | 'admin.orders.title'
  | 'admin.orders.orderId'
  | 'admin.orders.user'
  | 'admin.orders.status'
  | 'admin.orders.total'
  | 'admin.orders.date'
  | 'admin.orders.region'
  | 'admin.orders.view'
  | 'admin.payments.title'
  | 'admin.payments.provider'
  | 'admin.payments.method'
  | 'admin.payments.reference'
  | 'admin.entitlements.title'
  | 'admin.entitlements.user'
  | 'admin.entitlements.product'
  | 'admin.entitlements.status'
  | 'admin.entitlements.revoke'
  | 'admin.users.title'
  | 'admin.users.email'
  | 'admin.users.role'
  // Error codes
  | `error.${ErrorCode}`;

type TranslationDict = Partial<Record<TranslationKey, string>>;

const en: TranslationDict = {
  'brand.tagline': 'green Digital Planners',
  'nav.home': 'Home',
  'nav.pricing': 'Pricing',
  'nav.about': 'About',
  'nav.faq': 'FAQ',
  'nav.login': 'Login',
  'nav.signup': 'Sign Up',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'hero.slogan': 'Plan beautifully, live intentionally',
  'hero.subtitle': 'Premium digital planners designed to make planning simple, enjoyable, and effortlessly elegant.',
  'hero.ctaPrimary': 'Explore Planners',
  'hero.ctaSecondary': 'Learn More',
  'hero.scrollHint': 'Scroll to explore',
  'about.title': 'About PlanBium',
  'about.subtitle': 'Planning should feel like a breath of fresh air',
  'about.whatIsTitle': 'What is PlanBium?',
  'about.whatIsBody': 'PlanBium is a collection of beautifully crafted digital planners that help you organize your life with clarity and intention. From daily routines to long-term goals, each planner is designed to bring calm and structure to your day.',
  'about.whatItProvidesTitle': 'What does it provide?',
  'about.whatItProvidesBody': 'A curated range of planners for every need — essential daily planning, professional goal tracking, student schedules, wellness routines, and business management. Each comes with localized content and supports multiple currencies.',
  'about.whyPlanningTitle': 'Why is planning useful?',
  'about.whyPlanningBody': 'Planning reduces overwhelm, creates space for what matters, and turns vague intentions into concrete actions. A good plan is not a rigid rulebook — it is a gentle guide that keeps you moving forward.',
  'about.whyBeautifulTitle': 'Why should planning feel beautiful?',
  'about.whyBeautifulBody': 'When your tools are pleasant to use, you use them more often. PlanBium brings premium design, soft visuals, and thoughtful interactions to something you interact with every single day.',
  'faq.title': 'Frequently Asked Questions',
  'faq.subtitle': 'Everything you need to know about PlanBium',
  'faq.q1': 'What is a digital planner?',
  'faq.a1': 'A digital planner is a downloadable planner file you can use on your tablet, computer, or phone. It replaces paper planners with something lighter, searchable, and always with you.',
  'faq.q2': 'Which devices are supported?',
  'faq.a2': 'PlanBium planners work on any device that can open PDF files — including iPad, Android tablets, desktop computers, and phones. Use them with your favorite note-taking app or print them out.',
  'faq.q3': 'Which languages are supported?',
  'faq.a3': 'PlanBium supports English, Persian, Arabic, Simplified Chinese, Dutch, and Spanish. You can switch languages at any time without affecting your payment region or currency.',
  'faq.q4': 'How does pricing work across regions?',
  'faq.a4': 'Pricing is determined by your billing country and its associated payment region. Your language preference never changes your payment region, currency, or available payment methods.',
  'faq.q5': 'Can I get a refund?',
  'faq.a5': 'Yes. We offer refunds according to our refund policy. Please review the refund terms on our refunds page or contact us if you have any questions.',
  'pricing.title': 'Choose Your Planner',
  'pricing.subtitle': 'Premium planners for every lifestyle',
  'pricing.continue': 'Continue',
  'pricing.perPeriod': 'one-time',
  'pricing.loading': 'Loading planners...',
  'pricing.error': 'Could not load pricing. Please try again.',
  'pricing.retry': 'Retry',
  'pricing.noProducts': 'No planners are currently available.',
  'pricing.features': 'Included features',
  'pricing.popular': 'Most Popular',
  'footer.tagline': 'Beautiful digital planners for a more intentional life.',
  'footer.rights': 'All rights reserved.',
  'footer.legal.terms': 'Terms',
  'footer.legal.privacy': 'Privacy',
  'footer.legal.refunds': 'Refunds',
  'footer.nav.pricing': 'Pricing',
  'footer.nav.about': 'About',
  'footer.nav.contact': 'Contact',
  'footer.nav.faq': 'FAQ',
  'language.label': 'Language',
  'language.select': 'Select language',
  'legal.terms.title': 'Terms of Service',
  'legal.privacy.title': 'Privacy Policy',
  'legal.refunds.title': 'Refund Policy',
  'legal.lastUpdated': 'Last updated',
  'legal.placeholder': 'This page will be populated with finalized legal content. The visual layout and structure are ready.',
  'contact.title': 'Get in Touch',
  'contact.subtitle': 'We would love to hear from you',
  'contact.name': 'Your name',
  'contact.email': 'Your email',
  'contact.message': 'Your message',
  'contact.send': 'Send Message',
  'contact.sending': 'Sending...',
  'contact.sent': 'Thank you! Your message has been noted.',
  'contact.error': 'Something went wrong. Please try again.',
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.back': 'Back',
  'common.backHome': 'Back to Home',
  'common.notFound.title': 'Page Not Found',
  'common.notFound.body': 'The page you are looking for does not exist or has been moved.',
  // Auth
  'auth.login.title': 'Welcome Back',
  'auth.login.subtitle': 'Sign in to your PlanBium account',
  'auth.signup.title': 'Create Account',
  'auth.signup.subtitle': 'Start planning beautifully',
  'auth.email': 'Email',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': 'Send Code',
  'auth.sendingOtp': 'Sending...',
  'auth.otpTitle': 'Enter Verification Code',
  'auth.otpSubtitle': 'We sent a code to your email',
  'auth.otpPlaceholder': 'Enter 6-digit code',
  'auth.verifyOtp': 'Verify',
  'auth.verifying': 'Verifying...',
  'auth.resendOtp': 'Resend code',
  'auth.resendIn': 'Resend in',
  'auth.googleLogin': 'Continue with Google',
  'auth.googleSignup': 'Sign up with Google',
  'auth.orContinueWith': 'or',
  'auth.noAccount': "Don't have an account?",
  'auth.haveAccount': 'Already have an account?',
  'auth.signupLink': 'Sign up',
  'auth.loginLink': 'Log in',
  'auth.otpSent': 'Code sent! Check your email.',
  'auth.otpInvalid': 'Invalid code. Please try again.',
  'auth.otpExpired': 'This code has expired. Please request a new one.',
  'auth.loginFailed': 'Could not sign in. Please try again.',
  'auth.signupFailed': 'Could not create account. Please try again.',
  'auth.authFailed': 'Authentication Failed',
  'auth.authFailedDescription': 'Something went wrong during authentication. Please try again.',
  'auth.retryAuth': 'Try Again',
  'auth.backToHome': 'Back to Home',
  'auth.dashboardRedirect': 'Taking you to your dashboard...',
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welcome',
  'dashboard.nav.pricing': 'Pricing',
  'dashboard.nav.cart': 'Cart',
  'dashboard.nav.purchases': 'My Purchases',
  'dashboard.nav.account': 'Account',
  'dashboard.nav.logout': 'Log out',
  'dashboard.theme.gray': 'Gray',
  'dashboard.theme.lime': 'Lime',
  'dashboard.theme.blueberry': 'Blueberry',
  'dashboard.theme.label': 'Theme',
  // Cart
  'cart.title': 'Your Cart',
  'cart.empty': 'Your cart is empty',
  'cart.emptyDescription': 'Browse our planners and find the one that fits your life.',
  'cart.browsePlanners': 'Browse Planners',
  'cart.product': 'Product',
  'cart.price': 'Price',
  'cart.quantity': 'Qty',
  'cart.total': 'Total',
  'cart.checkout': 'Proceed to Checkout',
  'cart.remove': 'Remove',
  'cart.removeConfirm': 'Remove this item?',
  'cart.loading': 'Loading cart...',
  // Purchases
  'purchases.title': 'My Purchases',
  'purchases.empty': 'No purchases yet',
  'purchases.emptyDescription': 'Your planners will appear here after purchase.',
  'purchases.orderId': 'Order',
  'purchases.date': 'Date',
  'purchases.status': 'Status',
  'purchases.total': 'Total',
  'purchases.items': 'Items',
  'purchases.download': 'Download',
  'purchases.open': 'Open',
  'purchases.purchased': 'Purchased',
  'purchases.status.pending': 'Pending',
  'purchases.status.paid': 'Paid',
  'purchases.status.refunded': 'Refunded',
  'purchases.status.cancelled': 'Cancelled',
  'purchases.status.expired': 'Expired',
  // Account
  'account.title': 'Account Settings',
  'account.displayName': 'Display Name',
  'account.preferredLocale': 'Preferred Language',
  'account.billingCountry': 'Billing Country',
  'account.dashboardTheme': 'Dashboard Theme',
  'account.save': 'Save Changes',
  'account.saving': 'Saving...',
  'account.saved': 'Changes saved!',
  'account.error': 'Could not save changes. Please try again.',
  // Checkout
  'checkout.title': 'Checkout',
  'checkout.billingCountry': 'Billing Country',
  'checkout.selectCountry': 'Select your billing country',
  'checkout.confirmCountry': 'Confirm Country',
  'checkout.changingCountry': 'Updating prices and methods...',
  'checkout.paymentMethod': 'Payment Method',
  'checkout.selectMethod': 'Select a payment method',
  'checkout.noMethods': 'No payment methods available',
  'checkout.noMethodsDescription': 'No payment methods are currently available for this region.',
  'checkout.orderSummary': 'Order Summary',
  'checkout.pay': 'Pay',
  'checkout.paying': 'Processing...',
  'checkout.processing': 'Processing your payment...',
  'checkout.unavailableProducts': 'Unavailable products',
  'checkout.unavailableWarning': 'Some products in your cart are not available in this region. Please remove them to continue.',
  'checkout.expired': 'Checkout Expired',
  'checkout.expiredDescription': 'Your checkout session has expired. Please start a new checkout.',
  'checkout.startNew': 'Start New Checkout',
  'checkout.geoMismatch': 'Your billing country differs from your detected location. This is allowed but may be reviewed.',
  'checkout.redirecting': 'Redirecting to payment provider...',
  'checkout.continueToPay': 'You will be redirected to complete your payment securely.',
  'checkout.total': 'Total',
  // Checkout result
  'checkoutResult.processing': 'Payment Processing',
  'checkoutResult.processingDescription': 'Your payment is being verified. Please wait...',
  'checkoutResult.success': 'Payment Successful',
  'checkoutResult.successDescription': 'Your purchase is complete. Your planners are now available.',
  'checkoutResult.failed': 'Payment Failed',
  'checkoutResult.failedDescription': 'Your payment could not be completed. You can try again.',
  'checkoutResult.retry': 'Retry Payment',
  'checkoutResult.cancelled': 'Payment Cancelled',
  'checkoutResult.cancelledDescription': 'The payment was cancelled. Your order is still pending.',
  'checkoutResult.expired': 'Order Expired',
  'checkoutResult.expiredDescription': 'This order has expired. Please start a new checkout.',
  'checkoutResult.viewPurchases': 'View My Purchases',
  'checkoutResult.backToCart': 'Back to Cart',
  // Admin
  'admin.title': 'Admin Panel',
  'admin.nav.products': 'Products',
  'admin.nav.orders': 'Orders',
  'admin.nav.payments': 'Payments',
  'admin.nav.entitlements': 'Entitlements',
  'admin.nav.users': 'Users',
  'admin.notAdmin': 'Access Denied',
  'admin.notAdminDescription': 'You do not have admin access to view this page.',
  'admin.products.title': 'Manage Products',
  'admin.products.slug': 'Slug',
  'admin.products.status': 'Status',
  'admin.products.actions': 'Actions',
  'admin.products.archive': 'Archive',
  'admin.products.activate': 'Activate',
  'admin.products.edit': 'Edit',
  'admin.orders.title': 'Manage Orders',
  'admin.orders.orderId': 'Order ID',
  'admin.orders.user': 'User',
  'admin.orders.status': 'Status',
  'admin.orders.total': 'Total',
  'admin.orders.date': 'Date',
  'admin.orders.region': 'Region',
  'admin.orders.view': 'View',
  'admin.payments.title': 'Manage Payments',
  'admin.payments.provider': 'Provider',
  'admin.payments.method': 'Method',
  'admin.payments.reference': 'Reference',
  'admin.entitlements.title': 'Manage Entitlements',
  'admin.entitlements.user': 'User',
  'admin.entitlements.product': 'Product',
  'admin.entitlements.status': 'Status',
  'admin.entitlements.revoke': 'Revoke',
  'admin.users.title': 'Manage Users',
  'admin.users.email': 'Email',
  'admin.users.role': 'Role',
  // Error codes
  'error.unauthorized': 'Please sign in to continue.',
  'error.forbidden': 'You do not have access to this.',
  'error.not_found': 'This could not be found.',
  'error.provider_unavailable': 'This payment method is not available right now.',
  'error.product_unavailable_in_region': 'This product is not available in your region.',
  'error.price_changed': 'Pricing has changed. Please review and try again.',
  'error.country_not_confirmed': 'Please confirm your billing country.',
  'error.checkout_expired': 'Your checkout session has expired. Please start again.',
  'error.payment_pending': 'Your payment is still being processed.',
  'error.payment_failed': 'Your payment could not be completed.',
  'error.invalid_payment': 'The payment information was invalid.',
  'error.entitlement_required': 'You need an active purchase to access this.',
  'error.cart_empty': 'Your cart is empty.',
  'error.cart_not_found': 'No active cart was found.',
  'error.order_not_found': 'Order not found.',
  'error.order_already_paid': 'This order has already been paid.',
  'error.order_expired': 'This order has expired.',
  'error.idempotency_conflict': 'This action was already processed.',
  'error.validation_error': 'Some information was missing or incorrect.',
  'error.rate_limited': 'Too many attempts. Please wait a moment.',
  'error.region_not_resolved': 'Could not determine your payment region.',
  'error.currency_not_supported': 'This currency is not supported.',
  'error.asset_not_found': 'This file could not be found.',
  'error.download_limit_exceeded': 'Download limit reached. Please try again later.',
  'error.webhook_signature_invalid': 'Webhook signature verification failed.',
  'error.webhook_event_duplicate': 'This event was already processed.',
  'error.internal_error': 'Something went wrong on our end. Please try again.',
  'error.method_not_allowed': 'This payment method is not allowed here.',
};

const fa: TranslationDict = {
  'brand.tagline': 'برنامه‌ریزهای دیجیتال زیبا',
  'nav.home': 'خانه',
  'nav.pricing': 'قیمت‌گذاری',
  'nav.about': 'درباره ما',
  'nav.faq': 'سوالات متداول',
  'nav.login': 'ورود',
  'nav.signup': 'ثبت‌نام',
  'nav.contact': 'تماس',
  'nav.menu': 'منو',
  'nav.close': 'بستن',
  'hero.slogan': 'زیبا برنامه‌ریزی کن، با هدف زندگی کن',
  'hero.subtitle': 'برنامه‌ریزهای دیجیتال پریمیوم که برنامه‌ریزی را ساده، لذت‌بخش و بی‌وقفه زیبا می‌کنند.',
  'hero.ctaPrimary': 'کاوش برنامه‌ریزها',
  'hero.ctaSecondary': 'بیشتر بدانید',
  'hero.scrollHint': 'برای کاوش اسکرول کنید',
  'about.title': 'درباره PlanBium',
  'about.subtitle': 'برنامه‌ریزی باید مثل یک نفس تازه باشد',
  'about.whatIsTitle': 'PlanBium چیست؟',
  'about.whatIsBody': 'PlanBium مجموعه‌ای از برنامه‌ریزهای دیجیتال زیبا است که به شما کمک می‌کند زندگی‌تان را با وضوح و هدف سازماندهی کنید. از روال‌های روزانه تا اهداف بلندمدت، هر برنامه‌ریز برای ایجاد آرامش و ساختار در روز شما طراحی شده است.',
  'about.whatItProvidesTitle': 'چه چیزی ارائه می‌دهد؟',
  'about.whatItProvidesBody': 'مجموعه‌ای گزیده از برنامه‌ریزها برای هر نیاز — برنامه‌ریزی روزانه ضروری، رهگیری اهداف حرفه‌ای، برنامه دانشجویی، روال‌های سلامتی و مدیریت کسب‌وکار. هر کدام با محتوای بومی‌سازی‌شده و پشتیبانی از چند ارز.',
  'about.whyPlanningTitle': 'چرا برنامه‌ریزی مفید است؟',
  'about.whyPlanningBody': 'برنامه‌ریزی استرس را کاهش می‌دهد، فضایی برای چیزهای مهم ایجاد می‌کند و نیت‌های مبهم را به اقدامات مشخص تبدیل می‌کند. یک برنامه خوب یک کتاب قانون سخت نیست — یک راهنمای ملایم است که شما را به جلو حرکت می‌دهد.',
  'about.whyBeautifulTitle': 'چرا برنامه‌ریزی باید زیبا باشد؟',
  'about.whyBeautifulBody': 'وقتی ابزارهایتان لذت‌بخش هستند، بیشتر از آن‌ها استفاده می‌کنید. PlanBium طراحی پریمیوم، تصاویر نرم و تعاملات مطلوب را به چیزی می‌آورد که هر روز با آن در ارتباط هستید.',
  'faq.title': 'سوالات متداول',
  'faq.subtitle': 'هر آنچه باید درباره PlanBium بدانید',
  'faq.q1': 'برنامه‌ریز دیجیتال چیست؟',
  'faq.a1': 'برنامه‌ریز دیجیتال یک فایل قابل دانلود است که می‌توانید روی تبلت، کامپیوتر یا گوشی خود استفاده کنید. جایگزین برنامه‌ریزهای کاغذی با چیزی سبک‌تر، قابل جستجو و همیشه همراه شما.',
  'faq.q2': 'کدام دستگاه‌ها پشتیبانی می‌شوند؟',
  'faq.a2': 'برنامه‌ریزهای PlanBium روی هر دستگاهی که بتواند فایل PDF باز کند کار می‌کنند — از جمله آیپد، تبلت‌های اندروید، کامپیوترهای رومیزی و گوشی‌ها. با اپلیکیشن یادداشت‌برداری مورد علاقه‌تان استفاده کنید یا چاپ کنید.',
  'faq.q3': 'کدام زبان‌ها پشتیبانی می‌شوند؟',
  'faq.a3': 'PlanBium از انگلیسی، فارسی، عربی، چینی ساده‌شده، هلندی و اسپانیایی پشتیبانی می‌کند. می‌توانید در هر زمان زبان را تغییر دهید بدون اینکه منطقه پرداخت یا ارز شما تأثیر بپذیرد.',
  'faq.q4': 'قیمت‌گذاری بین مناطق چگونه کار می‌کند؟',
  'faq.a4': 'قیمت‌گذاری بر اساس کشور صورت‌گیری پرداخت و منطقه پرداخت مرتبط آن تعیین می‌شود. ترجیح زبان شما هرگز منطقه پرداخت، ارز یا روش‌های پرداخت موجود را تغییر نمی‌دهد.',
  'faq.q5': 'آیا می‌توانم بازپرداخت بگیرم؟',
  'faq.a5': 'بله. ما طبق سیاست بازپرداخت خود، بازپرداخت ارائه می‌دهیم. لطفاً شرایط بازپرداخت را در صفحه بازپرداخت‌ها مرور کنید یا در صورت داشتن سوال با ما تماس بگیرید.',
  'pricing.title': 'برنامه‌ریز خود را انتخاب کنید',
  'pricing.subtitle': 'برنامه‌ریزهای پریمیوم برای هر سبک زندگی',
  'pricing.continue': 'ادامه',
  'pricing.perPeriod': 'یک‌بار',
  'pricing.loading': 'در حال بارگذاری برنامه‌ریزها...',
  'pricing.error': 'قیمت‌گذاری قابل بارگذاری نیست. لطفاً دوباره تلاش کنید.',
  'pricing.retry': 'تلاش مجدد',
  'pricing.noProducts': 'هیچ برنامه‌ریزی در حال حاضر موجود نیست.',
  'pricing.features': 'ویژگی‌های شامل',
  'pricing.popular': 'محبوب‌ترین',
  'footer.tagline': 'برنامه‌ریزهای دیجیتال زیبا برای زندگی با هدف‌تر.',
  'footer.rights': 'تمام حقوق محفوظ است.',
  'footer.legal.terms': 'شرایط',
  'footer.legal.privacy': 'حریم خصوصی',
  'footer.legal.refunds': 'بازپرداخت',
  'footer.nav.pricing': 'قیمت‌گذاری',
  'footer.nav.about': 'درباره ما',
  'footer.nav.contact': 'تماس',
  'footer.nav.faq': 'سوالات متداول',
  'language.label': 'زبان',
  'language.select': 'انتخاب زبان',
  'legal.terms.title': 'شرایط خدمات',
  'legal.privacy.title': 'سیاست حریم خصوصی',
  'legal.refunds.title': 'سیاست بازپرداخت',
  'legal.lastUpdated': 'آخرین به‌روزرسانی',
  'legal.placeholder': 'این صفحه با محتوای حقوقی نهایی تکمیل خواهد شد. چیدمان بصری و ساختار آماده است.',
  'contact.title': 'با ما در تماس باشید',
  'contact.subtitle': 'خوشحال می‌شویم از شما بشنویم',
  'contact.name': 'نام شما',
  'contact.email': 'ایمیل شما',
  'contact.message': 'پیام شما',
  'contact.send': 'ارسال پیام',
  'contact.sending': 'در حال ارسال...',
  'contact.sent': 'متشکرم! پیام شما ثبت شد.',
  'contact.error': 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
  'common.loading': 'در حال بارگذاری...',
  'common.error': 'مشکلی پیش آمد',
  'common.back': 'بازگشت',
  'common.backHome': 'بازگشت به خانه',
  'common.notFound.title': 'صفحه یافت نشد',
  'common.notFound.body': 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابجا شده است.',
  // Auth
  'auth.login.title': 'خوش آمدید',
  'auth.login.subtitle': 'وارد حساب PlanBium خود شوید',
  'auth.signup.title': 'ایجاد حساب',
  'auth.signup.subtitle': 'زیبا برنامه‌ریزی کردن را شروع کنید',
  'auth.email': 'ایمیل',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': 'ارسال کد',
  'auth.sendingOtp': 'در حال ارسال...',
  'auth.otpTitle': 'کد تأیید را وارد کنید',
  'auth.otpSubtitle': 'کدی به ایمیل شما ارسال شد',
  'auth.otpPlaceholder': 'کد ۶ رقمی را وارد کنید',
  'auth.verifyOtp': 'تأیید',
  'auth.verifying': 'در حال تأیید...',
  'auth.resendOtp': 'ارسال مجدد کد',
  'auth.resendIn': 'ارسال مجدد در',
  'auth.googleLogin': 'ادامه با گوگل',
  'auth.googleSignup': 'ثبت‌نام با گوگل',
  'auth.orContinueWith': 'یا',
  'auth.noAccount': 'حساب ندارید؟',
  'auth.haveAccount': 'حساب دارید؟',
  'auth.signupLink': 'ثبت‌نام',
  'auth.loginLink': 'ورود',
  'auth.otpSent': 'کد ارسال شد! ایمیل خود را بررسی کنید.',
  'auth.otpInvalid': 'کد نامعتبر. لطفاً دوباره تلاش کنید.',
  'auth.otpExpired': 'این کد منقضی شده است. لطفاً کد جدید درخواست کنید.',
  'auth.loginFailed': 'ورود ممکن نشد. لطفاً دوباره تلاش کنید.',
  'auth.signupFailed': 'ایجاد حساب ممکن نشد. لطفاً دوباره تلاش کنید.',
  'auth.authFailed': 'احراز هویت ناموفق',
  'auth.authFailedDescription': 'مشکلی در احراز هویت پیش آمد. لطفاً دوباره تلاش کنید.',
  'auth.retryAuth': 'تلاش مجدد',
  'auth.backToHome': 'بازگشت به خانه',
  'auth.dashboardRedirect': 'در حال انتقال به داشبورد...',
  // Dashboard
  'dashboard.title': 'داشبورد',
  'dashboard.welcome': 'خوش آمدید',
  'dashboard.nav.pricing': 'قیمت‌گذاری',
  'dashboard.nav.cart': 'سبد',
  'dashboard.nav.purchases': 'خریدهای من',
  'dashboard.nav.account': 'حساب',
  'dashboard.nav.logout': 'خروج',
  'dashboard.theme.gray': 'خاکستری',
  'dashboard.theme.lime': 'لیمویی',
  'dashboard.theme.blueberry': 'بلوبری',
  'dashboard.theme.label': 'تم',
  // Cart
  'cart.title': 'سبد شما',
  'cart.empty': 'سبد شما خالی است',
  'cart.emptyDescription': 'برنامه‌ریزهای ما را مرور کنید و یکی که مناسب زندگی‌تان است پیدا کنید.',
  'cart.browsePlanners': 'مرور برنامه‌ریزها',
  'cart.product': 'محصول',
  'cart.price': 'قیمت',
  'cart.quantity': 'تعداد',
  'cart.total': 'مجموع',
  'cart.checkout': 'ادامه به پرداخت',
  'cart.remove': 'حذف',
  'cart.removeConfirm': 'این مورد حذف شود؟',
  'cart.loading': 'در حال بارگذاری سبد...',
  // Purchases
  'purchases.title': 'خریدهای من',
  'purchases.empty': 'هنوز خریدی ندارید',
  'purchases.emptyDescription': 'برنامه‌ریزهای شما بعد از خرید اینجا ظاهر می‌شوند.',
  'purchases.orderId': 'سفارش',
  'purchases.date': 'تاریخ',
  'purchases.status': 'وضعیت',
  'purchases.total': 'مجموع',
  'purchases.items': 'اقلام',
  'purchases.download': 'دانلود',
  'purchases.open': 'باز کردن',
  'purchases.purchased': 'خریده شده',
  'purchases.status.pending': 'در انتظار',
  'purchases.status.paid': 'پرداخت شده',
  'purchases.status.refunded': 'بازپرداخت شده',
  'purchases.status.cancelled': 'لغو شده',
  'purchases.status.expired': 'منقضی شده',
  // Account
  'account.title': 'تنظیمات حساب',
  'account.displayName': 'نام نمایشی',
  'account.preferredLocale': 'زبان مورد نظر',
  'account.billingCountry': 'کشور صورت‌گیری',
  'account.dashboardTheme': 'تم داشبورد',
  'account.save': 'ذخیره تغییرات',
  'account.saving': 'در حال ذخیره...',
  'account.saved': 'تغییرات ذخیره شد!',
  'account.error': 'ذخیره تغییرات ممکن نشد. لطفاً دوباره تلاش کنید.',
};

const ar: TranslationDict = {
  'brand.tagline': 'مخططات رقمية جميلة',
  'nav.home': 'الرئيسية',
  'nav.pricing': 'الأسعار',
  'nav.about': 'حول',
  'nav.faq': 'الأسئلة الشائعة',
  'nav.login': 'تسجيل الدخول',
  'nav.signup': 'إنشاء حساب',
  'nav.contact': 'اتصل بنا',
  'nav.menu': 'القائمة',
  'nav.close': 'إغلاق',
  'hero.slogan': 'خطط بجمال، عش بوعي',
  'hero.subtitle': 'مخططات رقمية متميزة مصممة لجعل التخطيط بسيطاً وممتعاً وأنيقاً بلا عناء.',
  'hero.ctaPrimary': 'استكشف المخططات',
  'hero.ctaSecondary': 'اعرف المزيد',
  'hero.scrollHint': 'مرر للاستكشاف',
  'about.title': 'حول PlanBium',
  'about.subtitle': 'يجب أن يكون التخطيط مثل نفسة هواء منعش',
  'about.whatIsTitle': 'ما هو PlanBium؟',
  'about.whatIsBody': 'PlanBium مجموعة من المخططات الرقمية الجميلة التي تساعدك على تنظيم حياتك بوضوح ووعي. من الروتين اليومي إلى الأهداف طويلة المدى، كل مخطط مصمم لجلب الهدوء والبنية إلى يومك.',
  'about.whatItProvidesTitle': 'ماذا يقدم؟',
  'about.whatItProvidesBody': 'تشكيلة منتقاة من المخططات لكل حاجة — تخطيط يومي أساسي، تتبع أهداف احترافي، جداول طلابية، روتينات عافية، وإدارة أعمال. كل منها بمحتوى مترجم ودعم عملات متعددة.',
  'about.whyPlanningTitle': 'لماذا التخطيط مفيد؟',
  'about.whyPlanningBody': 'التخطيط يقلل الإرهاق، يخلق مساحة لما يهم، ويحول النوايا الغامضة إلى أجراءات ملموسة. الخطة الجيدة ليست كتاب قواعد صارم — بل مرحن لطيف يبقيك تتحرك للأمام.',
  'about.whyBeautifulTitle': 'لماذا يجب أن يكون التخطيط جميلاً؟',
  'about.whyBeautifulBody': 'عندما تكون أدواتك ممتعة في الاستخدام، تستخدمها أكثر. PlanBium يجلب تصميماً متميزاً ومرئيات ناعمة وتفاعلات مدروسة إلى شيء تتعامل معه كل يوم.',
  'faq.title': 'الأسئلة الشائعة',
  'faq.subtitle': 'كل ما تحتاج معرفته عن PlanBium',
  'faq.q1': 'ما هو المخطط الرقمي؟',
  'faq.a1': 'المخطط الرقمي ملف قابل للتنزيل يمكنك استخدامه على جهازك اللوحي أو حاسوبك أو هاتفك. يحل محل المخططات الورقية بشيء أخف وأسهل في البحث ودائماً معك.',
  'faq.q2': 'ما الأجهزة المدعومة؟',
  'faq.a2': 'مخططات PlanBium تعمل على أي جهاز يمكنه فتح ملفات PDF — بما في ذلك iPad والأجهزة اللوحية بنظام Android وأجهزة الكمبيوتر والهواتف.',
  'faq.q3': 'ما اللغات المدعومة؟',
  'faq.a3': 'يدعم PlanBium الإنجليزية والفارسية والعربية والصينية المبسطة والهولندية والإسبانية. يمكنك تبديل اللغة في أي وقت دون التأثير على منطقة الدفع أو العملة.',
  'faq.q4': 'كيف تعمل الأسعار بين المناطق؟',
  'faq.a4': 'تحدد الأسعار بناءً على بلد الفوترة ومنطقة الدفع المرتبطة به. تفضيل اللغة لا يغير أبداً منطقة الدفع أو العملة أو طرق الدفع المتاحة.',
  'faq.q5': 'هل يمكنني استرداد المال؟',
  'faq.a5': 'نعم. نقدم استرداداً وفقاً لسياسة الاسترداد الخاصة بنا. يرجى مراجعة شروط الاسترداد في صفحة الاسترداد أو الاتصال بنا إذا كان لديك أي أسئلة.',
  'pricing.title': 'اختر مخططك',
  'pricing.subtitle': 'مخططات متميزة لكل أسلوب حياة',
  'pricing.continue': 'متابعة',
  'pricing.perPeriod': 'مرة واحدة',
  'pricing.loading': 'جاري تحميل المخططات...',
  'pricing.error': 'تعذر تحميل الأسعار. يرجى المحاولة مرة أخرى.',
  'pricing.retry': 'إعادة المحاولة',
  'pricing.noProducts': 'لا توجد مخططات متاحة حالياً.',
  'pricing.features': 'الميزات المضمنة',
  'pricing.popular': 'الأكثر شيوعاً',
  'footer.tagline': 'مخططات رقمية جميلة لحياة أكثر وعياً.',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.legal.terms': 'الشروط',
  'footer.legal.privacy': 'الخصوصية',
  'footer.legal.refunds': 'الاسترداد',
  'footer.nav.pricing': 'الأسعار',
  'footer.nav.about': 'حول',
  'footer.nav.contact': 'اتصل بنا',
  'footer.nav.faq': 'الأسئلة الشائعة',
  'language.label': 'اللغة',
  'language.select': 'اختر اللغة',
  'legal.terms.title': 'شروط الخدمة',
  'legal.privacy.title': 'سياسة الخصوصية',
  'legal.refunds.title': 'سياسة الاسترداد',
  'legal.lastUpdated': 'آخر تحديث',
  'legal.placeholder': 'ستتم تعبئة هذه الصفحة بالمحتوى القانوني النهائي. التخطيط البصري والهيكل جاهزان.',
  'contact.title': 'تواصل معنا',
  'contact.subtitle': 'نحب أن نسمع منك',
  'contact.name': 'اسمك',
  'contact.email': 'بريدك الإلكتروني',
  'contact.message': 'رسالتك',
  'contact.send': 'إرسال الرسالة',
  'contact.sending': 'جاري الإرسال...',
  'contact.sent': 'شكراً! تم تسجيل رسالتك.',
  'contact.error': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  'common.loading': 'جاري التحميل...',
  'common.error': 'حدث خطأ ما',
  'common.back': 'رجوع',
  'common.backHome': 'العودة للرئيسية',
  'common.notFound.title': 'الصفحة غير موجودة',
  'common.notFound.body': 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
  // Auth
  'auth.login.title': 'مرحبا بعودتك',
  'auth.login.subtitle': 'سجل الدخول إلى حساب PlanBium',
  'auth.signup.title': 'إنشاء حساب',
  'auth.signup.subtitle': 'ابدأ التخطيط بجمال',
  'auth.email': 'البريد الإلكتروني',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': 'إرسال الرمز',
  'auth.sendingOtp': 'جاري الإرسال...',
  'auth.otpTitle': 'أدخل رمز التحقق',
  'auth.otpSubtitle': 'أرسلنا رمزاً إلى بريدك',
  'auth.otpPlaceholder': 'أدخل الرمز من 6 أرقام',
  'auth.verifyOtp': 'تحقق',
  'auth.verifying': 'جاري التحقق...',
  'auth.resendOtp': 'إعادة إرسال الرمز',
  'auth.resendIn': 'إعادة الإرسال خلال',
  'auth.googleLogin': 'المتابعة مع Google',
  'auth.googleSignup': 'إنشاء حساب مع Google',
  'auth.orContinueWith': 'أو',
  'auth.noAccount': 'ليس لديك حساب؟',
  'auth.haveAccount': 'لديك حساب بالفعل؟',
  'auth.signupLink': 'إنشاء حساب',
  'auth.loginLink': 'تسجيل الدخول',
  'auth.otpSent': 'تم إرسال الرمز! تحقق من بريدك.',
  'auth.otpInvalid': 'رمز غير صالح. حاول مرة أخرى.',
  'auth.otpExpired': 'انتهت صلاحية هذا الرمز. اطلب رمزاً جديداً.',
  'auth.loginFailed': 'تعذر تسجيل الدخول. حاول مرة أخرى.',
  'auth.signupFailed': 'تعذر إنشاء الحساب. حاول مرة أخرى.',
  'auth.authFailed': 'فشل المصادقة',
  'auth.authFailedDescription': 'حدث خطأ أثناء المصادقة. حاول مرة أخرى.',
  'auth.retryAuth': 'حاول مرة أخرى',
  'auth.backToHome': 'العودة للرئيسية',
  'auth.dashboardRedirect': 'جاري نقلك إلى لوحة التحكم...',
  // Dashboard
  'dashboard.title': 'لوحة التحكم',
  'dashboard.welcome': 'مرحباً',
  'dashboard.nav.pricing': 'الأسعار',
  'dashboard.nav.cart': 'السلة',
  'dashboard.nav.purchases': 'مشترياتي',
  'dashboard.nav.account': 'الحساب',
  'dashboard.nav.logout': 'تسجيل الخروج',
  'dashboard.theme.gray': 'رمادي',
  'dashboard.theme.lime': 'أخضر ليموني',
  'dashboard.theme.blueberry': 'توت أزرق',
  'dashboard.theme.label': 'السمة',
  // Cart
  'cart.title': 'سلتك',
  'cart.empty': 'سلتك فارغة',
  'cart.emptyDescription': 'تصفح مخططاتنا واعثر على ما يناسب حياتك.',
  'cart.browsePlanners': 'تصفح المخططات',
  'cart.product': 'المنتج',
  'cart.price': 'السعر',
  'cart.quantity': 'الكمية',
  'cart.total': 'المجموع',
  'cart.checkout': 'المتابعة إلى الدفع',
  'cart.remove': 'إزالة',
  'cart.removeConfirm': 'إزالة هذا العنصر؟',
  'cart.loading': 'جاري تحميل السلة...',
  // Purchases
  'purchases.title': 'مشترياتي',
  'purchases.empty': 'لا توجد مشتريات بعد',
  'purchases.emptyDescription': 'ستظهر مخططاتك هنا بعد الشراء.',
  'purchases.orderId': 'الطلب',
  'purchases.date': 'التاريخ',
  'purchases.status': 'الحالة',
  'purchases.total': 'المجموع',
  'purchases.items': 'العناصر',
  'purchases.download': 'تنزيل',
  'purchases.open': 'فتح',
  'purchases.purchased': 'تم الشراء',
  'purchases.status.pending': 'قيد الانتظار',
  'purchases.status.paid': 'مدفوع',
  'purchases.status.refunded': 'مسترد',
  'purchases.status.cancelled': 'ملغى',
  'purchases.status.expired': 'منتهي الصلاحية',
  // Account
  'account.title': 'إعدادات الحساب',
  'account.displayName': 'اسم العرض',
  'account.preferredLocale': 'اللغة المفضلة',
  'account.billingCountry': 'بلد الفوترة',
  'account.dashboardTheme': 'سمة لوحة التحكم',
  'account.save': 'حفظ التغييرات',
  'account.saving': 'جاري الحفظ...',
  'account.saved': 'تم حفظ التغييرات!',
  'account.error': 'تعذر حفظ التغييرات. حاول مرة أخرى.',
};

const zhHans: TranslationDict = {
  'brand.tagline': '精美的数字规划本',
  'nav.home': '首页',
  'nav.pricing': '定价',
  'nav.about': '关于',
  'nav.faq': '常见问题',
  'nav.login': '登录',
  'nav.signup': '注册',
  'nav.contact': '联系',
  'nav.menu': '菜单',
  'nav.close': '关闭',
  'hero.slogan': '优美规划，用心生活',
  'hero.subtitle': '精心设计的数字规划本，让规划变得简单、愉悦、毫不费力地优雅。',
  'hero.ctaPrimary': '探索规划本',
  'hero.ctaSecondary': '了解更多',
  'hero.scrollHint': '滚动探索',
  'about.title': '关于 PlanBium',
  'about.subtitle': '规划应该像呼吸新鲜空气一样',
  'about.whatIsTitle': 'PlanBium 是什么？',
  'about.whatIsBody': 'PlanBium 是一系列精美设计的数字规划本，帮助你清晰而有目的地组织生活。从日常作息到长期目标，每一款都旨在为你的每一天带来平静与条理。',
  'about.whatItProvidesTitle': '它提供什么？',
  'about.whatItProvidesBody': '为每种需求精选的规划本 — 基础日常规划、专业目标追踪、学生课表、健康习惯和商业管理。每个都支持本地化内容和多种货币。',
  'about.whyPlanningTitle': '为什么规划有用？',
  'about.whyPlanningBody': '规划减少焦虑，为重要的事创造空间，把模糊的意向变成具体的行动。好计划不是死板的规则书 — 而是让你不断前进的温柔向导。',
  'about.whyBeautifulTitle': '为什么规划应该很美？',
  'about.whyBeautifulBody': '当你的工具令人愉悦，你就会更常使用它们。PlanBium 将高端设计、柔和视觉和贴心交互带入你每天接触的事物中。',
  'faq.title': '常见问题',
  'faq.subtitle': '关于 PlanBium 你需要知道的一切',
  'faq.q1': '什么是数字规划本？',
  'faq.a1': '数字规划本是一个可下载的规划文件，可以在平板、电脑或手机上使用。它取代纸质规划本，更轻便、可搜索且始终随身携带。',
  'faq.q2': '支持哪些设备？',
  'faq.a2': 'PlanBium 规划本可在任何能打开 PDF 文件的设备上使用 — 包括 iPad、Android 平板、台式电脑和手机。',
  'faq.q3': '支持哪些语言？',
  'faq.a3': 'PlanBium 支持英语、波斯语、阿拉伯语、简体中文、荷兰语和西班牙语。你可以随时切换语言，不会影响你的支付区域或货币。',
  'faq.q4': '跨区域定价如何运作？',
  'faq.a4': '定价由你的账单国家及其关联的支付区域决定。你的语言偏好永远不会改变支付区域、货币或可用支付方式。',
  'faq.q5': '可以退款吗？',
  'faq.a5': '可以。我们根据退款政策提供退款。请查看退款页面上的条款，如有疑问请联系我们。',
  'pricing.title': '选择你的规划本',
  'pricing.subtitle': '为每种生活方式打造的高端规划本',
  'pricing.continue': '继续',
  'pricing.perPeriod': '一次性',
  'pricing.loading': '正在加载规划本...',
  'pricing.error': '无法加载定价。请重试。',
  'pricing.retry': '重试',
  'pricing.noProducts': '目前没有可用的规划本。',
  'pricing.features': '包含的功能',
  'pricing.popular': '最受欢迎',
  'footer.tagline': '精美数字规划本，让生活更有目标。',
  'footer.rights': '保留所有权利。',
  'footer.legal.terms': '条款',
  'footer.legal.privacy': '隐私',
  'footer.legal.refunds': '退款',
  'footer.nav.pricing': '定价',
  'footer.nav.about': '关于',
  'footer.nav.contact': '联系',
  'footer.nav.faq': '常见问题',
  'language.label': '语言',
  'language.select': '选择语言',
  'legal.terms.title': '服务条款',
  'legal.privacy.title': '隐私政策',
  'legal.refunds.title': '退款政策',
  'legal.lastUpdated': '最后更新',
  'legal.placeholder': '此页面将填充最终的法律内容。视觉布局和结构已就绪。',
  'contact.title': '联系我们',
  'contact.subtitle': '我们很乐意收到你的消息',
  'contact.name': '你的名字',
  'contact.email': '你的邮箱',
  'contact.message': '你的消息',
  'contact.send': '发送消息',
  'contact.sending': '发送中...',
  'contact.sent': '谢谢！你的消息已记录。',
  'contact.error': '出错了。请重试。',
  'common.loading': '加载中...',
  'common.error': '出错了',
  'common.back': '返回',
  'common.backHome': '返回首页',
  'common.notFound.title': '页面未找到',
  'common.notFound.body': '你寻找的页面不存在或已被移动。',
  // Auth
  'auth.login.title': '欢迎回来',
  'auth.login.subtitle': '登录你的 PlanBium 账户',
  'auth.signup.title': '创建账户',
  'auth.signup.subtitle': '开始优美规划',
  'auth.email': '邮箱',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': '发送验证码',
  'auth.sendingOtp': '发送中...',
  'auth.otpTitle': '输入验证码',
  'auth.otpSubtitle': '我们已向你的邮箱发送验证码',
  'auth.otpPlaceholder': '输入6位验证码',
  'auth.verifyOtp': '验证',
  'auth.verifying': '验证中...',
  'auth.resendOtp': '重新发送',
  'auth.resendIn': '重新发送倒计时',
  'auth.googleLogin': '使用 Google 继续',
  'auth.googleSignup': '使用 Google 注册',
  'auth.orContinueWith': '或',
  'auth.noAccount': '还没有账户？',
  'auth.haveAccount': '已有账户？',
  'auth.signupLink': '注册',
  'auth.loginLink': '登录',
  'auth.otpSent': '验证码已发送！请查看邮箱。',
  'auth.otpInvalid': '验证码无效。请重试。',
  'auth.otpExpired': '此验证码已过期。请重新获取。',
  'auth.loginFailed': '无法登录。请重试。',
  'auth.signupFailed': '无法创建账户。请重试。',
  'auth.authFailed': '认证失败',
  'auth.authFailedDescription': '认证过程中出现问题。请重试。',
  'auth.retryAuth': '重试',
  'auth.backToHome': '返回首页',
  'auth.dashboardRedirect': '正在跳转到控制台...',
  // Dashboard
  'dashboard.title': '控制台',
  'dashboard.welcome': '欢迎',
  'dashboard.nav.pricing': '定价',
  'dashboard.nav.cart': '购物车',
  'dashboard.nav.purchases': '我的购买',
  'dashboard.nav.account': '账户',
  'dashboard.nav.logout': '退出登录',
  'dashboard.theme.gray': '灰色',
  'dashboard.theme.lime': '青柠',
  'dashboard.theme.blueberry': '蓝莓',
  'dashboard.theme.label': '主题',
  // Cart
  'cart.title': '你的购物车',
  'cart.empty': '购物车为空',
  'cart.emptyDescription': '浏览我们的规划本，找到适合你的那一款。',
  'cart.browsePlanners': '浏览规划本',
  'cart.product': '产品',
  'cart.price': '价格',
  'cart.quantity': '数量',
  'cart.total': '总计',
  'cart.checkout': '前往结账',
  'cart.remove': '移除',
  'cart.removeConfirm': '移除此项？',
  'cart.loading': '正在加载购物车...',
  // Purchases
  'purchases.title': '我的购买',
  'purchases.empty': '还没有购买',
  'purchases.emptyDescription': '购买后你的规划本将显示在这里。',
  'purchases.orderId': '订单',
  'purchases.date': '日期',
  'purchases.status': '状态',
  'purchases.total': '总计',
  'purchases.items': '项目',
  'purchases.download': '下载',
  'purchases.open': '打开',
  'purchases.purchased': '已购买',
  'purchases.status.pending': '待处理',
  'purchases.status.paid': '已付款',
  'purchases.status.refunded': '已退款',
  'purchases.status.cancelled': '已取消',
  'purchases.status.expired': '已过期',
  // Account
  'account.title': '账户设置',
  'account.displayName': '显示名称',
  'account.preferredLocale': '首选语言',
  'account.billingCountry': '账单国家',
  'account.dashboardTheme': '控制台主题',
  'account.save': '保存更改',
  'account.saving': '保存中...',
  'account.saved': '更改已保存！',
  'account.error': '无法保存更改。请重试。',
};

const nl: TranslationDict = {
  'brand.tagline': 'Prachtige digitale planners',
  'nav.home': 'Home',
  'nav.pricing': 'Prijzen',
  'nav.about': 'Over ons',
  'nav.faq': 'FAQ',
  'nav.login': 'Inloggen',
  'nav.signup': 'Aanmelden',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Sluiten',
  'hero.slogan': 'Plan prachtig, leef bewust',
  'hero.subtitle': 'Premium digitale planners ontworpen om plannen eenvoudig, genietbaar en moeiteloos elegant te maken.',
  'hero.ctaPrimary': 'Bekijk planners',
  'hero.ctaSecondary': 'Meer weten',
  'hero.scrollHint': 'Scroll om te ontdekken',
  'about.title': 'Over PlanBium',
  'about.subtitle': 'Plannen moet aanvoelen als een frisse ademteug',
  'about.whatIsTitle': 'Wat is PlanBium?',
  'about.whatIsBody': 'PlanBium is een collectie prachtig vormgegeven digitale planners die je helpen je leven met helderheid en intentie te organiseren. Van dagelijkse routines tot langetermijndoelen, elke planner is ontworpen om rust en structuur in je dag te brengen.',
  'about.whatItProvidesTitle': 'Wat biedt het?',
  'about.whatItProvidesBody': 'Een zorgvuldig geselecteerd aanbod planners voor elke behoefte — essentiële dagplanning, professionele doeltacking, studentenschema\'s, wellness-routines en bedrijfsbeheer. Elke planner biedt gelokaliseerde content en ondersteunt meerdere valuta.',
  'about.whyPlanningTitle': 'Waarom is plannen nuttig?',
  'about.whyPlanningBody': 'Plannen vermindert overweldiging, creëert ruimte voor wat belangrijk is en verandert vage intenties in concrete acties. Een goed plan is geen streng regelboek — het is een zachte gids die je vooruit houdt.',
  'about.whyBeautifulTitle': 'Waarom zou plannen mooi moeten aanvoelen?',
  'about.whyBeautifulBody': 'Als je tools prettig in gebruik zijn, gebruik je ze vaker. PlanBium brengt premium ontwerp, zachte visuals en doordachte interacties naar iets waar je elke dag mee werkt.',
  'faq.title': 'Veelgestelde vragen',
  'faq.subtitle': 'Alles wat je over PlanBium moet weten',
  'faq.q1': 'Wat is een digitale planner?',
  'faq.a1': 'Een digitale planner is een downloadbaar plannerbestand dat je op je tablet, computer of telefoon kunt gebruiken. Het vervangt papieren planners door iets lichter, doorzoekbaar en altijd bij je.',
  'faq.q2': 'Welke apparaten worden ondersteund?',
  'faq.a2': 'PlanBium planners werken op elk apparaat dat PDF-bestanden kan openen — inclusief iPad, Android-tablets, desktopcomputers en telefoons.',
  'faq.q3': 'Welke talen worden ondersteund?',
  'faq.a3': 'PlanBium ondersteunt Engels, Perzisch, Arabisch, Vereenvoudigd Chinees, Nederlands en Spaans. Je kunt op elk moment van taal wisselen zonder dat dit je betaalregio of valuta beïnvloedt.',
  'faq.q4': 'Hoe werken prijzen tussen regio\'s?',
  'faq.a4': 'Prijzen worden bepaald door je factuuringsland en de bijbehorende betaalregio. Je taalvoorkeur verandert nooit je betaalregio, valuta of beschikbare betaalmethoden.',
  'faq.q5': 'Kan ik een terugbetaling krijgen?',
  'faq.a5': 'Ja. We bieden terugbetalingen aan volgens ons terugbetalingsbeleid. Bekijk de voorwaarden op onze terugbetalingenpagina of neem contact met ons op bij vragen.',
  'pricing.title': 'Kies je planner',
  'pricing.subtitle': 'Premium planners voor elke levensstijl',
  'pricing.continue': 'Doorgaan',
  'pricing.perPeriod': 'eenmalig',
  'pricing.loading': 'Planners laden...',
  'pricing.error': 'Kon prijzen niet laden. Probeer het opnieuw.',
  'pricing.retry': 'Opnieuw proberen',
  'pricing.noProducts': 'Er zijn momenteel geen planners beschikbaar.',
  'pricing.features': 'Inbegrepen functies',
  'pricing.popular': 'Populairste',
  'footer.tagline': 'Prachtige digitale planners voor een bewuster leven.',
  'footer.rights': 'Alle rechten voorbehouden.',
  'footer.legal.terms': 'Voorwaarden',
  'footer.legal.privacy': 'Privacy',
  'footer.legal.refunds': 'Terugbetalingen',
  'footer.nav.pricing': 'Prijzen',
  'footer.nav.about': 'Over ons',
  'footer.nav.contact': 'Contact',
  'footer.nav.faq': 'FAQ',
  'language.label': 'Taal',
  'language.select': 'Taal selecteren',
  'legal.terms.title': 'Servicevoorwaarden',
  'legal.privacy.title': 'Privacybeleid',
  'legal.refunds.title': 'Terugbetalingsbeleid',
  'legal.lastUpdated': 'Laatst bijgewerkt',
  'legal.placeholder': 'Deze pagina wordt gevuld met definitieve juridische inhoud. De visuele lay-out en structuur zijn klaar.',
  'contact.title': 'Neem contact op',
  'contact.subtitle': 'We horen graag van je',
  'contact.name': 'Je naam',
  'contact.email': 'Je e-mail',
  'contact.message': 'Je bericht',
  'contact.send': 'Bericht versturen',
  'contact.sending': 'Versturen...',
  'contact.sent': 'Bedankt! Je bericht is genoteerd.',
  'contact.error': 'Er ging iets mis. Probeer het opnieuw.',
  'common.loading': 'Laden...',
  'common.error': 'Er ging iets mis',
  'common.back': 'Terug',
  'common.backHome': 'Terug naar home',
  'common.notFound.title': 'Pagina niet gevonden',
  'common.notFound.body': 'De pagina die je zoekt bestaat niet of is verplaatst.',
  // Auth
  'auth.login.title': 'Welkom terug',
  'auth.login.subtitle': 'Log in op je PlanBium-account',
  'auth.signup.title': 'Account aanmaken',
  'auth.signup.subtitle': 'Begin met prachtig plannen',
  'auth.email': 'E-mail',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': 'Code versturen',
  'auth.sendingOtp': 'Versturen...',
  'auth.otpTitle': 'Voer verificatiecode in',
  'auth.otpSubtitle': 'We hebben een code naar je e-mail gestuurd',
  'auth.otpPlaceholder': 'Voer 6-cijferige code in',
  'auth.verifyOtp': 'Verifiëren',
  'auth.verifying': 'Verifiëren...',
  'auth.resendOtp': 'Code opnieuw versturen',
  'auth.resendIn': 'Opnieuw versturen over',
  'auth.googleLogin': 'Doorgaan met Google',
  'auth.googleSignup': 'Aanmelden met Google',
  'auth.orContinueWith': 'of',
  'auth.noAccount': 'Nog geen account?',
  'auth.haveAccount': 'Al een account?',
  'auth.signupLink': 'Aanmelden',
  'auth.loginLink': 'Inloggen',
  'auth.otpSent': 'Code verstuurd! Controleer je e-mail.',
  'auth.otpInvalid': 'Ongeldige code. Probeer opnieuw.',
  'auth.otpExpired': 'Deze code is verlopen. Vraag een nieuwe aan.',
  'auth.loginFailed': 'Kon niet inloggen. Probeer opnieuw.',
  'auth.signupFailed': 'Kon geen account aanmaken. Probeer opnieuw.',
  'auth.authFailed': 'Authenticatie mislukt',
  'auth.authFailedDescription': 'Er ging iets mis tijdens authenticatie. Probeer opnieuw.',
  'auth.retryAuth': 'Opnieuw proberen',
  'auth.backToHome': 'Terug naar home',
  'auth.dashboardRedirect': 'We brengen je naar je dashboard...',
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welkom',
  'dashboard.nav.pricing': 'Prijzen',
  'dashboard.nav.cart': 'Winkelwagen',
  'dashboard.nav.purchases': 'Mijn aankopen',
  'dashboard.nav.account': 'Account',
  'dashboard.nav.logout': 'Uitloggen',
  'dashboard.theme.gray': 'Grijs',
  'dashboard.theme.lime': 'Limoen',
  'dashboard.theme.blueberry': 'Bosbes',
  'dashboard.theme.label': 'Thema',
  // Cart
  'cart.title': 'Je winkelwagen',
  'cart.empty': 'Je winkelwagen is leeg',
  'cart.emptyDescription': 'Blader door onze planners en vind degene die bij je past.',
  'cart.browsePlanners': 'Planners bekijken',
  'cart.product': 'Product',
  'cart.price': 'Prijs',
  'cart.quantity': 'Aantal',
  'cart.total': 'Totaal',
  'cart.checkout': 'Doorgaan naar afrekenen',
  'cart.remove': 'Verwijderen',
  'cart.removeConfirm': 'Dit item verwijderen?',
  'cart.loading': 'Winkelwagen laden...',
  // Purchases
  'purchases.title': 'Mijn aankopen',
  'purchases.empty': 'Nog geen aankopen',
  'purchases.emptyDescription': 'Je planners verschijnen hier na aankoop.',
  'purchases.orderId': 'Bestelling',
  'purchases.date': 'Datum',
  'purchases.status': 'Status',
  'purchases.total': 'Totaal',
  'purchases.items': 'Items',
  'purchases.download': 'Downloaden',
  'purchases.open': 'Openen',
  'purchases.purchased': 'Gekocht',
  'purchases.status.pending': 'In behandeling',
  'purchases.status.paid': 'Betaald',
  'purchases.status.refunded': 'Terugbetaald',
  'purchases.status.cancelled': 'Geannuleerd',
  'purchases.status.expired': 'Verlopen',
  // Account
  'account.title': 'Accountinstellingen',
  'account.displayName': 'Weergavenaam',
  'account.preferredLocale': 'Voorkeurstaal',
  'account.billingCountry': 'Factuuringsland',
  'account.dashboardTheme': 'Dashboardthema',
  'account.save': 'Wijzigingen opslaan',
  'account.saving': 'Opslaan...',
  'account.saved': 'Wijzigingen opgeslagen!',
  'account.error': 'Kon wijzigingen niet opslaan. Probeer opnieuw.',
};

const es: TranslationDict = {
  'brand.tagline': 'Planificadores digitales hermosos',
  'nav.home': 'Inicio',
  'nav.pricing': 'Precios',
  'nav.about': 'Acerca de',
  'nav.faq': 'Preguntas frecuentes',
  'nav.login': 'Iniciar sesión',
  'nav.signup': 'Registrarse',
  'nav.contact': 'Contacto',
  'nav.menu': 'Menú',
  'nav.close': 'Cerrar',
  'hero.slogan': 'Planifica con belleza, vive con intención',
  'hero.subtitle': 'Planificadores digitales premium diseñados para hacer la planificación simple, disfrutable y elegantemente sin esfuerzo.',
  'hero.ctaPrimary': 'Explorar planificadores',
  'hero.ctaSecondary': 'Saber más',
  'hero.scrollHint': 'Desplaza para explorar',
  'about.title': 'Acerca de PlanBium',
  'about.subtitle': 'Planificar debería sentirse como una bocanada de aire fresco',
  'about.whatIsTitle': '¿Qué es PlanBium?',
  'about.whatIsBody': 'PlanBium es una colección de planificadores digitales bellamente diseñados que te ayudan a organizar tu vida con claridad e intención. Desde rutinas diarias hasta metas a largo plazo, cada planificador está diseñado para traer calma y estructura a tu día.',
  'about.whatItProvidesTitle': '¿Qué ofrece?',
  'about.whatItProvidesBody': 'Una selección curada de planificadores para cada necesidad — planificación diaria esencial, seguimiento de metas profesional, horarios de estudiante, rutinas de bienestar y gestión de negocios. Cada uno con contenido localizado y soporte para múltiples monedas.',
  'about.whyPlanningTitle': '¿Por qué es útil planificar?',
  'about.whyPlanningBody': 'Planificar reduce el agobio, crea espacio para lo que importa y convierte intenciones vagas en acciones concretas. Un buen plan no es un libro de reglas rígido — es una guía amable que te mantiene en movimiento.',
  'about.whyBeautifulTitle': '¿Por qué la planificación debería ser hermosa?',
  'about.whyBeautifulBody': 'Cuando tus herramientas son agradables de usar, las usas más a menudo. PlanBium trae diseño premium, visuales suaves e interacciones cuidadosas a algo con lo que interactúas cada día.',
  'faq.title': 'Preguntas frecuentes',
  'faq.subtitle': 'Todo lo que necesitas saber sobre PlanBium',
  'faq.q1': '¿Qué es un planificador digital?',
  'faq.a1': 'Un planificador digital es un archivo descargable que puedes usar en tu tablet, computadora o teléfono. Reemplaza los planificadores de papel con algo más ligero, buscable y siempre contigo.',
  'faq.q2': '¿Qué dispositivos son compatibles?',
  'faq.a2': 'Los planificadores de PlanBium funcionan en cualquier dispositivo que pueda abrir archivos PDF — incluyendo iPad, tablets Android, computadoras de escritorio y teléfonos.',
  'faq.q3': '¿Qué idiomas son compatibles?',
  'faq.a3': 'PlanBium admite inglés, persa, árabe, chino simplificado, holandés y español. Puedes cambiar de idioma en cualquier momento sin que afecte tu región de pago o moneda.',
  'faq.q4': '¿Cómo funcionan los precios entre regiones?',
  'faq.a4': 'Los precios se determinan según tu país de facturación y su región de pago asociada. Tu preferencia de idioma nunca cambia tu región de pago, moneda o métodos de pago disponibles.',
  'faq.q5': '¿Puedo obtener un reembolso?',
  'faq.a5': 'Sí. Ofrecemos reembolsos según nuestra política de reembolso. Revisa los términos en nuestra página de reembolsos o contáctanos si tienes preguntas.',
  'pricing.title': 'Elige tu planificador',
  'pricing.subtitle': 'Planificadores premium para cada estilo de vida',
  'pricing.continue': 'Continuar',
  'pricing.perPeriod': 'pago único',
  'pricing.loading': 'Cargando planificadores...',
  'pricing.error': 'No se pudieron cargar los precios. Inténtalo de nuevo.',
  'pricing.retry': 'Reintentar',
  'pricing.noProducts': 'No hay planificadores disponibles actualmente.',
  'pricing.features': 'Funciones incluidas',
  'pricing.popular': 'Más popular',
  'footer.tagline': 'Hermosos planificadores digitales para una vida más intencional.',
  'footer.rights': 'Todos los derechos reservados.',
  'footer.legal.terms': 'Términos',
  'footer.legal.privacy': 'Privacidad',
  'footer.legal.refunds': 'Reembolsos',
  'footer.nav.pricing': 'Precios',
  'footer.nav.about': 'Acerca de',
  'footer.nav.contact': 'Contacto',
  'footer.nav.faq': 'Preguntas frecuentes',
  'language.label': 'Idioma',
  'language.select': 'Seleccionar idioma',
  'legal.terms.title': 'Términos de servicio',
  'legal.privacy.title': 'Política de privacidad',
  'legal.refunds.title': 'Política de reembolso',
  'legal.lastUpdated': 'Última actualización',
  'legal.placeholder': 'Esta página se completará con contenido legal finalizado. El diseño visual y la estructura están listos.',
  'contact.title': 'Ponte en contacto',
  'contact.subtitle': 'Nos encantaría saber de ti',
  'contact.name': 'Tu nombre',
  'contact.email': 'Tu correo electrónico',
  'contact.message': 'Tu mensaje',
  'contact.send': 'Enviar mensaje',
  'contact.sending': 'Enviando...',
  'contact.sent': '¡Gracias! Tu mensaje ha sido registrado.',
  'contact.error': 'Algo salió mal. Inténtalo de nuevo.',
  'common.loading': 'Cargando...',
  'common.error': 'Algo salió mal',
  'common.back': 'Volver',
  'common.backHome': 'Volver al inicio',
  'common.notFound.title': 'Página no encontrada',
  'common.notFound.body': 'La página que buscas no existe o ha sido movida.',
  // Auth
  'auth.login.title': 'Bienvenido de nuevo',
  'auth.login.subtitle': 'Inicia sesión en tu cuenta de PlanBium',
  'auth.signup.title': 'Crear cuenta',
  'auth.signup.subtitle': 'Empieza a planificar con belleza',
  'auth.email': 'Correo electrónico',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.sendOtp': 'Enviar código',
  'auth.sendingOtp': 'Enviando...',
  'auth.otpTitle': 'Introduce el código de verificación',
  'auth.otpSubtitle': 'Enviamos un código a tu correo',
  'auth.otpPlaceholder': 'Introduce el código de 6 dígitos',
  'auth.verifyOtp': 'Verificar',
  'auth.verifying': 'Verificando...',
  'auth.resendOtp': 'Reenviar código',
  'auth.resendIn': 'Reenviar en',
  'auth.googleLogin': 'Continuar con Google',
  'auth.googleSignup': 'Registrarse con Google',
  'auth.orContinueWith': 'o',
  'auth.noAccount': '¿No tienes cuenta?',
  'auth.haveAccount': '¿Ya tienes cuenta?',
  'auth.signupLink': 'Registrarse',
  'auth.loginLink': 'Iniciar sesión',
  'auth.otpSent': '¡Código enviado! Revisa tu correo.',
  'auth.otpInvalid': 'Código inválido. Inténtalo de nuevo.',
  'auth.otpExpired': 'Este código ha expirado. Solicita uno nuevo.',
  'auth.loginFailed': 'No se pudo iniciar sesión. Inténtalo de nuevo.',
  'auth.signupFailed': 'No se pudo crear la cuenta. Inténtalo de nuevo.',
  'auth.authFailed': 'Error de autenticación',
  'auth.authFailedDescription': 'Algo salió mal durante la autenticación. Inténtalo de nuevo.',
  'auth.retryAuth': 'Intentar de nuevo',
  'auth.backToHome': 'Volver al inicio',
  'auth.dashboardRedirect': 'Llevándote a tu panel...',
  // Dashboard
  'dashboard.title': 'Panel',
  'dashboard.welcome': 'Bienvenido',
  'dashboard.nav.pricing': 'Precios',
  'dashboard.nav.cart': 'Carrito',
  'dashboard.nav.purchases': 'Mis compras',
  'dashboard.nav.account': 'Cuenta',
  'dashboard.nav.logout': 'Cerrar sesión',
  'dashboard.theme.gray': 'Gris',
  'dashboard.theme.lime': 'Lima',
  'dashboard.theme.blueberry': 'Arándano',
  'dashboard.theme.label': 'Tema',
  // Cart
  'cart.title': 'Tu carrito',
  'cart.empty': 'Tu carrito está vacío',
  'cart.emptyDescription': 'Explora nuestros planificadores y encuentra el que se adapte a tu vida.',
  'cart.browsePlanners': 'Explorar planificadores',
  'cart.product': 'Producto',
  'cart.price': 'Precio',
  'cart.quantity': 'Cant',
  'cart.total': 'Total',
  'cart.checkout': 'Proceder al pago',
  'cart.remove': 'Quitar',
  'cart.removeConfirm': '¿Quitar este elemento?',
  'cart.loading': 'Cargando carrito...',
  // Purchases
  'purchases.title': 'Mis compras',
  'purchases.empty': 'Aún no hay compras',
  'purchases.emptyDescription': 'Tus planificadores aparecerán aquí después de la compra.',
  'purchases.orderId': 'Pedido',
  'purchases.date': 'Fecha',
  'purchases.status': 'Estado',
  'purchases.total': 'Total',
  'purchases.items': 'Elementos',
  'purchases.download': 'Descargar',
  'purchases.open': 'Abrir',
  'purchases.purchased': 'Comprado',
  'purchases.status.pending': 'Pendiente',
  'purchases.status.paid': 'Pagado',
  'purchases.status.refunded': 'Reembolsado',
  'purchases.status.cancelled': 'Cancelado',
  'purchases.status.expired': 'Expirado',
  // Account
  'account.title': 'Configuración de cuenta',
  'account.displayName': 'Nombre para mostrar',
  'account.preferredLocale': 'Idioma preferido',
  'account.billingCountry': 'País de facturación',
  'account.dashboardTheme': 'Tema del panel',
  'account.save': 'Guardar cambios',
  'account.saving': 'Guardando...',
  'account.saved': '¡Cambios guardados!',
  'account.error': 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
};

export const translations: Record<string, TranslationDict> = { en, fa, ar, 'zh-Hans': zhHans, nl, es };

export function translate(locale: string, key: TranslationKey): string {
  const dict = translations[locale] ?? translations.en;
  return dict[key] ?? translations.en[key] ?? key;
}
