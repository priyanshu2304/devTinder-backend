const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const DEFAULT_TO = "priyanshumodiwork1@gmail.com";
const DEFAULT_FROM = "sender@therichie.in";

/**
 *
 * @param {string} toAddress - Recipient email address
 * @param {string} fromAddress - Verified sender email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - Email body in HTML format
 * @param {string} textBody - Email body in plain text format
 * @returns {SendEmailCommand}
 */
const createSendEmailCommand = (
  toAddress,
  fromAddress,
  subject,
  htmlBody,
  textBody
) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async ({
  to = DEFAULT_TO,
  from = DEFAULT_FROM,
  subject,
  html,
  text,
}) => {
  const sendEmailCommand = createSendEmailCommand(
    to,
    from,
    subject,
    html,
    text
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught;
    }
    throw caught;
  }
};

module.exports = { run };
