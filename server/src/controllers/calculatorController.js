import prisma from '../config/prisma.js';

// =================== TAX & CUSTOMS CALCULATOR (Section 11) ===================

export const calculateTaxCustoms = async (req, res) => {
  try {
    const {
      fobValue = 0,
      freight = 0,
      insurance = 0,
      exchangeRate = 16250,
      bmRate = 5.0, // Bea Masuk %
      ppnRate = 11.0, // PPN Impor %
      pphRate = 2.5, // PPh 22 Impor % (API)
      cukaiAmount = 0,
      antiDumpingAmount = 0,
      safeguardAmount = 0,
      hsCode = '',
      saveHistory = false,
    } = req.body;

    const fob = Number(fobValue);
    const frt = Number(freight);
    const ins = Number(insurance);
    const rate = Number(exchangeRate);

    // CIF Formula
    const cifUsd = fob + frt + ins;
    const cifIdr = cifUsd * rate;

    // Bea Masuk (Import Duty) = CIF * BM Rate
    const beaMasukIdr = (cifIdr * Number(bmRate)) / 100;
    const beaMasukUsd = beaMasukIdr / rate;

    // Nilai Impor (Tax Base) = CIF + Bea Masuk + Cukai
    const nilaiImporIdr = cifIdr + beaMasukIdr + Number(cukaiAmount);
    const nilaiImporUsd = nilaiImporIdr / rate;

    // PPN Impor (11%)
    const ppnIdr = (nilaiImporIdr * Number(ppnRate)) / 100;
    const ppnUsd = ppnIdr / rate;

    // PPh Pasal 22 Impor
    const pphIdr = (nilaiImporIdr * Number(pphRate)) / 100;
    const pphUsd = pphIdr / rate;

    // Total Government Charges & Duties
    const totalGovernmentChargesIdr = beaMasukIdr + ppnIdr + pphIdr + Number(cukaiAmount) + Number(antiDumpingAmount) + Number(safeguardAmount);
    const totalGovernmentChargesUsd = totalGovernmentChargesIdr / rate;

    const totalLandedCostIdr = cifIdr + totalGovernmentChargesIdr;
    const totalLandedCostUsd = totalLandedCostIdr / rate;

    const result = {
      cifUsd: Math.round(cifUsd * 100) / 100,
      cifIdr: Math.round(cifIdr),
      nilaiImporIdr: Math.round(nilaiImporIdr),
      beaMasuk: { rate: Number(bmRate), amountIdr: Math.round(beaMasukIdr), amountUsd: Math.round(beaMasukUsd * 100) / 100 },
      ppnImpor: { rate: Number(ppnRate), amountIdr: Math.round(ppnIdr), amountUsd: Math.round(ppnUsd * 100) / 100 },
      pph22: { rate: Number(pphRate), amountIdr: Math.round(pphIdr), amountUsd: Math.round(pphUsd * 100) / 100 },
      cukaiIdr: Number(cukaiAmount),
      antiDumpingIdr: Number(antiDumpingAmount),
      safeguardIdr: Number(safeguardAmount),
      totalDutiesAndTaxesIdr: Math.round(totalGovernmentChargesIdr),
      totalDutiesAndTaxesUsd: Math.round(totalGovernmentChargesUsd * 100) / 100,
      totalLandedCostIdr: Math.round(totalLandedCostIdr),
      totalLandedCostUsd: Math.round(totalLandedCostUsd * 100) / 100,
      effectiveDate: new Date(),
      disclaimer: 'Official customs billing requires verification against PPJK & CEISA Ministry of Finance regulations.',
    };

    if (saveHistory && req.user) {
      await prisma.calculatorHistory.create({
        data: {
          calculatorType: 'TaxCustoms',
          inputDataJson: JSON.stringify(req.body),
          resultDataJson: JSON.stringify(result),
          savedBy: req.user.id,
        },
      });
    }

    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Calculation error', error: err.message });
  }
};

// =================== THC CALCULATOR (Section 11) ===================

