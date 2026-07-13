import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wvqbzcagqitglzmduvyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cWJ6Y2FncWl0Z2x6bWR1dnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTUzMzYzMywiZXhwIjoyMDk1MTA5NjMzfQ.QCMR5OMSxVNSC9Otg6Fv3AKb6Vn-CJ0mJvLWfsXGhfE'
);

async function test() {
  const { data, error } = await supabase
    .from('user_uploads')
    .insert({
      user_id: 'test-user-id',
      storage_provider: 'supabase',
      storage_url: 'https://test',
      storage_path: 'test',
      original_filename: 'test.jpg',
      sanitized_filename: 'test.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 100,
      width: 100,
      height: 100,
      processing_status: 'completed'
    })
    .select();

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
