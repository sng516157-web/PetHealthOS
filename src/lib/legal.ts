// Full disclaimer (免责声明) content, bilingual. Kept here (not in the i18n
// Dictionary) because it's long-form legal copy rather than UI strings.
//
// NOTE FOR OPERATORS: this is a general, good-faith template — NOT legal advice.
// Have a qualified lawyer in your operating jurisdiction (e.g. HK / mainland
// China) review and adapt it, and fill in governing law before relying on it.

import type { Locale } from "./i18n/config";

export const DISCLAIMER_UPDATED = "2026-06-08";

export type DisclaimerSection = { heading: string; body: string[] };
export type LegalDocument = {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: DisclaimerSection[];
  contactHeading: string;
  contactBody: string;
  contactLinkLabel: string;
};
export type DisclaimerContent = LegalDocument;

const zh: DisclaimerContent = {
  title: "免责声明",
  updatedLabel: `最后更新：${DISCLAIMER_UPDATED}`,
  intro:
    "PawSure 宠诺（“本平台”“我们”）是一款宠物健康信息记录与管理工具。访问或使用本平台，即表示您已阅读、理解并同意本免责声明的全部内容。若您不同意，请勿使用本平台。",
  sections: [
    {
      heading: "1. 非兽医或医疗建议",
      body: [
        "本平台提供的所有内容，包括 AI 助手的回答、分诊报告、健康提醒、主动健康监测与任何由系统生成的信息，仅供一般参考与记录之用，不构成兽医、医疗、诊断或治疗建议，也不能替代持证兽医的当面检查与专业判断。",
        "我们不提供诊断，亦不保证任何信息的准确性、完整性或适用性。涉及宠物健康的任何决定，请务必咨询持证兽医。",
        "若宠物出现紧急或危及生命的状况，请立即联系当地兽医或急诊机构，切勿依赖本平台延误就医。",
      ],
    },
    {
      heading: "2. 人工智能的局限",
      body: [
        "本平台的部分功能由第三方人工智能模型驱动。AI 可能产生不准确、过时、不完整甚至错误（“幻觉”）的内容。",
        "您不应仅凭 AI 输出作出任何健康、用药、饲养或交易决定。对于因依赖 AI 生成内容而产生的任何后果，我们不承担责任。",
      ],
    },
    {
      heading: "3. 用户提供的内容",
      body: [
        "健康日志、照片、视频、体重、文件、血统、健康护照等内容均由用户自行录入。我们不对这些内容的真实性、准确性、合法性或完整性进行核实或背书。",
        "对于用户录入信息的错误、遗漏、伪造或误导，以及由此造成的任何损失，我们不承担责任。维护记录真实、准确是录入方的责任。",
      ],
    },
    {
      heading: "4. 健康护照与记录转让",
      body: [
        "健康护照仅反映签发的商家/繁育者在本平台上所记录的信息，并不代表我们对动物实际健康状况的认证、检验或担保。",
        "“防篡改”“记录冻结”等机制仅说明记录在特定时点后于本平台内不可更改，并不构成对记录内容真实性的保证。",
      ],
    },
    {
      heading: "5. 健康保证（保障条款）",
      body: [
        "护照中包含的任何健康保证、保障或退换承诺，均为签发方（商家/繁育者）与接收方（买家/新主人）之间的私人约定。",
        "PawSure 并非该约定的当事方，不参与、不担保、亦不负责其履行。相关争议应由交易双方自行解决。",
      ],
    },
    {
      heading: "6. 交易与买卖关系",
      body: [
        "本平台不参与商家与主人之间的任何买卖、领养或转让交易，亦非任何交易的中介或担保方。",
        "因交易产生的任何纠纷、损失或责任，由交易相关方自行承担。",
      ],
    },
    {
      heading: "7. 支付",
      body: [
        "本平台的付费功能通过第三方支付服务商（如 Stripe 银行卡收银）处理。相关支付受该服务商的条款与政策约束。",
        "我们不存储您的完整支付卡信息。退款与计费争议按相应套餐说明及服务商规则处理。",
      ],
    },
    {
      heading: "8. 责任限制",
      body: [
        "本平台按“现状”及“现有”基础提供，不作任何明示或默示的保证，包括但不限于适销性、特定用途适用性及不中断、无错误运行的保证。",
        "在适用法律允许的最大范围内，对于因使用或无法使用本平台而导致的任何直接、间接、附带、特殊或后果性损失（包括但不限于宠物健康后果、经济损失、数据丢失），我们不承担责任。",
      ],
    },
    {
      heading: "9. 数据与隐私",
      body: [
        "我们会按合理的安全措施处理您的数据，但无法保证绝对安全。您有责任妥善保管账户凭据。",
        "请勿上传您无权分享的他人隐私信息或受法律保护的敏感信息。",
      ],
    },
    {
      heading: "10. 第三方服务",
      body: [
        "本平台依赖第三方服务（包括人工智能、支付、云托管与存储等）。这些服务的可用性与表现不在我们的完全控制之内，并受其各自条款约束。",
      ],
    },
    {
      heading: "11. 条款变更",
      body: [
        "我们可不时更新本免责声明。更新后于本页发布即生效。您在更新后继续使用本平台，即视为接受修订后的内容。",
      ],
    },
  ],
  contactHeading: "12. 联系我们",
  contactBody: "如对本免责声明有任何疑问，请通过反馈表单联系我们。",
  contactLinkLabel: "提交反馈",
};

