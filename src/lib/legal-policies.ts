// Terms of Service & Privacy Policy — bilingual templates. NOT legal advice.
import type { Locale } from "./i18n/config";
import type { LegalDocument } from "./legal";

export const TERMS_UPDATED = "2026-06-15";
export const PRIVACY_UPDATED = "2026-06-15";

const termsEn: LegalDocument = {
  title: "Terms of Service",
  updatedLabel: `Last updated: ${TERMS_UPDATED}`,
  intro:
    'These Terms of Service ("Terms") govern your access to and use of PawSure ("the Platform", "we", "us"). By creating an account or using the Platform, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Platform.',
  sections: [
    {
      heading: "1. Who may use PawSure",
      body: [
        "You must be at least 18 years old (or the age of majority where you live) and able to form a binding contract.",
        "You are responsible for the accuracy of information you provide and for all activity under your account.",
      ],
    },
    {
      heading: "2. Accounts & security",
      body: [
        "You must provide a valid email and keep your credentials confidential. Notify us promptly if you suspect unauthorized access.",
        "Owner accounts may only be signed in on one device at a time; shop and facility accounts may use multiple devices.",
        "We may suspend or terminate accounts that violate these Terms or pose a security or abuse risk.",
      ],
    },
    {
      heading: "3. What PawSure provides",
      body: [
        "PawSure is a software tool for recording, organizing and sharing pet health information — including health logs, reminders, AI-assisted features, and digital health passports issued by participating shops or breeders.",
        "We do not provide veterinary care, diagnosis or treatment. See our Disclaimer for limitations on AI and health information.",
      ],
    },
    {
      heading: "4. Your content",
      body: [
        "You retain ownership of content you upload. You grant us a limited license to host, process and display it solely to operate the Platform (including backups and AI features you invoke).",
        "You must have the right to upload content and must not upload unlawful, misleading or infringing material.",
      ],
    },
    {
      heading: "5. Health passports & transfers",
      body: [
        "Passports reflect records entered on the Platform by issuers. PawSure does not certify an animal's health.",
        "Passport handovers and any warranties or guarantees between buyer and seller are agreements between those parties, not with PawSure.",
      ],
    },
    {
      heading: "6. Paid plans",
      body: [
        "Some features require paid subscriptions or add-ons, billed through Stripe (or other payment providers we enable). Prices are shown at checkout in USD unless stated otherwise.",
        "Fees are generally non-refundable except where required by law or explicitly stated. You may cancel subscriptions through the billing portal or account settings.",
      ],
    },
    {
      heading: "7. Acceptable use",
      body: [
        "You may not misuse the Platform, attempt to bypass security, scrape or overload our systems, impersonate others, or use the service for unlawful purposes.",
        "Facilities and shops must comply with applicable laws and obtain owner consent before accessing pet records via QR or passport flows.",
      ],
    },
    {
      heading: "8. Disclaimers & liability",
      body: [
        'The Platform is provided "as is" and "as available". To the maximum extent permitted by law, we disclaim warranties and are not liable for indirect or consequential damages arising from your use of the Platform.',
        "Our Disclaimer (/disclaimer) forms part of your agreement with us and limits liability for AI output, user-entered data and third-party services.",
      ],
    },
    {
      heading: "9. Changes",
      body: [
        "We may update these Terms. Material changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.",
      ],
    },
  ],
  contactHeading: "10. Contact",
  contactBody: "Questions about these Terms? Send us feedback.",
  contactLinkLabel: "Open feedback form",
};

