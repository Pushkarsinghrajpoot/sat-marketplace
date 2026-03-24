export const emailTemplates = {
  // Deal-related emails
  QUOTE_RECEIVED: (data: { recipientName: string; dealName: string; amount: string; link: string }) => ({
    subject: '🎉 New Quote Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Quote Received!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Great news! You've received a new quote for your deal:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Deal:</strong> ${data.dealName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Quote Amount:</strong> ${data.amount}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Quote</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  QUOTE_ACCEPTED: (data: { recipientName: string; amount: string; link: string }) => ({
    subject: '✅ Quote Accepted - Congratulations!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Quote Accepted!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Congratulations! Your quote has been accepted by the customer.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Quote Amount:</strong> ${data.amount}</p>
            <p style="margin: 5px 0; color: #16a34a; font-weight: bold;">Status: Won ✓</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Details</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  DEAL_CONVERTED: (data: { recipientName: string; dealName: string; link: string }) => ({
    subject: '🔄 Deal Converted to Bidding',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Deal Converted to Bidding</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Your deal has been converted to bidding mode and is now open for quotes from multiple distributors.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Deal:</strong> ${data.dealName}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Deal</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  // Credit-related emails
  CREDIT_REQUEST: (data: { recipientName: string; resellerName: string; amount: string; link: string }) => ({
    subject: '💳 New Credit Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Credit Request</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">A new credit request has been submitted for your review.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Reseller:</strong> ${data.resellerName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Requested Amount:</strong> ${data.amount}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Review Request</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  CREDIT_APPROVED: (data: { recipientName: string; amount: string; link: string }) => ({
    subject: '✅ Credit Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Credit Request Approved! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Great news! Your credit request has been approved.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Approved Amount:</strong> ${data.amount}</p>
            <p style="margin: 5px 0; color: #16a34a; font-weight: bold;">Status: Approved ✓</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Details</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  CREDIT_REJECTED: (data: { recipientName: string; reason: string; link: string }) => ({
    subject: '❌ Credit Request Declined',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Credit Request Declined</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Unfortunately, your credit request has been declined.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Reason:</strong> ${data.reason}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Details</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  CREDIT_MORE_INFO: (data: { recipientName: string; message: string; link: string }) => ({
    subject: '📋 Additional Information Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Additional Information Required</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">The distributor has requested additional information for your credit request.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Message:</strong></p>
            <p style="margin: 10px 0; color: #374151;">${data.message}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Respond Now</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  CREDIT_INFO_PROVIDED: (data: { recipientName: string; link: string; hasAttachments: boolean }) => ({
    subject: '📎 Additional Information Provided',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Additional Information Received</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">The reseller has provided the additional information you requested${data.hasAttachments ? ' with attachments' : ''}.</p>
          <a href="${data.link}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Review Now</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  // Engagement emails
  ENGAGEMENT_REQUEST: (data: { recipientName: string; resellerName: string; engagementType: string; dealName: string; link: string }) => ({
    subject: `🤝 New ${data.engagementType} Request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Engagement Request</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">${data.resellerName} has requested your engagement.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Type:</strong> ${data.engagementType}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Deal:</strong> ${data.dealName}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Request</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  ENGAGEMENT_APPROVED: (data: { recipientName: string; dealName: string; link: string }) => ({
    subject: '✅ Engagement Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Engagement Approved! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Your engagement request has been approved!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Deal:</strong> ${data.dealName}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Deal</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  ENGAGEMENT_DECLINED: (data: { recipientName: string; dealName: string; reason: string; link: string }) => ({
    subject: '❌ Engagement Request Declined',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Engagement Request Declined</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Unfortunately, your engagement request has been declined.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Deal:</strong> ${data.dealName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Reason:</strong> ${data.reason}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Details</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  // Activity emails
  ACTIVITY_ACKNOWLEDGED: (data: { recipientName: string; points: number; link: string }) => ({
    subject: '⭐ Activity Acknowledged - Points Earned!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Activity Acknowledged! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Your activity has been acknowledged!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0; color: #16a34a; font-size: 24px; font-weight: bold;">+${data.points} Points Earned! ⭐</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Activities</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  ACTIVITY_REJECTED: (data: { recipientName: string; reason: string; link: string }) => ({
    subject: '❌ Activity Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Activity Rejected</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Your activity submission has been rejected.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Reason:</strong> ${data.reason}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Details</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  // Query emails
  QUERY_RESPONSE: (data: { recipientName: string; queryTitle: string; link: string }) => ({
    subject: '💬 Query Response Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Query Response Received</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">Your direct query has received a response from the distributor.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Query:</strong> ${data.queryTitle}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Response</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  // Invoice & Follow-up emails
  INVOICE_ISSUED: (data: { recipientName: string; invoiceNumber: string; link: string }) => ({
    subject: '📄 Invoice Generated',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Invoice Generated</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">An invoice has been generated for your quote.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Invoice #:</strong> ${data.invoiceNumber}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Invoice</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),

  QUOTE_REMINDER: (data: { recipientName: string; amount: string; link: string }) => ({
    subject: '🔔 Quote Follow-up Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Quote Follow-up</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151;">Hi ${data.recipientName},</p>
          <p style="font-size: 16px; color: #374151;">This is a friendly reminder about your pending quote.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0; color: #6b7280;"><strong style="color: #111827;">Quote Amount:</strong> ${data.amount}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Review Quote</a>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">Best regards,<br/>SAT Marketplace Team</p>
        </div>
      </div>
    `
  }),
};

export type EmailTemplateType = keyof typeof emailTemplates;
