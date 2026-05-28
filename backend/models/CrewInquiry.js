const mongoose = require("mongoose");

const CrewInquirySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    corporateEmail: {
      type: String,
      required: true,
      trim: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    workforceGrade: {
      type: String,
      default: "Standard Assistant",
    },
    shiftType: {
      type: String,
      default: "8 Hours Normal",
    },
    expectedStart: {
      type: String,
      default: "Immediate (<24h)",
    },
    latitude: {
      type: Number,
      default: 25.1264,
    },
    longitude: {
      type: Number,
      default: 55.3789,
    },
    trades: {
      skilledPainters: {
        type: Number,
        default: 0,
      },
      plumbingMechanics: {
        type: Number,
        default: 0,
      },
      carpentryOperators: {
        type: Number,
        default: 0,
      },
      gypsumTechs: {
        type: Number,
        default: 0,
      },
      masonWorkers: {
        type: Number,
        default: 0,
      },
      electricalAssistants: {
        type: Number,
        default: 0,
      },
    },
    totalCrewSize: {
      type: Number,
      default: 0,
    },
    estimatedDailyCost: {
      type: Number,
      default: 0,
    },
    estimatedMonthlyCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CrewInquiry", CrewInquirySchema);