# Quick Fix for Payment 500 Errors

## Problem
The payment endpoints are returning 500 Internal Server Error because the `InvoiceNumber` and `InvoicePath` columns don't exist in the Payments table yet.

## Solution

### Step 1: Run the Database Migration

Execute the migration script to add the missing columns:

```sql
-- Run this script in SQL Server Management Studio or your database tool
-- File: scripts/013_add_invoice_fields_to_payments.sql
```

Or run it via command line:
```powershell
sqlcmd -S DESKTOP-0TK20NI -d MentalWellnessDB -i scripts\013_add_invoice_fields_to_payments.sql
```

### Step 2: Restart Backend Server

After running the migration, restart your backend server to ensure the changes are picked up.

### Step 3: Test

1. Try loading the Payments page again
2. Try initiating a payment
3. Check that payments load without errors

## Alternative: Temporary Fix (If Migration Can't Run Now)

If you can't run the migration immediately, you can temporarily comment out the InvoiceNumber field in the query. However, this is NOT recommended for production.

## Verification

After running the migration, verify the columns exist:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Payments'
AND COLUMN_NAME IN ('InvoiceNumber', 'InvoicePath');
```

You should see both columns listed.

