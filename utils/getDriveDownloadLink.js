import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Downloads a public Google Drive file (even large ones with virus scan warning).
 * @param {string} fileId - The file ID from the Google Drive link.
 * @returns {Promise<string>} - A fully resolved download URL.
 * @throws {Error} - If the confirmation step or download link fails.
 */

export const getGoogleDriveDownloadUrl = async (fileId) =>{
    const session = axios.create({ withCredentials: true });

    const baseUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const page = await session.get(baseUrl);
    const $ = cheerio.load(page.data);
    const form = $("form#download-form");
    if (!form.length) {
      // Possibly a small file that doesn't need confirmation
      if (page.headers["content-disposition"]?.includes("attachment")) {
        return baseUrl;
      }
      throw new Error("No confirmation form found in the page.");
    }
    const action = form.attr("action");
    const inputs = {};
    form.find("input").each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name) inputs[name] = value;
    });
  
    const params = new URLSearchParams(inputs).toString();
  const confirmedDownloadUrl = `${action}?${params}`;

  return confirmedDownloadUrl;
  
}