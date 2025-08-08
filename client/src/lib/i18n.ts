import { createContext, useContext } from "react";

export type Language = "en" | "lo" | "th";

export interface Translations {
  // Navigation
  home: string;
  scanner: string;
  history: string;
  exchange: string;
  profile: string;

  accountDetails: string;
  nationality: string;
  phoneNumber: string;
  passportNumber: string;
  accountType: string;
  vendorStatus: string;
  businessName: string;
  businessType: string;
  walletBalances: string;

  adminDashboard: string;
  signOut: string;
  verified: string;
  unverified: string;
  pending: string;
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  back: string;
  next: string;

  // Wallet
  wallet: string;
  balance: string;
  topUp: string;
  send: string;
  receive: string;

  // QR Scanner
  scanQR: string;
  scanQRCode: string;
  amount: string;
  description: string;
  vendorId: string;
  confirmPayment: string;
  paymentSuccessful: string;

  // Vendor
  vendor: string;
  vendorTools: string;
  acceptPayments: string;
  generateQrCode: string; // updated key to match HomePage
  recentTransactions: string;

  // Exchange
  exchangeRates: string;
  currencyExchange: string;

  // Profile
  settings: string;
  language: string;
  logout: string;

  // Transaction History
  transactionHistory: string;
  noTransactions: string;

  // Auth
  login: string;
  register: string;
  username: string;
  email: string;
  password: string;

  // Currencies
  lak: string;
  usd: string;
  thb: string;

  // Additional keys used in HomePage
  welcomeBack: string;
  hello: string;
  accountStatus: string;
  verifiedAccount: string;
  pendingVerification: string;

  // New payment processing translations
  pay: string;
  paymentDetails: string;
  paymentMethod: string;
  creditDebitCard: string;
  bankTransfer: string;
  processingFee: string;
  total: string;
  continueToPayment: string;
  completePayment: string;
  paymentReady: string;
  completePaymentDetails: string;
  paymentFailed: string;
  paymentNotCompleted: string;
  paymentSystemNotReady: string;
  paymentServiceError: string;
  networkError: string;
  invalidAmount: string;
  enterValidAmount: string;
  amountTooSmall: string;
  minimumAmount: string;
  invalidCurrency: string;
  selectValidCurrency: string;
  paymentVerificationFailed: string;
  unexpectedPaymentError: string;
  walletToppedUp: string;
  comingSoon: string;
  // Add these to your translations interface and objects
  adminPortal: string;
  merchantPortal: string;
  acceptPaymentsWithQR: string;
  welcome: string;
  todaysPerformance: string;
  earningsSummary: string;
  todaysEarnings: string;
  paymentsToday: string;
  recentPayments: string;
  settled: string;
  paymentReceived: string;
  noPaymentsReceived: string;
  generateQRForFirstPayment: string;
  dateNotAvailable: string;
  noClientSecret: string;
  selectCurrency: string;
  paymentFailedGeneric: string;
  paymentIntentFailed: string;
  processing: string;
  paymentError: string;

  viewAllTransactions: string;
  manageVendorsAndSystem: string;
  manageYourBusiness: string;
  loadingWalletInformation: string;
  availableBalance: string;
  userRoleAndPermissions: string;
  identityDocument: string;
  contactInformation: string;
  countryOfOrigin: string;
  activeWallets: string;
  totalBalance: string;
  noWalletsFound: string;
  availableForSpending: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    dateNotAvailable: "Date not available",
    // Navigation
    home: "Home",
    scanner: "Scanner",
    history: "History",
    exchange: "Exchange",
    profile: "Profile",

    accountDetails: "Account Details",
    nationality: "Nationality",
    phoneNumber: "Phone Number",
    passportNumber: "Passport Number",
    accountType: "Account Type",
    vendorStatus: "Vendor Status",
    businessName: "Business Name",
    businessType: "Business Type",
    walletBalances: "Wallet Balances",
    merchantPortal: "Merchant Portal",
    adminDashboard: "Admin Dashboard",
    signOut: "Sign Out",
    verified: "Verified",
    unverified: "Unverified",
    pending: "Pending",
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    back: "Back",
    next: "Next",

