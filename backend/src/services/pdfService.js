import PDFDocument from 'pdfkit';
import { DocumentClause } from '../models/DocumentClause.js';
import { DOCUMENT_TYPES } from '../models/Document.js';

export class PDFService {
  /**
   * Helper to format dates cleanly
   */
  static formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Fetch company clauses
   */
  static async getClauses() {
    let clauses = await DocumentClause.findOne();
    if (!clauses) {
      clauses = await DocumentClause.create({});
    }
    return clauses;
  }

  /**
   * Generate PDF Stream for a specific document type
   */
  static async generateDocumentPDF({ docType, employee, offboarding, user, customOptions = {} }) {
    const clauses = await this.getClauses();
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `${docType} - ${employee.firstName} ${employee.lastName}`,
        Author: 'BlazeUp HROS Offboarding System'
      }
    });

    const primaryColor = '#1e293b';
    const accentColor = '#4f46e5';
    const mutedColor = '#64748b';

    // 1. Header with Company Branding
    doc
      .fillColor(accentColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(clauses.companyName || 'BlazeUp Technologies Pvt. Ltd.', { align: 'left' });

    doc
      .fillColor(mutedColor)
      .fontSize(9)
      .font('Helvetica')
      .text(clauses.companyAddress || 'Level 8, Tech Park Nexus, Cyber City, Bangalore - 560103', { align: 'left' });

    doc.moveDown(0.5);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // 2. Reference Number & Date
    const refNumber = `BLZ/HR/OFFB/${offboarding._id.toString().substring(18).toUpperCase()}/${new Date().getFullYear()}`;
    const todayStr = this.formatDate(new Date());

    doc.fontSize(10).fillColor(mutedColor).font('Helvetica');
    doc.text(`Ref: ${refNumber}`, 50, doc.y, { continued: true });
    doc.text(`Date: ${todayStr}`, { align: 'right' });
    doc.moveDown(1.5);

    // 3. Document Title
    let title = '';
    switch (docType) {
      case DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE:
        title = 'RESIGNATION ACCEPTANCE LETTER';
        break;
      case DOCUMENT_TYPES.NOC:
        title = 'NO OBJECTION & CLEARANCE CERTIFICATE (NOC)';
        break;
      case DOCUMENT_TYPES.RELIEVING_LETTER:
        title = 'OFFICIAL RELIEVING LETTER';
        break;
      case DOCUMENT_TYPES.EXPERIENCE_LETTER:
        title = 'SERVICE & WORK EXPERIENCE CERTIFICATE';
        break;
      default:
        title = 'OFFBOARDING CLEARANCE DOCUMENT';
    }

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(title, { align: 'center', underline: true });
    doc.moveDown(1.5);

    // 4. Employee Details Table / Block
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('TO WHOMSOEVER IT MAY CONCERN / EMPLOYEE COPY');
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10).fillColor('#334155');
    doc.text(`Employee Name  : ${employee.firstName} ${employee.lastName}`);
    doc.text(`Employee ID    : ${employee.employeeCode}`);
    doc.text(`Designation    : ${employee.designation}`);
    doc.text(`Department     : ${employee.department}`);
    doc.text(`Date of Joining: ${this.formatDate(employee.joiningDate)}`);
    doc.text(`Last Working Day: ${this.formatDate(offboarding.lastWorkingDay)}`);
    doc.moveDown(1.2);

    // 5. Body Text based on Document Type
    if (docType === DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE) {
      doc.text(`Dear ${employee.firstName},`);
      doc.moveDown(0.8);
      doc.text(
        `This letter acknowledges receipt and formal acceptance of your resignation tendered on ${this.formatDate(
          offboarding.resignationDate
        )}.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(
        `As per company records and separation review, your last working day with ${clauses.companyName} stands confirmed as ${this.formatDate(
          offboarding.lastWorkingDay
        )}. You are requested to complete all departmental clearances, handovers, and return company properties on or before this date.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(
        `Your final settlement, full and final statement, and statutory release documents will be processed upon successful completion of all workflow clearances.`,
        { align: 'justify', lineGap: 3 }
      );
    } else if (docType === DOCUMENT_TYPES.NOC) {
      doc.text(
        `This is to certify that ${employee.firstName} ${employee.lastName} (Employee Code: ${employee.employeeCode}) has successfully completed full clearance from all concerned functional departments including:`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);

      const depts = [
        '1. Project & Reporting Management (Knowledge Transfer & Code Handover)',
        '2. Admin & IT Systems (Hardware, Peripherals & Credential Revocation)',
        '3. Finance & Accounts (Travel advances, staff loans & expense imprest)',
        '4. Personnel & Admin (Access cards, ID badges & company credentials)',
        '5. Human Resources (Exit interviews & statutory compliance)'
      ];
      depts.forEach(d => {
        doc.text(`   ${d}`, { lineGap: 2 });
      });

      doc.moveDown(0.8);
      doc.text(
        `The Company confirms having No Objection and confirms that there are no pending dues or encumbrances against the employee.`,
        { align: 'justify', lineGap: 3 }
      );
    } else if (docType === DOCUMENT_TYPES.RELIEVING_LETTER) {
      doc.text(`Dear ${employee.firstName},`);
      doc.moveDown(0.8);
      doc.text(
        `With reference to your resignation letter dated ${this.formatDate(
          offboarding.resignationDate
        )}, we hereby confirm that you have been formally relieved from your duties and responsibilities as '${employee.designation}' at ${clauses.companyName} with effect from the close of business hours on ${this.formatDate(
          offboarding.lastWorkingDay
        )}.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(
        `All required departmental clearances, asset returns, and accounts settlements have been concluded satisfactorily.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(`We thank you for your contributions during your tenure and wish you success in your future endeavors.`, {
        align: 'justify',
        lineGap: 3
      });
    } else if (docType === DOCUMENT_TYPES.EXPERIENCE_LETTER) {
      doc.text(
        `This is to certify that ${employee.firstName} ${employee.lastName} was employed with ${clauses.companyName} as '${employee.designation}' in the '${employee.department}' department from ${this.formatDate(
          employee.joiningDate
        )} to ${this.formatDate(offboarding.lastWorkingDay)}.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(
        `During the period of tenure, ${employee.firstName} demonstrated high dedication, professional integrity, and technical competence. Their conduct was found to be exemplary.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(0.8);
      doc.text(`We wish them the very best in all future professional pursuits.`, {
        align: 'justify',
        lineGap: 3
      });
    }

    // 6. Configurable Legal Clauses (Non-Compete, Non-Solicitation, Confidentiality)
    if (customOptions.nonCompete !== false || customOptions.nonSolicitation !== false) {
      doc.moveDown(1.2);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('POST-EMPLOYMENT OBLIGATIONS & CLAUSES:');
      doc.moveDown(0.4);
      doc.fontSize(8.5).font('Helvetica').fillColor('#475569');

      if (customOptions.nonCompete !== false && clauses.nonCompeteClause) {
        doc.text(`• Non-Compete: ${clauses.nonCompeteClause}`, { align: 'justify', lineGap: 2 });
      }
      if (customOptions.nonSolicitation !== false && clauses.nonSolicitationClause) {
        doc.text(`• Non-Solicitation: ${clauses.nonSolicitationClause}`, { align: 'justify', lineGap: 2 });
      }
      if (customOptions.confidentiality !== false && clauses.confidentialityClause) {
        doc.text(`• Confidentiality: ${clauses.confidentialityClause}`, { align: 'justify', lineGap: 2 });
      }
    }

    // 7. Official Sign-off & Seal Block
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').fillColor(primaryColor);
    doc.text(`For ${clauses.companyName},`);
    doc.moveDown(2);

    doc.font('Helvetica-Bold').text(clauses.signatoryName || 'Priya Sharma');
    doc.font('Helvetica').fillColor(mutedColor).text(clauses.signatoryTitle || 'Head of People & Culture');
    doc.text('Authorized Signatory');

    // Official Stamp Simulation
    const stampY = doc.y - 45;
    doc
      .strokeColor('#e0e7ff')
      .fillColor('#eef2ff')
      .roundedRect(400, stampY, 130, 48, 4)
      .fillAndStroke();

    doc
      .fillColor('#4338ca')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('DIGITALLY VERIFIED', 410, stampY + 10, { width: 110, align: 'center' })
      .font('Helvetica')
      .fontSize(7)
      .text('BlazeUp HROS Engine', 410, stampY + 24, { width: 110, align: 'center' });

    doc.end();
    return doc;
  }
}