const termsZh: LegalDocument = {
  title: "服务条款",
  updatedLabel: `最后更新：${TERMS_UPDATED}`,
  intro:
    "本服务条款（「条款」）规范您对 PawSure 宠诺（「本平台」「我们」）的访问与使用。创建账户或使用本平台，即表示您同意本条款及我们的隐私政策。若不同意，请勿使用本平台。",
  sections: [
    {
      heading: "1. 使用资格",
      body: [
        "您须年满 18 周岁（或您所在司法辖区的成年年龄）并具备订立合同的能力。",
        "您须对提供信息的真实性负责，并对账户下的一切活动负责。",
      ],
    },
    {
      heading: "2. 账户与安全",
      body: [
        "请提供有效邮箱并妥善保管登录凭据。如怀疑账户被盗用，请及时联系我们。",
        "宠物主人账号同一时间仅可在单一设备登录；商家与机构账号可多设备使用。",
        "对于违反本条款或存在安全/滥用风险的账户，我们可暂停或终止服务。",
      ],
    },
    {
      heading: "3. 服务内容",
      body: [
        "本平台用于记录、整理与分享宠物健康信息，包括健康日志、提醒、AI 辅助功能，以及由参与商家/繁育者签发的数字健康护照。",
        "我们不提供兽医诊疗、诊断或治疗。AI 及健康信息的限制见免责声明。",
      ],
    },
    {
      heading: "4. 您的内容",
      body: [
        "您保留所上传内容的所有权。您授予我们有限的许可，仅为运营本平台（含备份及您主动使用的 AI 功能）而托管、处理与展示该内容。",
        "您须有权上传相关内容，且不得上传违法、误导或侵权材料。",
      ],
    },
    {
      heading: "5. 健康护照与转让",
      body: [
        "护照反映签发方在本平台录入的记录；宠诺不对动物实际健康状况作认证。",
        "护照交接及买卖双方之间的保证或承诺，属于交易双方之间的约定，与宠诺无关。",
      ],
    },
    {
      heading: "6. 付费服务",
      body: [
        "部分功能需订阅或加购，通过 Stripe 等支付渠道计费；价格以收银台显示为准（默认为美元）。",
        "除法律要求或另有说明外，费用一般不予退款。您可通过账单门户或账户设置取消订阅。",
      ],
    },
    {
      heading: "7. 可接受使用",
      body: [
        "不得滥用本平台、试图绕过安全措施、爬取或过载系统、冒充他人或用于非法目的。",
        "机构与商家须遵守适用法律，并通过 QR 或护照流程获得主人同意后再访问宠物档案。",
      ],
    },
    {
      heading: "8. 免责声明与责任限制",
      body: [
        "本平台按「现状」提供。在法律允许的最大范围内，我们不作保证，且不对因使用本平台产生的间接或后果性损失承担责任。",
        "免责声明（/disclaimer）构成本协议的一部分，并限制与 AI 输出、用户录入数据及第三方服务相关的责任。",
      ],
    },
    {
      heading: "9. 条款变更",
      body: ["我们可更新本条款，并于本页公布及更新日期。更新后继续使用即视为接受。"],
    },
  ],
  contactHeading: "10. 联系我们",
  contactBody: "条款相关问题，请通过反馈表单联系我们。",
  contactLinkLabel: "提交反馈",
};

const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  updatedLabel: `Last updated: ${PRIVACY_UPDATED}`,
  intro:
    "This Privacy Policy explains how PawSure collects, uses, stores and shares personal information when you use our website and services. It applies to owners, shops, facilities and visitors.",
  sections: [
    {
      heading: "1. Information we collect",
      body: [
        "Account data: name, email, phone (if provided), password hash, organization details for shop/facility accounts.",
        "Pet & health data: logs, photos, weights, documents, lineage, passport and stay records you or your organization enter.",
        "Usage data: device/browser type, IP address, pages viewed, cookies/localStorage preferences (e.g. language, timezone).",
        "Payment data: processed by Stripe; we store customer IDs and subscription status, not full card numbers.",
      ],
    },
    {
      heading: "2. How we use information",
      body: [
        "To provide and improve the Platform — authentication, record storage, reminders, AI features you request, billing and support.",
        "To secure the service, prevent fraud and enforce our Terms.",
        "To communicate with you about your account, verification emails and important service notices.",
      ],
    },
    {
      heading: "3. AI processing",
      body: [
        "When you use AI chat or triage, relevant pet context (and attached images you choose) may be sent to third-party AI providers (e.g. Groq) to generate responses.",
        "Do not submit sensitive personal data unrelated to pet care. AI output is not stored as medical advice.",
      ],
    },
    {
      heading: "4. Sharing",
      body: [
        "We use infrastructure and service providers (hosting, database, email, payments, AI, file storage) who process data on our behalf under contractual safeguards.",
        "Pet records are shared only as you direct — e.g. passport links, facility QR admissions, or org members with workspace access.",
        "We may disclose information if required by law or to protect rights, safety and integrity of the Platform.",
      ],
    },
    {
      heading: "5. International transfers",
      body: [
        "Data may be processed in the United States and other countries where our providers operate. By using PawSure you consent to such transfers subject to applicable law.",
      ],
    },
    {
      heading: "6. Retention",
      body: [
        "We retain account and pet data while your account is active and as needed for legal, billing and security purposes. You may request account deletion from account settings.",
      ],
    },
    {
      heading: "7. Your choices & rights",
      body: [
        "You can update profile information, export records through the product where available, and delete your account (which cancels Stripe subscriptions tied to it).",
        "Depending on your jurisdiction you may have rights to access, correct or delete personal data — contact us to exercise them.",
      ],
    },
    {
      heading: "8. Security",
      body: [
        "We use reasonable technical and organizational measures (encryption in transit, access controls, hashed passwords). No system is 100% secure — protect your credentials.",
      ],
    },
    {
      heading: "9. Children",
      body: [
        "PawSure is not directed at children under 13 (or 16 where applicable). We do not knowingly collect children's personal data without parental consent.",
      ],
    },
    {
      heading: "10. Changes",
      body: [
        "We may update this Policy. The updated version will be posted here with a new date. Material changes may be notified via email or in-app notice where appropriate.",
      ],
    },
  ],
  contactHeading: "11. Contact",
  contactBody: "Privacy questions or requests? Send us feedback.",
  contactLinkLabel: "Open feedback form",
};

