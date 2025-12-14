-- Migration: Add InvoiceNumber and InvoicePath to Payments table
-- Date: 2025-12-13
-- Description: Adds invoice generation support to payments

-- Add InvoiceNumber column
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Payments]') 
    AND name = 'InvoiceNumber'
)
BEGIN
    ALTER TABLE [dbo].[Payments]
    ADD [InvoiceNumber] NVARCHAR(50) NULL;
    
    PRINT 'InvoiceNumber column added to Payments table';
END
ELSE
BEGIN
    PRINT 'InvoiceNumber column already exists';
END
GO

-- Add InvoicePath column
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Payments]') 
    AND name = 'InvoicePath'
)
BEGIN
    ALTER TABLE [dbo].[Payments]
    ADD [InvoicePath] NVARCHAR(500) NULL;
    
    PRINT 'InvoicePath column added to Payments table';
END
ELSE
BEGIN
    PRINT 'InvoicePath column already exists';
END
GO

-- Create index on InvoiceNumber for faster lookups
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_Payments_InvoiceNumber' 
    AND object_id = OBJECT_ID(N'[dbo].[Payments]')
)
BEGIN
    CREATE INDEX [IX_Payments_InvoiceNumber] 
    ON [dbo].[Payments] ([InvoiceNumber])
    WHERE [InvoiceNumber] IS NOT NULL;
    
    PRINT 'Index IX_Payments_InvoiceNumber created';
END
ELSE
BEGIN
    PRINT 'Index IX_Payments_InvoiceNumber already exists';
END
GO

PRINT 'Migration completed successfully';
GO

