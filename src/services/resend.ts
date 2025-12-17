import { Resend } from 'resend';

const apiKey = process.env["RESEND_KEY"];
if (!apiKey) {
  throw new Error("RESEND_KEY env var is not set");
}

const resend = new Resend(apiKey);

export default resend;
