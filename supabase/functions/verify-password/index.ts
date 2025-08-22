
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json()
    const correctPassword = Deno.env.get('APP_PASSWORD')

    console.log('Password verification attempt');

    if (!correctPassword) {
      console.error('APP_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Configuração do servidor incorreta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      )
    }

    if (password === correctPassword) {
      console.log('Password verification successful');
      return new Response(
        JSON.stringify({ authenticated: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      )
    } else {
      console.log('Password verification failed');
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Senha incorreta' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      )
    }
  } catch (error) {
    console.error('Error in verify-password function:', error);
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})
