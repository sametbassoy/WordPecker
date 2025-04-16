import { supabase } from './supabaseService';

// SQL sorgusunu doğrudan çalıştır
export const executeSql = async (sql: string): Promise<boolean> => {
  try {
    console.log('SQL sorgusu çalıştırılıyor...');
    
    // SQL sorgusunu doğrudan çalıştır
    const { error } = await supabase
      .from('_direct_sql')
      .insert({ sql });
    
    if (error) {
      console.error('SQL sorgusu çalıştırılırken hata:', error);
      return false;
    }
    
    console.log('SQL sorgusu başarıyla çalıştırıldı');
    return true;
  } catch (error) {
    console.error('SQL sorgusu çalıştırılırken hata:', error);
    return false;
  }
};

export default executeSql;
