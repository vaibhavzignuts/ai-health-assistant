'use server';

import createSupabaseServerClient from '../server/server';

export default async function getUserSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getSession();
    
    console.log('getUserSession - Session exists:', !!data.session);
    console.log('getUserSession - User ID:', data.session?.user?.id);
    console.log('getUserSession - Error:', error);
    
    return { data, error };
  } catch (error) {
    console.error('Error in getUserSession:', error);
    return { 
      data: { session: null }, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}