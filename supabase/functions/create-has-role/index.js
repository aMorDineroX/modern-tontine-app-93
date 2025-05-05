// Supabase Edge Function pour créer la fonction has_role

// Vérifier la clé secrète
const checkAuth = (req) => {
  const body = req.body || {};
  return body.key === 'secret_key';
};

// Fonction principale
export async function serve(req) {
  // Vérifier l'authentification
  if (!checkAuth(req)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Créer la fonction has_role
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION has_role(role TEXT) 
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = $1
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
