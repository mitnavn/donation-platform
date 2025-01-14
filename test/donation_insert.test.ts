import {
  dbBeginTransaction,
  dbClient,
  dbRollbackTransaction,
  DonationFrequency,
  DonationRecipient,
  EmailedStatus,
  insertDonationMembershipViaBankTransfer,
  insertDonationMembershipViaScanpay,
  insertDonationViaBankTransfer,
  insertDonationViaScanpay,
  insertDonorWithSensitiveInfo,
  PaymentGateway,
  PaymentMethod,
} from "src";
import { afterEach, beforeEach, expect, test } from "vitest";

const client = dbClient();

beforeEach(async () => {
  await dbBeginTransaction(await client);
});

afterEach(async () => {
  await dbRollbackTransaction(await client);
});

test("Insert donation for Giv Effektivt membership using Scanpay", async () => {
  const db = await client;

  const donor = await insertDonorWithSensitiveInfo(db, {
    email: "hello@example.com",
  });

  const donation = await insertDonationMembershipViaScanpay(db, {
    donor_id: donor.id,
    method: PaymentMethod.CreditCard,
  });

  expect(donation).toMatchObject({
    donor_id: donor.id,
    emailed: EmailedStatus.No,
    amount: 50,
    recipient: DonationRecipient.GivEffektivt,
    frequency: DonationFrequency.Yearly,
    cancelled: false,
    method: PaymentMethod.CreditCard,
    tax_deductible: false,
    gateway: PaymentGateway.Scanpay,
    gateway_metadata: {},
  });
});

test("Insert donation for Giv Effektivt membership using bank transfer", async () => {
  const db = await client;

  const donor = await insertDonorWithSensitiveInfo(db, {
    email: "hello@example.com",
  });

  const donation = await insertDonationMembershipViaBankTransfer(db, {
    donor_id: donor.id,
    gateway_metadata: { bank_msg: "1234" },
  });

  expect(donation).toMatchObject({
    donor_id: donor.id,
    emailed: EmailedStatus.No,
    amount: 50,
    recipient: DonationRecipient.GivEffektivt,
    frequency: DonationFrequency.Yearly,
    cancelled: false,
    method: PaymentMethod.BankTransfer,
    tax_deductible: false,
    gateway: PaymentGateway.BankTransfer,
    gateway_metadata: { bank_msg: "1234" },
  });
});

test("Insert donation using Scanpay", async () => {
  const db = await client;

  const donor = await insertDonorWithSensitiveInfo(db, {
    email: "hello@example.com",
  });

  const donation = await insertDonationViaScanpay(db, {
    donor_id: donor.id,
    amount: 123,
    recipient: DonationRecipient.MyggenetModMalaria,
    frequency: DonationFrequency.Monthly,
    method: PaymentMethod.MobilePay,
    tax_deductible: true,
  });

  expect(donation).toMatchObject({
    donor_id: donor.id,
    emailed: EmailedStatus.No,
    amount: 123,
    recipient: DonationRecipient.MyggenetModMalaria,
    frequency: DonationFrequency.Monthly,
    cancelled: false,
    method: PaymentMethod.MobilePay,
    tax_deductible: true,
    gateway: PaymentGateway.Scanpay,
  });
});

test("Insert donation using bank transfer", async () => {
  const db = await client;

  const donor = await insertDonorWithSensitiveInfo(db, {
    email: "hello@example.com",
  });

  const donation = await insertDonationViaBankTransfer(db, {
    donor_id: donor.id,
    amount: 123,
    recipient: DonationRecipient.MyggenetModMalaria,
    frequency: DonationFrequency.Monthly,
    tax_deductible: true,
  });

  expect(donation).toMatchObject({
    donor_id: donor.id,
    emailed: EmailedStatus.No,
    amount: 123,
    recipient: DonationRecipient.MyggenetModMalaria,
    frequency: DonationFrequency.Monthly,
    cancelled: false,
    method: PaymentMethod.BankTransfer,
    tax_deductible: true,
    gateway: PaymentGateway.BankTransfer,
  });
});