export const calculateTHC = async (req, res) => {
  try {
    const {
      ratePerContainer = 145,
      quantity = 1,
      additionalHandling = 0,
      vatRate = 11.0,
      currency = 'USD',
    } = req.body;

    const baseTHC = Number(ratePerContainer) * Number(quantity);
    const handling = Number(additionalHandling);
    const subtotal = baseTHC + handling;
    const vatAmount = (subtotal * Number(vatRate)) / 100;
    const totalTHC = subtotal + vatAmount;

    return res.json({
      success: true,
      result: {
        baseTHC: Math.round(baseTHC * 100) / 100,
        additionalHandling: handling,
        subtotal: Math.round(subtotal * 100) / 100,
        vatRate: Number(vatRate),
        vatAmount: Math.round(vatAmount * 100) / 100,
        totalTHC: Math.round(totalTHC * 100) / 100,
        currency,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'THC calculation error', error: err.message });
  }
};

// =================== OCEAN FREIGHT & FCL / LCL CALCULATORS (Section 12) ===================

export const calculateOceanFreight = async (req, res) => {
  try {
    const {
      containerType = '40FT High Cube',
      quantity = 1,
      baseFreightRate = 1800,
      baf = 250, // Bunker Adjustment Factor
      caf = 120, // Currency Adjustment Factor
      isps = 45, // Security Charge
      thc = 150, // Terminal Handling
      docFee = 75, // Documentation
      otherCharges = 50,
      currency = 'USD',
    } = req.body;

    const qty = Number(quantity);
    const ratePerUnit = Number(baseFreightRate) + Number(baf) + Number(caf) + Number(isps) + Number(thc) + Number(otherCharges);
    const grandTotal = (ratePerUnit * qty) + Number(docFee);

    return res.json({
      success: true,
      result: {
        ratePerUnit: Math.round(ratePerUnit * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        currency,
        breakdown: {
          freight: Number(baseFreightRate) * qty,
          baf: Number(baf) * qty,
          caf: Number(caf) * qty,
          isps: Number(isps) * qty,
          thc: Number(thc) * qty,
          docFee: Number(docFee),
          otherCharges: Number(otherCharges) * qty,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Freight calculation error', error: err.message });
  }
};

export const calculateLCL = async (req, res) => {
  try {
    const {
      grossWeightKg = 1200,
      cbm = 2.4,
      freightRatePerWm = 95,
      cfsCharge = 25,
      handlingFee = 35,
      docFee = 50,
      minimumCharge = 150,
    } = req.body;

    const weightMT = Number(grossWeightKg) / 1000;
    const volCbm = Number(cbm);
    // Weight or Measure (W/M) Revenue Ton rule: whichever is greater
    const revenueTon = Math.max(weightMT, volCbm);
    const freightSubtotal = revenueTon * Number(freightRatePerWm);
    const cfsSubtotal = revenueTon * Number(cfsCharge);
    const totalLcl = Math.max(Number(minimumCharge), freightSubtotal + cfsSubtotal + Number(handlingFee) + Number(docFee));

    return res.json({
      success: true,
      result: {
        weightMT: Math.round(weightMT * 1000) / 1000,
        cbm: volCbm,
        chargeableRevenueTon: Math.round(revenueTon * 1000) / 1000,
        basisApplied: weightMT > volCbm ? 'Weight Basis (MT)' : 'Volume Basis (CBM)',
        freightSubtotal: Math.round(freightSubtotal * 100) / 100,
        cfsSubtotal: Math.round(cfsSubtotal * 100) / 100,
        totalLCLCost: Math.round(totalLcl * 100) / 100,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'LCL calculation error', error: err.message });
  }
};

export const calculateCBM = async (req, res) => {
  try {
    const { lengthCm, widthCm, heightCm, quantity = 1 } = req.body;
    // Formula: CBM = (L * W * H * Qty) / 1,000,000
    const totalCbm = (Number(lengthCm) * Number(widthCm) * Number(heightCm) * Number(quantity)) / 1000000;

    return res.json({
      success: true,
      result: {
        cbmPerPiece: Math.round((totalCbm / Number(quantity)) * 10000) / 10000,
        totalCbm: Math.round(totalCbm * 1000) / 1000,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'CBM calculation error', error: err.message });
  }
};

export const calculateProfitMargin = async (req, res) => {
  try {
    const { sellingPrice, purchaseCost, operationalCost = 0, taxRate = 11 } = req.body;

    const sPrice = Number(sellingPrice);
    const pCost = Number(purchaseCost);
    const oCost = Number(operationalCost);
    const grossProfit = sPrice - pCost;
    const tax = (grossProfit > 0 ? grossProfit * Number(taxRate) : 0) / 100;
    const netProfit = grossProfit - oCost - tax;
    const marginPercent = sPrice > 0 ? (netProfit / sPrice) * 100 : 0;
    const markupPercent = pCost > 0 ? (grossProfit / pCost) * 100 : 0;

    return res.json({
      success: true,
      result: {
        grossProfit: Math.round(grossProfit * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        marginPercent: Math.round(marginPercent * 100) / 100,
        markupPercent: Math.round(markupPercent * 100) / 100,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Profit calculation error', error: err.message });
  }
};

// =================== VESSEL TRADING PROFIT CALCULATOR (Module 21-H) ===================

export const calculateVesselTradingProfit = async (req, res) => {
  try {
    const {
      purchasePrice = 0,
      surveyCost = 0,
      inspectionCost = 0,
      legalCost = 0,
      registrationCost = 0,
      deliveryCost = 0,
      repairCost = 0,
      otherAcquisitionCosts = 0,
      sellingPrice = 0,
      brokerCommission = 0,
      salesSurveyCost = 0,
      salesLegalCost = 0,
      salesDocumentationCost = 0,
      salesDeliveryCost = 0,
      otherSalesExpenses = 0,
      currency = 'USD',
      exchangeRate = 16250,
      saveHistory = false,
    } = req.body;

    const pPrice = Number(purchasePrice);
    const acqExpenses = Number(surveyCost) + Number(inspectionCost) + Number(legalCost) + Number(registrationCost) + Number(deliveryCost) + Number(repairCost) + Number(otherAcquisitionCosts);
    const totalAcquisitionCost = pPrice + acqExpenses;

    const sPrice = Number(sellingPrice);
    const salesExpenses = Number(brokerCommission) + Number(salesSurveyCost) + Number(salesLegalCost) + Number(salesDocumentationCost) + Number(salesDeliveryCost) + Number(otherSalesExpenses);

    const grossTradingProfit = sPrice - pPrice;
    const netTradingProfit = sPrice - totalAcquisitionCost - salesExpenses;
    const profitMargin = sPrice > 0 ? (netTradingProfit / sPrice) * 100 : 0;
    const roiPercentage = totalAcquisitionCost > 0 ? (netTradingProfit / totalAcquisitionCost) * 100 : 0;
    const breakEvenSellingPrice = totalAcquisitionCost + salesExpenses;

    const result = {
      totalAcquisitionCost: Math.round(totalAcquisitionCost),
      totalAcquisitionExpenses: Math.round(acqExpenses),
      totalSalesExpenses: Math.round(salesExpenses),
      grossTradingProfit: Math.round(grossTradingProfit),
      netTradingProfit: Math.round(netTradingProfit),
      profitMargin: Math.round(profitMargin * 100) / 100,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      breakEvenSellingPrice: Math.round(breakEvenSellingPrice),
      currency,
      inIDR: {
        totalAcquisitionCost: Math.round(totalAcquisitionCost * Number(exchangeRate)),
        netTradingProfit: Math.round(netTradingProfit * Number(exchangeRate)),
        breakEvenSellingPrice: Math.round(breakEvenSellingPrice * Number(exchangeRate)),
      },
    };

    if (saveHistory && req.user) {
      await prisma.calculatorHistory.create({
        data: {
          calculatorType: 'VesselProfit',
          inputDataJson: JSON.stringify(req.body),
          resultDataJson: JSON.stringify(result),
          savedBy: req.user.id,
        },
      });
    }

    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Vessel profit calculation error', error: err.message });
  }
};

// =================== CALCULATOR HISTORY ===================

export const getCalculatorHistory = async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { calculatorType: type } : {};

    const history = await prisma.calculatorHistory.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    return res.json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch history', error: err.message });
  }
};

