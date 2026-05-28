const express = require('express');
const router = express.Router();
const CrewInquiry = require('../models/CrewInquiry');
const nodemailer = require('nodemailer');

// 1. Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/inquiries', async (req, res) => {
  try {
    console.log("Frontend se aaya hua raw data:", req.body);

    const {
      companyName,
      whatsappNumber,
      corporateEmail,
      propertyType,
      workforceGrade,
      shiftType,
      expectedStart,
      latitude,
      longitude,
      trades,
      estimatedDailyCost
    } = req.body;

    if (!companyName || !whatsappNumber || !corporateEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing mandatory tracking parameters: Profile Core (Company, WhatsApp, or Email).' 
      });
    }

    // कुल क्रू साइज़ की गणना
    let totalCrewSize = 0;
    if (trades) {
      totalCrewSize = Object.values(trades).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
    }

    // 26 वर्किंग डेज के आधार पर मासिक अनुमानित खर्च
    const dailyCostVal = parseFloat(estimatedDailyCost) || 0;
    const computedMonthlyCost = dailyCostVal * 26;

    const newInquiry = new CrewInquiry({
      companyName,
      whatsappNumber,
      corporateEmail,
      propertyType,
      workforceGrade,
      shiftType,
      expectedStart,
      latitude,
      longitude,
      trades,
      totalCrewSize,
      estimatedDailyCost: dailyCostVal,
      estimatedMonthlyCost: computedMonthlyCost
    });

    const savedInquiry = await newInquiry.save();

    // --- HTML ईमेल रो (Row) जेनरेशन ---
    let tradesHtmlRows = '';
    if (trades && typeof trades === 'object') {
        const activeTrades = Object.entries(trades).filter(([_, qty]) => parseInt(qty) > 0);
        if (activeTrades.length > 0) {
            tradesHtmlRows = activeTrades.map(([tradeName, qty]) => `
              <tr>
                <td style="padding: 6px 0; color: #1e293b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${tradeName}</td>
                <td style="padding: 6px 0; text-align: right; color: #00b074; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${qty} Deployed</td>
              </tr>
            `).join('');
        } else {
            tradesHtmlRows = '<tr><td style="padding: 8px 0; color: #64748b; font-style: italic;">No crew deployed</td></tr>';
        }
    } else {
        tradesHtmlRows = '<tr><td style="padding: 8px 0; color: #64748b; font-style: italic;">N/A</td></tr>';
    }

    const emailSubject = `🚨 New Manpower Inquiry: ${companyName || 'Client'}`;
    
    // --- GK Brand Matched HTML Email Template (No Logo, Clean Spacing) ---
    const emailHtmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1426; padding: 30px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 12px;">
      
      <!-- Main Card Block -->
      <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.15); border-top: 6px solid #f59e0b; border-bottom: 4px solid #00b074;">
        
        <!-- Header Text Block (Clean and Balanced Spacing) -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 18px; font-weight: 800; color: #0b1426; letter-spacing: 0.5px; line-height: 1.1; text-transform: uppercase; font-family: 'Montserrat', Arial, sans-serif;">GIRIJESH KUMAR</div>
              <div style="font-size: 9px; font-weight: 700; color: #f59e0b; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 2px;">TECHNICAL SERVICES L.L.C</div>
            </td>
            <td style="text-align: right; vertical-align: middle; font-size: 11px; color: #64748b; font-weight: 500;">
              Enquiry Details
            </td>
          </tr>
        </table>

        <!-- SECTION 1: Client Details -->
        <h4 style="color: #0b1426; font-size: 13px; margin: 0 0 12px 0; border-bottom: 2px solid #00b074; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Client Profile</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 35%; font-weight: 500;">Client/Company:</td>
            <td style="padding: 6px 0; color: #0b1426; font-weight: 600;">${companyName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email Address:</td>
            <td style="padding: 6px 0; color: #00b074; font-weight: 500;"><a href="mailto:${corporateEmail}" style="color: #00b074; text-decoration: none;">${corporateEmail || 'N/A'}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">WhatsApp/Mobile:</td>
            <td style="padding: 6px 0; color: #0b1426; font-weight: 600;">${whatsappNumber || 'N/A'}</td>
          </tr>
        </table>

        <!-- SECTION 2: Service Parameters -->
        <h4 style="color: #0b1426; font-size: 13px; margin: 0 0 12px 0; border-bottom: 2px solid #00b074; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">⚙️ Workforce Parameters</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 35%; font-weight: 500;">Workforce Grade:</td>
            <td style="padding: 6px 0; color: #1e293b;">${workforceGrade || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Shift Type:</td>
            <td style="padding: 6px 0; color: #1e293b;">${shiftType || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Property Type:</td>
            <td style="padding: 6px 0; color: #1e293b;">${propertyType || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Expected Start:</td>
            <td style="padding: 6px 0; color: #1e293b;">${expectedStart || 'N/A'}</td>
          </tr>
        </table>

        <!-- SECTION 3: Deployed Crew -->
        <h4 style="color: #0b1426; font-size: 13px; margin: 0 0 12px 0; border-bottom: 2px solid #00b074; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">👥 Deployed Crew</h4>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${tradesHtmlRows}
          </table>
          <div style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between;">
            <span style="color: #64748b; font-weight: 500;">Total Crew Size:</span>
            <span style="color: #0b1426; font-weight: 700;">${totalCrewSize || 0}</span>
          </div>
        </div>

        <!-- SECTION 4: Estimates -->
        <h4 style="color: #0b1426; font-size: 13px; margin: 0 0 12px 0; border-bottom: 2px solid #00b074; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">💰 Commercial Estimates</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 35%; font-weight: 500;">Estimated Daily Cost:</td>
            <td style="padding: 6px 0; color: #0b1426; font-size: 15px; font-weight: 700;">AED ${dailyCostVal || '0'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Estimated Monthly Cost:</td>
            <td style="padding: 6px 0; color: #00b074; font-size: 15px; font-weight: 700;">AED ${computedMonthlyCost || '0'} <span style="font-size: 11px; font-weight: normal; color: #64748b;">(26 Working Days)</span></td>
          </tr>
        </table>

        <!-- SECTION 5: Location details -->
        <h4 style="color: #0b1426; font-size: 13px; margin: 0 0 12px 0; border-bottom: 2px solid #00b074; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Location Details</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 35%; font-weight: 500;">Latitude:</td>
            <td style="padding: 4px 0; color: #1e293b; font-family: monospace;">${latitude || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Longitude:</td>
            <td style="padding: 4px 0; color: #1e293b; font-family: monospace;">${longitude || 'N/A'}</td>
          </tr>
        </table>

        <!-- Google Maps Button matching the Website Green -->
        <div style="text-align: center; margin-top: 15px;">
          <a href="https://www.google.com/maps?q=${latitude || '0'},${longitude || '0'}" target="_blank" style="background-color: #00b074; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 176, 116, 0.25);">🗺️ Open in Google Maps</a>
        </div>

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0;">This is an automated system notification from your GK Technical Portal.</p>
        <p style="margin: 4px 0 0 0;">&copy; 2026 Girijesh Kumar Technical Services L.L.C. All Rights Reserved.</p>
      </div>

    </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gktechnical555@gmail.com, vishalnishad0809@gmail.com',
        subject: emailSubject,
        html: emailHtmlContent
    };

    // बैकग्राउंड में ईमेल भेजें
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("❌ NODEMAILER ERROR:", err.message);
        } else {
            console.log("📨 Email notification sent successfully:", info.response);
        }
    });

    res.status(201).json({
      success: true,
      message: 'Allocation matrix packaged and saved successfully.',
      data: savedInquiry
    });

  } catch (error) {
    console.error("❌ BACKEND ERROR DETAIL:", error.message);
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error processing trade variables.',
      error: error.message 
    });
  }
});

module.exports = router;