    // Wallet
    wallet: "Wallet",
    balance: "Balance",
    topUp: "Top Up",
    send: "Send",
    receive: "Receive",

    // QR Scanner
    scanQR: "Scan QR",
    scanQRCode: "Scan QR Code",
    amount: "Amount",
    description: "Description",
    vendorId: "Vendor ID",
    confirmPayment: "Confirm Payment",
    paymentSuccessful: "Payment Successful",

    // Vendor
    vendor: "Vendor",
    vendorTools: "Vendor Tools",
    acceptPayments: "Accept payments from tourists",
    generateQrCode: "Generate QR Code", // matches HomePage usage
    recentTransactions: "Recent Transactions",

    // Exchange
    exchangeRates: "Exchange Rates",
    currencyExchange: "Currency Exchange",

    // Profile
    settings: "Settings",
    language: "Language",
    logout: "Logout",

    // Transaction History
    transactionHistory: "Transaction History",
    noTransactions: "No transactions found",

    // Auth
    login: "Login",
    register: "Register",
    username: "Username",
    email: "Email",
    password: "Password",

    // Currencies
    lak: "Lao Kip",
    usd: "US Dollar",
    thb: "Thai Baht",

    // Additional keys
    welcomeBack: "Welcome back",
    hello: "Hello",
    accountStatus: "Account status",
    verifiedAccount: "Verified account",
    pendingVerification: "Pending verification",

    // New payment processing translations
    paymentError: "Payment Error",
    paymentDetails: "Payment Details",
    paymentMethod: "Payment Method",
    creditDebitCard: "Credit/Debit Card",
    bankTransfer: "Bank Transfer",
    processingFee: "Processing Fee",
    total: "Total",
    continueToPayment: "Continue to Payment",
    completePayment: "Complete Payment",
    paymentReady: "Payment Ready",
    completePaymentDetails: "Please complete your payment details",
    paymentFailed: "Payment failed. Please try again.",
    paymentNotCompleted: "Payment not completed. Please try again.",
    paymentSystemNotReady: "Payment system not ready. Please try again.",
    paymentServiceError: "Payment service error. Please try again later.",
    networkError: "Network error. Please check your connection.",
    invalidAmount: "Invalid Amount",
    enterValidAmount: "Please enter a valid positive amount",
    amountTooSmall: "Amount Too Small",
    minimumAmount: "Minimum amount is {amount}",
    invalidCurrency: "Invalid Currency",
    selectValidCurrency: "Please select a valid currency",
    paymentVerificationFailed: "Payment verification failed. Contact support.",
    unexpectedPaymentError: "An unexpected payment error occurred.",
    walletToppedUp: "Your wallet has been topped up!",
    comingSoon: "Coming Soon",
    noClientSecret: "No Client Secret",

    adminPortal: "Admin Portal",

    acceptPaymentsWithQR: "Accept Payments with QR",
    welcome: "Welcome",
    todaysPerformance: "Today's Performance",
    earningsSummary: "Earnings Summary",
    todaysEarnings: "Today's Earnings",
    paymentsToday: "Payments Today",
    recentPayments: "Recent Payments",
    settled: "Settled",
    paymentReceived: "Payment Received",
    noPaymentsReceived: "No payments received yet",
    generateQRForFirstPayment: "Generate QR for your first payment",

