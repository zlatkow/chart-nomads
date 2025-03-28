/* eslint-disable */
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button, Input, Card, CardBody, CardHeader, CardFooter, Divider } from '@nextui-org/react'

// Create a simple test page to verify Supabase connection
export default function TestSupabase() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [testData, setTestData] = useState('')
  const [error, setError] = useState('')

  const testSupabaseConnection = async () => {
    setStatus('loading')
    setMessage('Testing Supabase connection...')
    setError('')
    
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase credentials. Please check your environment variables.')
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Test connection by inserting a record into a test table
      const { data, error } = await supabase
        .from('test_table')
        .insert([
          { message: 'Test message', created_at: new Date().toISOString() }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      setStatus('success')
      setMessage('Supabase connection successful!')
      setTestData(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setStatus('error')
      setMessage('Supabase connection failed')
      setError(err.message || 'Unknown error')
      console.error('Error testing Supabase:', err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Supabase Connection Test</p>
            <p className="text-small text-default-500">Test your Supabase connection</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2">Environment Variables:</p>
              <p className="text-small">
                NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
              </p>
              <p className="text-small">
                NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
              </p>
            </div>
            
            {status !== 'idle' && (
              <div className={`p-3 rounded ${status === 'error' ? 'bg-red-100 text-red-800' : status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                <p className="font-medium">{message}</p>
                {error && <p className="text-red-600 mt-2">{error}</p>}
                {testData && (
                  <div className="mt-2">
                    <p className="font-medium">Response Data:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">{testData}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
        <Divider/>
        <CardFooter>
          <Button 
            color={status === 'error' ? "danger" : status === 'success' ? "success" : "primary"}
            onClick={testSupabaseConnection}
            isLoading={status === 'loading'}
            className="w-full"
          >
            {status === 'idle' ? 'Test Connection' : status === 'loading' ? 'Testing...' : status === 'success' ? 'Test Again' : 'Try Again'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
