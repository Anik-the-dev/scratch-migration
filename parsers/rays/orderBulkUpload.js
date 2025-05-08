
import { connectMongoDB } from "../../db/database.js";
import { getGoogleDriveDownloadUrl } from "../../utils/getDriveDownloadLink.js";


// Temporary File Path


// ---------------------------------------------------------------------------
// Section 7: Download CSV File from Google Drive
// ---------------------------------------------------------------------------
const downloadFile = async () =>{
    console.log("inside....");
        const fileId = process.env.GOOGLE_DRIVE_URL.match(/\/d\/(.*?)\//)[1]; // 1HVDk5ZWMhCyIGV_FPsyH3NBAF68yGcpy
        const url = await getGoogleDriveDownloadUrl(fileId); // For Google Large File
        console.log(`[DOWNLOAD] Starting download from Google Drive URL: ${url}`); //https://drive.google.com/uc?export=download&id=1HVDk5ZWMhCyIGV_FPsyH3NBAF68yGcpy

}

// ---------------------------------------------------------------------------
// Section: Main Workflow Integration with Final Execution Summary
// ---------------------------------------------------------------------------
const fetchAndParseCSV = async () =>{
    // connect the db
    await connectMongoDB();
    console.log("[MAIN] Connected to MongoDB.");
    const overallStartTime = Date.now();
    try {
        // Step 1: download the csv from google drive
        await downloadFile();
    } catch (error) {
        
    }
}



// ---------------------------------------------------------------------------
// Start the Main Workflow
// ---------------------------------------------------------------------------
fetchAndParseCSV();