    selectCurrency: "Select Currency",
    paymentFailedGeneric: "Payment failed. Please try again.",
    paymentIntentFailed: "Failed to create payment. Please try again.",
    processing: "Processing...",
    pay: "Pay",
    viewAllTransactions: "View all transactions",
    manageVendorsAndSystem: "Manage vendors and system",
    manageYourBusiness: "Manage your business",
    loadingWalletInformation: "Loading wallet information...",
    availableBalance: "Available balance",
    userRoleAndPermissions: "User role and permissions",
    identityDocument: "Identity document",
    contactInformation: "Contact information",
    countryOfOrigin: "Country of origin",
    activeWallets: "Active wallets",
    totalBalance: "Total balance",
     noWalletsFound: "No wallets found. Please contact support.",
    availableForSpending: "Available for spending"
    
  },

  lo: {
    dateNotAvailable: "ບໍ່ມີວັນທີ",
    // Navigation
    home: "ໜ້າຫຼັກ",
    scanner: "ສະແກນ",
    history: "ປະຫວັດ",
    exchange: "ແລກປ່ຽນ",
    profile: "ໂປຣໄຟລ໌",
    accountDetails: "ລາຍລະອຽດບັນຊີ",
    nationality: "ສັນຊາດ",
    phoneNumber: "ເບີໂທລະສັບ",
    passportNumber: "ເລກທີ່ຜ່ານແດນ",
    accountType: "ປະເພດບັນຊີ",
    vendorStatus: "ສະຖານະຜູ້ຂາຍ",
    businessName: "ຊື່ທຸລະກິດ",
    businessType: "ປະເພດທຸລະກິດ",
    walletBalances: "ຍອດເງິນໃນກະເປົ໋າ",
    merchantPortal: "ສູນຜູ້ຂາຍ",
    adminDashboard: "ແຜງຄວບຄຸມຜູ້ດູແລ",
    signOut: "ອອກຈາກລະບົບ",
    verified: "ຢືນຢັນແລ້ວ",
    unverified: "ຍັງບໍ່ທັນຢືນຢັນ",
    pending: "ລໍຖ້າຢືນຢັນ",
    // Common
    loading: "ກຳລັງໂຫລດ...",
    error: "ຜິດພາດ",
    success: "ສຳເລັດ",
    cancel: "ຍົກເລີກ",
    confirm: "ຢືນຢັນ",
    save: "ບັນທຶກ",
    back: "ກັບຄືນ",
    next: "ຕໍ່ໄປ",

    // Wallet
    wallet: "ກະເປົ໋າເງິນ",
    balance: "ຍອດເງິນ",
    topUp: "ເຕີມເງິນ",
    send: "ສົ່ງ",
    receive: "ຮັບ",

    // QR Scanner
    scanQR: "ສະແກນ QR",
    scanQRCode: "ສະແກນລະຫັດ QR",
    amount: "ຈຳນວນເງິນ",
    description: "ລາຍລະອຽດ",
    vendorId: "ລະຫັດຜູ້ຂາຍ",
    confirmPayment: "ຢືນຢັນການຈ່າຍເງິນ",
    paymentSuccessful: "ຈ່າຍເງິນສຳເລັດ",

    // Vendor
    vendor: "ຜູ້ຂາຍ",
    vendorTools: "ເຄື່ອງມືຜູ້ຂາຍ",
    acceptPayments: "ຮັບການຈ່າຍເງິນຈາກນັກທ່ອງທ່ຽວ",
    generateQrCode: "ສ້າງລະຫັດ QR",
    recentTransactions: "ທຸລະກຳລ່າສຸດ",

    // Exchange
    exchangeRates: "ອັດຕາແລກປ່ຽນ",
    currencyExchange: "ແລກປ່ຽນເງິນຕາ",

    // Profile
    settings: "ການຕັ້ງຄ່າ",
    language: "ພາສາ",
    logout: "ອອກຈາກລະບົບ",

    // Transaction History
    transactionHistory: "ປະຫວັດທຸລະກຳ",
    noTransactions: "ບໍ່ມີທຸລະກຳ",

    // Auth
    login: "ເຂົ້າສູ່ລະບົບ",
    register: "ລົງທະບຽນ",
    username: "ຊື່ຜູ້ໃຊ້",
    email: "ອີເມວ",
    password: "ລະຫັດຜ່ານ",

    // Currencies
    lak: "ກີບລາວ",
    usd: "ໂດລາສະຫະລັດ",
    thb: "ບາດໄທ",

    // Additional keys
    welcomeBack: "ຍິນດີຕ້ອນຮັບ",
    hello: "ສະບາຍດີ",
    accountStatus: "ສະຖານະບັນຊີ",
    verifiedAccount: "ບັນຊີຢືນຢັນແລ້ວ",
    pendingVerification: "ກຳລັງຢືນຢັນ",
    // New payment processing translations
    paymentError: "ຜິດພາດການຈ່າຍເງິນ",
    paymentDetails: "ລາຍລະອຽດການຈ່າຍເງິນ",
    paymentMethod: "ວິທີການຈ່າຍເງິນ",
    creditDebitCard: "ບັດເຄຣດິດ/ບັດເດບິດ",
    bankTransfer: "ໂອນທະນາຄານ",
    processingFee: "ຄ່າທຳນຽມ",
    total: "ລວມ",
    continueToPayment: "ດຳເນີນການຈ່າຍເງິນ",
    completePayment: "ຈ່າຍເງິນສຳເລັດ",
    paymentReady: "ພ້ອມຈ່າຍເງິນ",
    completePaymentDetails: "ກະລຸນາຕື່ມລາຍລະອຽດການຈ່າຍເງິນ",
    paymentFailed: "ການຈ່າຍເງິນລົ້ມເຫລວ. ກະລຸນາລອງໃໝ່.",
    paymentNotCompleted: "ການຈ່າຍເງິນບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.",
    paymentSystemNotReady: "ລະບົບຈ່າຍເງິນບໍ່ພ້ອມ. ກະລຸນາລອງໃໝ່.",
    paymentServiceError: "ຜິດພາດລະບົບຈ່າຍເງິນ. ກະລຸນາລອງໃໝ່ພາຍຫລັງ.",
    networkError: "ຜິດພາດເຄືອຂ່າຍ. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່.",
    invalidAmount: "ຈຳນວນເງິນບໍ່ຖືກຕ້ອງ",
    enterValidAmount: "ກະລຸນາໃສ່ຈຳນວນເງິນທີ່ຖືກຕ້ອງ",
    amountTooSmall: "ຈຳນວນເງິນນ້ອຍເກີນໄປ",
    minimumAmount: "ຈຳນວນເງິນຕໍ່າສຸດແມ່ນ {amount}",
    invalidCurrency: "ສະກຸນເງິນບໍ່ຖືກຕ້ອງ",
    selectValidCurrency: "ກະລຸນາເລືອກສະກຸນເງິນທີ່ຖືກຕ້ອງ",
    paymentVerificationFailed:
      "ການຢັ້ງຢືນການຈ່າຍເງິນລົ້ມເຫລວ. ຕິດຕໍ່ຜູ້ໃຫ້ບໍລິການ.",
    unexpectedPaymentError: "ເກີດຂໍ້ຜິດພາດໃນການຈ່າຍເງິນ.",
    walletToppedUp: "ທ່ານໄດ້ເຕີມເງິນສຳເລັດແລ້ວ!",
    comingSoon: "ຈະມາໃນໄວໆນີ້",
    noClientSecret: "ບໍ່ມີລະຫັດລັບລະດັບລູກຄ້າ",

    adminPortal: "ສູນບໍລິຫານ",
    acceptPaymentsWithQR: "ຮັບການຈ່າຍເງິນດ້ວຍ QR",
    welcome: "ຍິນດີຕ້ອນຮັບ",
    todaysPerformance: "ຜົນງານມື້ນີ້",
    earningsSummary: "ສະຫຼຸບລາຍຮັບ",
    todaysEarnings: "ລາຍຮັບມື້ນີ້",
    paymentsToday: "ການຈ່າຍເງິນມື້ນີ້",
    recentPayments: "ການຈ່າຍເງິນຫລ້າສຸດ",
    settled: "ຈ່າຍແລ້ວ",
    paymentReceived: "ໄດ້ຮັບການຈ່າຍເງິນ",
    noPaymentsReceived: "ຍັງບໍ່ມີການຈ່າຍເງິນ",
    generateQRForFirstPayment: "ສ້າງ QR ສຳລັບການຈ່າຍເງິນຄັ້ງທຳອິດ",

    selectCurrency: "ເລືອກສະກຸນເງິນ",
    paymentFailedGeneric: "ການຈ່າຍເງິນລົ້ມເຫລວ. ກະລຸນາລອງໃໝ່.",
    paymentIntentFailed: "ສ້າງການຈ່າຍເງິນບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.",
    processing: "ກຳລັງດຳເນີນການ...",
    pay: "ຈ່າຍ",
    viewAllTransactions: "ເບິ່ງທຸລະກຳທັງໝົດ",
    manageVendorsAndSystem: "ຈັດການຜູ້ຂາຍ ແລະ ລະບົບ",
    manageYourBusiness: "ຈັດການທຸລະກິດຂອງທ່ານ",
    loadingWalletInformation: "ກຳລັງໂຫລດຂໍ້ມູນກະເປົ໋າເງິນ...",
    availableBalance: "ຍອດເງິນທີ່ມີຢູ່",
    userRoleAndPermissions: "ບົດບາດ ແລະ ສິດທິຜູ້ໃຊ້",
    identityDocument: "ເອກະສານຢັ້ງຢືນຕົວຕົນ",
    contactInformation: "ຂໍ້ມູນຕິດຕໍ່",
    countryOfOrigin: "ປະເທດເດີມ",
    activeWallets: "ກະເປົ໋າເງິນທີ່ໃຊ້ຢູ່",
    totalBalance: "ຍອດເງິນທັງໝົດ",
     noWalletsFound: "ບໍ່ພົບກະເປົ໋າເງິນ. ກະລຸນາຕິດຕໍ່ຜູ້ໃຫ້ບໍລິການ.",
    availableForSpending: "ສາມາດໃຊ້ຈ່າຍໄດ້"
  },

  th: {
    dateNotAvailable: "ไม่มีวันที่",
    // Navigation
    home: "หน้าหลัก",
    scanner: "สแกน",
    history: "ประวัติ",
    exchange: "แลกเปลี่ยน",
    profile: "โปรไฟล์",

    accountDetails: "รายละเอียดบัญชี",
    nationality: "สัญชาติ",
    phoneNumber: "หมายเลขโทรศัพท์",
    passportNumber: "เลขที่พาสปอร์ต",
    accountType: "ประเภทบัญชี",
    vendorStatus: "สถานะผู้ขาย",
    businessName: "ชื่อธุรกิจ",
    businessType: "ประเภทธุรกิจ",
    walletBalances: "ยอดเงินในกระเป๋าเงิน",
    adminDashboard: "แผงควบคุมผู้ดูแล",
    signOut: "ออกจากระบบ",
    verified: "ยืนยันแล้ว",
    unverified: "ยังไม่ยืนยัน",
    pending: "รอยืนยัน",
    // Common
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    save: "บันทึก",
    back: "กลับ",
    next: "ถัดไป",

    // Wallet
    wallet: "กระเป๋าเงิน",
    balance: "ยอดเงิน",
    topUp: "เติมเงิน",
    send: "ส่ง",
    receive: "รับ",

    // QR Scanner
    scanQR: "สแกน QR",
    scanQRCode: "สแกนรหัส QR",
    amount: "จำนวนเงิน",
    description: "รายละเอียด",
    vendorId: "รหัสผู้ขาย",
    confirmPayment: "ยืนยันการชำระเงิน",
    paymentSuccessful: "ชำระเงินสำเร็จ",

    // Vendor
    vendor: "ผู้ขาย",
    vendorTools: "เครื่องมือผู้ขาย",
    acceptPayments: "รับการชำระเงินจากนักท่องเที่ยว",
    generateQrCode: "สร้างรหัส QR",
    recentTransactions: "ธุรกรรมล่าสุด",

    // Exchange
    exchangeRates: "อัตราแลกเปลี่ยน",
    currencyExchange: "แลกเปลี่ยนสกุลเงิน",

    // Profile
    settings: "การตั้งค่า",
    language: "ภาษา",
    logout: "ออกจากระบบ",

    // Transaction History
    transactionHistory: "ประวัติธุรกรรม",
    noTransactions: "ไม่มีธุรกรรม",

    // Auth
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    username: "ชื่อผู้ใช้",
    email: "อีเมล",
    password: "รหัสผ่าน",

    // Currencies
    lak: "กีบลาว",
    usd: "ดอลลาร์สหรัฐ",
    thb: "บาทไทย",

    // Additional keys
    welcomeBack: "ยินดีต้อนรับกลับ",
    hello: "สวัสดี",
    accountStatus: "สถานะบัญชี",
    verifiedAccount: "บัญชีที่ยืนยันแล้ว",
    pendingVerification: "รอยืนยัน",
    // New payment processing translations
    paymentError: "ข้อผิดพลาดการชำระเงิน",
    paymentDetails: "รายละเอียดการชำระเงิน",
    paymentMethod: "วิธีการชำระเงิน",
    creditDebitCard: "บัตรเครดิต/เดบิต",
    bankTransfer: "โอนเงินธนาคาร",
    processingFee: "ค่าธรรมเนียม",
    total: "รวมทั้งหมด",
    continueToPayment: "ดำเนินการชำระเงิน",
    completePayment: "ชำระเงินเสร็จสิ้น",
    paymentReady: "พร้อมชำระเงิน",
    completePaymentDetails: "กรุณากรอกรายละเอียดการชำระเงิน",
    paymentFailed: "การชำระเงินล้มเหลว. กรุณาลองอีกครั้ง.",
    paymentNotCompleted: "การชำระเงินไม่สมบูรณ์. กรุณาลองอีกครั้ง.",
    paymentSystemNotReady: "ระบบชำระเงินไม่พร้อมใช้งาน. กรุณาลองอีกครั้ง.",
    paymentServiceError:
      "เกิดข้อผิดพลาดในการชำระเงิน. กรุณาลองอีกครั้งในภายหลัง.",
    networkError: "เกิดข้อผิดพลาดเครือข่าย. กรุณาตรวจสอบการเชื่อมต่อ.",
    invalidAmount: "จำนวนเงินไม่ถูกต้อง",
    enterValidAmount: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
    amountTooSmall: "จำนวนเงินน้อยเกินไป",
    minimumAmount: "จำนวนเงินขั้นต่ำคือ {amount}",
    invalidCurrency: "สกุลเงินไม่ถูกต้อง",
    selectValidCurrency: "กรุณาเลือกสกุลเงินที่ถูกต้อง",
    paymentVerificationFailed:
      "การยืนยันการชำระเงินล้มเหลว. กรุณาติดต่อเจ้าหน้าที่.",
    unexpectedPaymentError: "เกิดข้อผิดพลาดในการชำระเงิน",
    walletToppedUp: "เติมเงินเข้าสู่กระเป๋าเงินสำเร็จแล้ว!",
    comingSoon: "เร็วๆ นี้",
    noClientSecret: "ไม่มี Client Secret",

    adminPortal: "แอดมินพอร์ทัล",
    merchantPortal: "พอร์ทัลผู้ขาย",
    acceptPaymentsWithQR: "รับชำระเงินด้วย QR",
    welcome: "ยินดีต้อนรับ",
    todaysPerformance: "ผลงานวันนี้",
    earningsSummary: "สรุปรายได้",
    todaysEarnings: "รายได้วันนี้",
    paymentsToday: "การชำระเงินวันนี้",
    recentPayments: "การชำระเงินล่าสุด",
    settled: "ชำระแล้ว",
    paymentReceived: "ได้รับเงินแล้ว",
    noPaymentsReceived: "ยังไม่มีการชำระเงิน",
    generateQRForFirstPayment: "สร้าง QR สำหรับการชำระเงินครั้งแรก",
    selectCurrency: "เลือกสกุลเงิน",
    paymentFailedGeneric: "การชำระเงินล้มเหลว กรุณาลองอีกครั้ง",
    paymentIntentFailed: "สร้างการชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง",
    processing: "กำลังดำเนินการ...",
    pay: "ชำระเงิน",
    viewAllTransactions: "ดูธุรกรรมทั้งหมด",
    manageVendorsAndSystem: "จัดการผู้ขายและระบบ",
    manageYourBusiness: "จัดการธุรกิจของคุณ",
    loadingWalletInformation: "กำลังโหลดข้อมูลกระเป๋าเงิน...",
    availableBalance: "ยอดเงินที่มี",
    userRoleAndPermissions: "บทบาทและสิทธิ์ผู้ใช้",
    identityDocument: "เอกสารยืนยันตัวตน",
    contactInformation: "ข้อมูลติดต่อ",
    countryOfOrigin: "ประเทศต้นทาง",
    activeWallets: "กระเป๋าเงินที่ใช้งาน",
    totalBalance: "ยอดเงินรวม",
     noWalletsFound: "ไม่พบกระเป๋าเงิน กรุณาติดต่อฝ่ายสนับสนุน",

    availableForSpending: "สามารถใช้จ่ายได้"
  },
};

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
