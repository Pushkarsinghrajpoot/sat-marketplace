import { supabase } from './supabase';

export interface CreditValidationResult {
  isValid: boolean;
  availableCredit: number;
  approvedLimit: number;
  usedCredit: number;
  message?: string;
}

export interface CreditRequest {
  id: string;
  reseller_id: string;
  distributor_id: string;
  approved_limit: number;
  used_credit: number;
  payment_terms: string;
  status: string;
  credit_validity_period?: string;
}

/**
 * Get approved credit limit for a reseller from a specific distributor
 */
export async function getApprovedCredit(
  resellerId: string,
  distributorId: string
): Promise<CreditRequest | null> {
  try {
    const { data, error } = await supabase
      .from('credit_requests')
      .select('*')
      .eq('reseller_id', resellerId)
      .eq('distributor_id', distributorId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching approved credit:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getApprovedCredit:', error);
    return null;
  }
}

/**
 * Validate if a reseller has sufficient credit for an order
 */
export async function validateCreditForOrder(
  resellerId: string,
  distributorId: string,
  orderAmount: number
): Promise<CreditValidationResult> {
  const credit = await getApprovedCredit(resellerId, distributorId);

  if (!credit) {
    return {
      isValid: false,
      availableCredit: 0,
      approvedLimit: 0,
      usedCredit: 0,
      message: 'No approved credit limit found for this distributor',
    };
  }

  // Check if credit is expired
  if (credit.credit_validity_period) {
    const expiryDate = new Date(credit.credit_validity_period);
    if (expiryDate < new Date()) {
      return {
        isValid: false,
        availableCredit: 0,
        approvedLimit: credit.approved_limit,
        usedCredit: credit.used_credit || 0,
        message: 'Credit limit has expired',
      };
    }
  }

  const availableCredit = credit.approved_limit - (credit.used_credit || 0);

  if (orderAmount > availableCredit) {
    return {
      isValid: false,
      availableCredit,
      approvedLimit: credit.approved_limit,
      usedCredit: credit.used_credit || 0,
      message: `Insufficient credit. Available: ${availableCredit}, Required: ${orderAmount}`,
    };
  }

  return {
    isValid: true,
    availableCredit,
    approvedLimit: credit.approved_limit,
    usedCredit: credit.used_credit || 0,
  };
}

/**
 * Record credit usage when an order is placed
 */
export async function recordCreditUsage(
  creditRequestId: string,
  amount: number,
  referenceType: 'ORDER' | 'INVOICE' | 'QUOTE',
  referenceId: string,
  description: string,
  userId: string
): Promise<boolean> {
  try {
    // Get current credit request
    const { data: creditRequest, error: fetchError } = await supabase
      .from('credit_requests')
      .select('used_credit, approved_limit')
      .eq('id', creditRequestId)
      .single();

    if (fetchError) throw fetchError;

    const newUsedCredit = (creditRequest.used_credit || 0) + amount;

    // Validate the update won't exceed limit
    if (newUsedCredit > creditRequest.approved_limit) {
      console.error('Credit usage would exceed approved limit');
      return false;
    }

    // Update credit request with new used amount
    const { error: updateError } = await supabase
      .from('credit_requests')
      .update({ 
        used_credit: newUsedCredit,
        updated_at: new Date().toISOString()
      })
      .eq('id', creditRequestId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        credit_request_id: creditRequestId,
        transaction_type: 'USAGE',
        amount,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        created_by: userId,
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error('Error recording credit usage:', error);
    return false;
  }
}

/**
 * Record credit repayment when invoice is paid
 */
export async function recordCreditPayment(
  creditRequestId: string,
  amount: number,
  referenceType: 'PAYMENT' | 'INVOICE',
  referenceId: string,
  description: string,
  userId: string
): Promise<boolean> {
  try {
    // Get current credit request
    const { data: creditRequest, error: fetchError } = await supabase
      .from('credit_requests')
      .select('used_credit')
      .eq('id', creditRequestId)
      .single();

    if (fetchError) throw fetchError;

    const newUsedCredit = Math.max(0, (creditRequest.used_credit || 0) - amount);

    // Update credit request
    const { error: updateError } = await supabase
      .from('credit_requests')
      .update({ 
        used_credit: newUsedCredit,
        updated_at: new Date().toISOString()
      })
      .eq('id', creditRequestId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        credit_request_id: creditRequestId,
        transaction_type: 'PAYMENT',
        amount: -amount, // Negative to indicate credit restoration
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        created_by: userId,
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error('Error recording credit payment:', error);
    return false;
  }
}

/**
 * Get credit transaction history
 */
export async function getCreditTransactions(
  creditRequestId: string,
  limit: number = 50
) {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('credit_request_id', creditRequestId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return [];
  }
}

/**
 * Get all approved credits for a reseller
 */
export async function getResellerApprovedCredits(resellerId: string) {
  try {
    const { data, error } = await supabase
      .from('credit_requests')
      .select(`
        *,
        organizations:distributor_id(id, name, logo)
      `)
      .eq('reseller_id', resellerId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reseller credits:', error);
    return [];
  }
}
