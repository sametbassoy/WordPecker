import { supabase } from './supabaseService';
import { createStoredProcedures } from './setupDatabase';

// Stored procedure'leri oluştur
export const createProcedures = async () => {
  try {
    console.log('Stored procedure\'ler oluşturuluyor...');
    
    // SQL sorgusunu çalıştır
    const { error } = await supabase.rpc('exec_sql', { sql: createStoredProcedures });
    
    if (error) {
      console.error('Stored procedure\'ler oluşturulurken hata:', error);
      return false;
    }
    
    console.log('Stored procedure\'ler başarıyla oluşturuldu');
    return true;
  } catch (error) {
    console.error('Stored procedure\'ler oluşturulurken hata:', error);
    return false;
  }
};

// exec_sql fonksiyonunu oluştur
export const createExecSqlFunction = async () => {
  try {
    console.log('exec_sql fonksiyonu oluşturuluyor...');
    
    const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    `;
    
    // SQL sorgusunu doğrudan çalıştır
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Fonksiyon henüz oluşturulmamış olabilir, doğrudan SQL çalıştırmayı dene
      const { error: directError } = await supabase
        .from('_exec_sql')
        .insert({ sql });
      
      if (directError) {
        console.error('exec_sql fonksiyonu oluşturulurken hata:', directError);
        return false;
      }
    }
    
    console.log('exec_sql fonksiyonu başarıyla oluşturuldu');
    return true;
  } catch (error) {
    console.error('exec_sql fonksiyonu oluşturulurken hata:', error);
    return false;
  }
};

export default { createProcedures, createExecSqlFunction };