const en: DisclaimerContent = {
  title: "Disclaimer",
  updatedLabel: `Last updated: ${DISCLAIMER_UPDATED}`,
  intro:
    "PawSure (“the Platform”, “we”) is a tool for recording and managing pet health information. By accessing or using the Platform, you confirm that you have read, understood and agree to this Disclaimer in full. If you do not agree, please do not use the Platform.",
  sections: [
    {
      heading: "1. Not veterinary or medical advice",
      body: [
        "All content provided by the Platform — including AI assistant responses, triage reports, health reminders, proactive health watch and any system-generated information — is for general reference and record-keeping only. It does not constitute veterinary, medical, diagnostic or treatment advice and is not a substitute for in-person examination and professional judgment by a licensed veterinarian.",
        "We do not provide a diagnosis and make no warranty as to the accuracy, completeness or suitability of any information. Always consult a licensed veterinarian for any decision concerning your pet's health.",
        "If your pet shows an emergency or life-threatening condition, contact a local veterinarian or emergency clinic immediately — do not rely on the Platform and delay care.",
      ],
    },
    {
      heading: "2. Limitations of AI",
      body: [
        "Some features are powered by third-party artificial intelligence models. AI may produce inaccurate, outdated, incomplete or wholly incorrect (“hallucinated”) content.",
        "You must not make any health, medication, husbandry or transaction decision based on AI output alone. We are not liable for any consequence arising from reliance on AI-generated content.",
      ],
    },
    {
      heading: "3. User-generated content",
      body: [
        "Health logs, photos, videos, weights, documents, lineage and health passports are entered by users. We do not verify or endorse the truthfulness, accuracy, legality or completeness of this content.",
        "We are not responsible for errors, omissions, falsification or misrepresentation in user-entered information, or any resulting loss. Keeping records truthful and accurate is the responsibility of the party entering them.",
      ],
    },
    {
      heading: "4. Health passport & record transfer",
      body: [
        "A health passport reflects only the information recorded on the Platform by the issuing shop/breeder. It does not represent any certification, inspection or guarantee by us of an animal's actual health.",
        "Mechanisms such as “tamper-evident” and “frozen records” mean only that records cannot be altered within the Platform after a given point; they are not a guarantee of the truthfulness of the record's contents.",
      ],
    },
    {
      heading: "5. Health guarantee (warranty terms)",
      body: [
        "Any health guarantee, warranty or refund/replacement commitment contained in a passport is a private agreement between the issuer (shop/breeder) and the recipient (buyer/new owner).",
        "PawSure is not a party to that agreement and does not participate in, guarantee or take responsibility for its performance. Any related dispute must be resolved between the transacting parties.",
      ],
    },
    {
      heading: "6. Transactions & sale relationships",
      body: [
        "The Platform is not a party to, nor a broker or guarantor of, any sale, adoption or transfer between shops and owners.",
        "Any dispute, loss or liability arising from a transaction rests with the parties to that transaction.",
      ],
    },
    {
      heading: "7. Payments",
      body: [
        "Paid features are processed by third-party payment providers (e.g. Stripe card checkout). Payments are governed by those providers' terms and policies.",
        "We do not store your full payment-card details. Refunds and billing disputes are handled per the relevant plan description and provider rules.",
      ],
    },
    {
      heading: "8. Limitation of liability",
      body: [
        "The Platform is provided on an “as is” and “as available” basis, without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and uninterrupted or error-free operation.",
        "To the maximum extent permitted by applicable law, we are not liable for any direct, indirect, incidental, special or consequential loss (including but not limited to pet health outcomes, financial loss, or data loss) arising from the use of, or inability to use, the Platform.",
      ],
    },
    {
      heading: "9. Data & privacy",
      body: [
        "We handle your data with reasonable security measures but cannot guarantee absolute security. You are responsible for safeguarding your account credentials.",
        "Do not upload others' private information that you are not authorised to share, or legally protected sensitive information.",
      ],
    },
    {
      heading: "10. Third-party services",
      body: [
        "The Platform relies on third-party services (including AI, payments, cloud hosting and storage). Their availability and performance are not fully within our control and are subject to their respective terms.",
      ],
    },
    {
      heading: "11. Changes to this disclaimer",
      body: [
        "We may update this Disclaimer from time to time. Updates take effect when posted on this page. Continued use of the Platform after an update constitutes acceptance of the revised terms.",
      ],
    },
  ],
  contactHeading: "12. Contact us",
  contactBody: "For any questions about this Disclaimer, send us feedback.",
  contactLinkLabel: "Open feedback form",
};

export function getDisclaimer(locale: Locale): DisclaimerContent {
  return locale === "zh" ? zh : en;
}
