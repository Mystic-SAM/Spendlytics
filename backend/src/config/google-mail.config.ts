import { google } from "googleapis";
import { Env } from "./env.config.js";

const oauth2Client = new google.auth.OAuth2(
  Env.GOOGLE_CLIENT_ID,
  Env.GOOGLE_CLIENT_SECRET,
  Env.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: Env.GOOGLE_REFRESH_TOKEN,
});

export const gmailClient = google.gmail({
  version: "v1",
  auth: oauth2Client,
});
