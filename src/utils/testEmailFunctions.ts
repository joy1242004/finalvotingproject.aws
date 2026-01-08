import { supabase } from '@/integrations/supabase/client';

export async function testLoginAlert() {
  try {
    console.log('Testing send-login-alert function...');
    
    const response = await supabase.functions.invoke('send-login-alert', {
      body: {
        email: 'test@example.com',
        userName: 'Test User',
        loginTime: new Date().toISOString(),
        userAgent: 'Test Agent',
      },
    });
    
    console.log('Function response:', response);
    console.log('Success! Response data:', response.data);
    return response;
  } catch (error: any) {
    console.error('Function call failed:', error);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function testVoteConfirmation() {
  try {
    console.log('Testing send-vote-confirmation function...');
    
    const response = await supabase.functions.invoke('send-vote-confirmation', {
      body: {
        email: 'test@example.com',
        voterName: 'Test User',
        electionTitle: 'Test Election',
        candidateName: 'Test Candidate',
        transactionHash: '0x123abc',
        blockNumber: 12345,
        voterHash: '0xabc123',
        timestamp: new Date().toISOString(),
      },
    });
    
    console.log('Function response:', response);
    console.log('Success! Response data:', response.data);
    return response;
  } catch (error: any) {
    console.error('Function call failed:', error);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Export both for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testFunctions = {
    testLoginAlert,
    testVoteConfirmation,
  };
  console.log('Test functions loaded. Run: testFunctions.testLoginAlert() in console');
}
