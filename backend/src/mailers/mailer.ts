import { Env } from "../config/env.config.js";
import { gmailClient } from "../config/google-mail.config.js";
import { Logger } from "../utils/logger.js";
import { AppError } from "../utils/app-error.js";
import { randomUUID } from "crypto";

interface Attachment {
  filename: string;
  content: Buffer;
  mimeType: string;
}

export type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
  attachments?: Attachment[];
};

const mail_sender = `Spendlytics <${Env.GMAIL_SENDER}>`;

/**
 * Encodes a message to RFC 2822 MIME format for Gmail API.
 * Uses URL-safe base64 encoding as required by Gmail API.
 */
const encodeMimeMessage = (message: string): string => {
  Logger.debug("Encoding MIME message", { messageLength: message.length });
  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  Logger.debug("MIME message encoded", { encodedLength: encoded.length });
  return encoded;
};

/**
 * Builds a MIME formatted message with multipart/alternative structure.
 * Supports both plain text and HTML content.
 */
const buildMimeMessage = (
  to: string | string[],
  from: string,
  subject: string,
  text: string,
  html: string,
  boundary: string,
): string => {
  Logger.debug("Building MIME message", {
    recipientCount: Array.isArray(to) ? to.length : 1,
    boundary,
  });
  const messageParts = [
    `From: ${from}`,
    `To: ${Array.isArray(to) ? to.join(",") : to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary=${boundary}`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    `--${boundary}--`,
  ];

  const message = messageParts.join("\r\n");
  Logger.debug("MIME message built", { messageLength: message.length });
  return message;
};

/**
 * Builds a MIME formatted message with multipart/mixed structure
 * for messages with attachments. Uses nested multipart/alternative
 * for the body content.
 */
const buildMimeMessageWithAttachments = (
  to: string | string[],
  from: string,
  subject: string,
  text: string,
  html: string,
  attachments: Attachment[],
  outerBoundary: string,
  innerBoundary: string,
): string => {
  Logger.debug("Building MIME message with attachments", {
    recipientCount: Array.isArray(to) ? to.length : 1,
    attachmentCount: attachments.length,
    outerBoundary,
    innerBoundary,
  });

  const messageParts: string[] = [
    `From: ${from}`,
    `To: ${Array.isArray(to) ? to.join(",") : to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary=${outerBoundary}`,
    "",
    `--${outerBoundary}`,
    `Content-Type: multipart/alternative; boundary=${innerBoundary}`,
    "",
    `--${innerBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    "",
    text,
    "",
    `--${innerBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    "",
    html,
    "",
    `--${innerBoundary}--`,
    "",
  ];

  // Add attachments
  for (const attachment of attachments) {
    Logger.debug("Adding attachment to message", {
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.content.length,
    });

    const base64Content = attachment.content.toString("base64");

    messageParts.push(`--${outerBoundary}`);
    messageParts.push(
      `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
    );
    messageParts.push('Content-Disposition: attachment; filename="' + attachment.filename + '"');
    messageParts.push("Content-Transfer-Encoding: base64");
    messageParts.push("");
    messageParts.push(base64Content);
    messageParts.push("");
  }

  messageParts.push(`--${outerBoundary}--`);

  const message = messageParts.join("\r\n");
  Logger.debug("MIME message with attachments built", {
    messageLength: message.length,
  });
  return message;
};

/**
 * Validates email recipient parameter.
 * @throws {AppError} If recipient is invalid
 */
const validateRecipient = (to: string | string[]): void => {
  Logger.debug("Validating email recipient", {
    type: typeof to,
    isArray: Array.isArray(to),
  });
  if (!to || (typeof to !== "string" && !Array.isArray(to))) {
    Logger.warn("Invalid email recipient format");
    throw new AppError("Invalid email recipient", 400);
  }

  if (Array.isArray(to) && to.length === 0) {
    Logger.warn("Email recipient list is empty");
    throw new AppError("Email recipient list cannot be empty", 400);
  }
  Logger.debug("Email recipient validation passed");
};

export const sendEmail = async ({
  to,
  from = mail_sender,
  subject,
  text,
  html,
  attachments,
}: Params): Promise<void> => {
  Logger.info("Preparing to send email", {
    to: Array.isArray(to) ? to : [to],
    subject,
    hasAttachments: !!attachments && attachments.length > 0,
    attachmentCount: attachments?.length || 0,
  });

  // Validate recipient
  validateRecipient(to);

  let encodedMessage: string;

  if (attachments && attachments.length > 0) {
    // Generate unique boundaries using UUIDs
    const outerBoundary = `boundary_outer_${randomUUID()}`;
    const innerBoundary = `boundary_inner_${randomUUID()}`;
    Logger.debug("Generated MIME boundaries for message with attachments", {
      outerBoundary,
      innerBoundary,
    });

    // Build and encode the MIME message with attachments
    const message = buildMimeMessageWithAttachments(
      to,
      from,
      subject,
      text,
      html,
      attachments,
      outerBoundary,
      innerBoundary,
    );
    encodedMessage = encodeMimeMessage(message);
  } else {
    // Generate unique boundary using UUID
    const boundary = `boundary_${randomUUID()}`;
    Logger.debug("Generated MIME boundary", { boundary });

    // Build and encode the MIME message
    const message = buildMimeMessage(to, from, subject, text, html, boundary);
    encodedMessage = encodeMimeMessage(message);
  }

  try {
    Logger.debug("Sending message to Gmail API", {
      to: Array.isArray(to) ? to.length : 1,
      subject,
      hasAttachments: !!attachments && attachments.length > 0,
    });

    await gmailClient.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    Logger.info("✅ Email sent successfully", {
      to: Array.isArray(to) ? to.length : 1,
      subject,
      attachmentCount: attachments?.length || 0,
    });
  } catch (error) {
    Logger.error("Failed to send email", error, {
      to: Array.isArray(to) ? to : [to],
      subject,
      attachmentCount: attachments?.length || 0,
    });
    throw error;
  }
};
