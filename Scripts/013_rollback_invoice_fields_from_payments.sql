-- Rollback Migration: Remove InvoiceNumber and InvoicePath from Payments table
-- Date: 2025-12-13
-- Description: Removes invoice generation support from payments

-- Drop index
IF EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_Payments_InvoiceNumber' 
    AND object_id = OBJECT_ID(N'[dbo].[Payments]')
)
BEGIN
    DROP INDEX [IX_Payments_InvoiceNumber] ON [dbo].[Payments];
    PRINT 'Index IX_Payments_InvoiceNumber dropped';
END
GO

-- Remove InvoicePath column
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Payments]') 
    AND name = 'InvoicePath'
)
BEGIN
    ALTER TABLE [dbo].[Payments]
    DROP COLUMN [InvoicePath];
    
    PRINT 'InvoicePath column removed from Payments table';
END
ELSE
BEGIN
    PRINT 'InvoicePath column does not exist';
END
GO

-- Remove InvoiceNumber column
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Payments]') 
    AND name = 'InvoiceNumber'
)
BEGIN
    ALTER TABLE [dbo].[Payments]
    DROP COLUMN [InvoiceNumber];
    
    PRINT 'InvoiceNumber column removed from Payments table';
END
ELSE
BEGIN
    PRINT 'InvoiceNumber column does not exist';
END
GO

PRINT 'Rollback completed successfully';
GO