const privacyZh: LegalDocument = {
  title: "隐私政策",
  updatedLabel: `最后更新：${PRIVACY_UPDATED}`,
  intro:
    "本隐私政策说明 PawSure 宠诺在您使用网站与服务时如何收集、使用、存储与共享个人信息。适用于宠物主人、商家、机构及访客。",
  sections: [
    {
      heading: "1. 我们收集的信息",
      body: [
        "账户信息：姓名、邮箱、手机号（如提供）、密码哈希；商家/机构账号还包括组织信息。",
        "宠物与健康数据：您或机构录入的日志、照片、体重、文件、血统、护照及寄养记录。",
        "使用数据：设备/浏览器类型、IP、访问页面、Cookie/localStorage 偏好（如语言、时区）。",
        "支付信息：由 Stripe 处理；我们保存客户 ID 与订阅状态，不存储完整卡号。",
      ],
    },
    {
      heading: "2. 信息用途",
      body: [
        "提供与改进服务——认证、档案存储、提醒、您请求的 AI 功能、计费与支持。",
        "保障安全、防止欺诈并执行服务条款。",
        "就账户、验证邮件及重要服务通知与您沟通。",
      ],
    },
    {
      heading: "3. AI 处理",
      body: [
        "使用 AI 对话或分诊时，相关宠物上下文（及您选择的图片）可能发送至第三方 AI 服务商（如 Groq）以生成回复。",
        "请勿提交与宠物照护无关的敏感个人信息。AI 输出不构成医疗建议。",
      ],
    },
    {
      heading: "4. 共享",
      body: [
        "我们使用托管、数据库、邮件、支付、AI、存储等服务商代我们处理数据，并施加合同保护。",
        "宠物档案仅按您的授权共享——如护照链接、机构 QR 准入或工作区成员访问。",
        "在法律要求或为保护权利、安全与平台完整性时，我们可能披露信息。",
      ],
    },
    {
      heading: "5. 跨境传输",
      body: [
        "数据可能在美国及服务商所在其他国家处理。使用本平台即表示在法律允许范围内同意此类传输。",
      ],
    },
    {
      heading: "6. 保留期限",
      body: [
        "在账户活跃期间及为法律、计费与安全所需而保留数据。您可在账户设置中申请删除账户。",
      ],
    },
    {
      heading: "7. 您的选择与权利",
      body: [
        "您可更新资料、在产品支持时导出记录、删除账户（将取消关联的 Stripe 订阅）。",
        "根据适用法律，您可能享有访问、更正或删除个人数据的权利——请联系我们行使。",
      ],
    },
    {
      heading: "8. 安全",
      body: [
        "我们采取合理的技术与组织措施（传输加密、访问控制、密码哈希）。任何系统都无法保证绝对安全——请妥善保管凭据。",
      ],
    },
    {
      heading: "9. 儿童",
      body: [
        "本平台不面向 13 岁以下（或部分法域 16 岁以下）儿童。未经监护人同意，我们不会故意收集儿童个人信息。",
      ],
    },
    {
      heading: "10. 变更",
      body: [
        "我们可能更新本政策，并于本页公布新版本及日期。重大变更可能通过邮件或应用内通知告知。",
      ],
    },
  ],
  contactHeading: "11. 联系我们",
  contactBody: "隐私问题或请求，请通过反馈表单联系我们。",
  contactLinkLabel: "提交反馈",
};

export function getTerms(locale: Locale): LegalDocument {
  return locale === "zh" ? termsZh : termsEn;
}

export function getPrivacy(locale: Locale): LegalDocument {
  return locale === "zh" ? privacyZh : privacyEn;
}

export function legalAcceptanceFromForm(formData: FormData): {
  termsAcceptedAt: Date;
  privacyAcceptedAt: Date;
} | null {
  if (String(formData.get("acceptLegal") || "") !== "1") return null;
  const at = new Date();
  return { termsAcceptedAt: at, privacyAcceptedAt: at };
}
