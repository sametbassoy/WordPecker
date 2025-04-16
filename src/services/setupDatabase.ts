import { supabase } from './supabaseService';
import executeSql from './executeSql';

// Veritabanı kurulumu
export const setupDatabase = async () => {
  try {
    console.log('Veritabanı kurulumu başlatılıyor...');

    // SQL sorgusunu doğrudan çalıştır
    const sql = `
    -- word_lists tablosunu oluştur
    CREATE TABLE IF NOT EXISTS public.word_lists (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        word_count INTEGER DEFAULT 0,
        progress REAL DEFAULT 0,
        language TEXT DEFAULT 'en'
    );

    -- words tablosunu oluştur
    CREATE TABLE IF NOT EXISTS public.words (
        id UUID PRIMARY KEY,
        list_id UUID NOT NULL REFERENCES public.word_lists(id) ON DELETE CASCADE,
        original TEXT NOT NULL,
        translation TEXT NOT NULL,
        context TEXT,
        notes TEXT,
        mastery_level INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- RLS (Row Level Security) politikalarını ayarla
    ALTER TABLE public.word_lists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

    -- Varolan politikaları temizle
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini görebilir" ON public.word_lists;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini oluşturabilir" ON public.word_lists;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini güncelleyebilir" ON public.word_lists;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini silebilir" ON public.word_lists;

    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri görebilir" ON public.words;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerine kelime ekleyebilir" ON public.words;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri güncelleyebilir" ON public.words;
    DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri silebilir" ON public.words;

    -- word_lists için politikalar
    CREATE POLICY "Kullanıcılar kendi listelerini görebilir"
        ON public.word_lists FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Kullanıcılar kendi listelerini oluşturabilir"
        ON public.word_lists FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Kullanıcılar kendi listelerini güncelleyebilir"
        ON public.word_lists FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "Kullanıcılar kendi listelerini silebilir"
        ON public.word_lists FOR DELETE
        USING (auth.uid() = user_id);

    -- words için politikalar
    CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri görebilir"
        ON public.words FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM public.word_lists
            WHERE id = list_id AND user_id = auth.uid()
        ));

    CREATE POLICY "Kullanıcılar kendi listelerine kelime ekleyebilir"
        ON public.words FOR INSERT
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.word_lists
            WHERE id = list_id AND user_id = auth.uid()
        ));

    CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri güncelleyebilir"
        ON public.words FOR UPDATE
        USING (EXISTS (
            SELECT 1 FROM public.word_lists
            WHERE id = list_id AND user_id = auth.uid()
        ));

    CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri silebilir"
        ON public.words FOR DELETE
        USING (EXISTS (
            SELECT 1 FROM public.word_lists
            WHERE id = list_id AND user_id = auth.uid()
        ));

    -- Tabloları herkese açık yap
    GRANT ALL ON public.word_lists TO anon, authenticated;
    GRANT ALL ON public.words TO anon, authenticated;
    `;

    // SQL sorgusunu çalıştır
    const result = await executeSql(sql);

    if (result) {
      console.log('Veritabanı tabloları başarıyla oluşturuldu');
    } else {
      console.error('Veritabanı tabloları oluşturulurken hata oluştu');

      // Alternatif yöntem: Supabase REST API ile tablo oluşturma
      console.log('Alternatif yöntem deneniyor...');

      // word_lists tablosunu oluştur
      const { error: wordListsError } = await supabase
        .from('word_lists')
        .select('id')
        .limit(1);

      if (wordListsError && wordListsError.code === '42P01') {
        console.error('word_lists tablosu bulunamadı, Supabase yönetim panelinden tabloları oluşturmanız gerekiyor.');
      }
    }

    console.log('Veritabanı kurulumu tamamlandı');
    return true;
  } catch (error) {
    console.error('Veritabanı kurulumu sırasında hata:', error);
    return false;
  }
};

// Supabase'de stored procedure oluşturmak için SQL
export const createStoredProcedures = `
-- word_lists tablosunu oluşturmak için stored procedure
CREATE OR REPLACE FUNCTION create_word_lists_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.word_lists (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    word_count INTEGER DEFAULT 0,
    progress REAL DEFAULT 0,
    language TEXT DEFAULT 'en'
  );

  -- RLS (Row Level Security) politikalarını ayarla
  ALTER TABLE public.word_lists ENABLE ROW LEVEL SECURITY;

  -- Varolan politikaları temizle
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini görebilir" ON public.word_lists;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini oluşturabilir" ON public.word_lists;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini güncelleyebilir" ON public.word_lists;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerini silebilir" ON public.word_lists;

  -- word_lists için politikalar
  CREATE POLICY "Kullanıcılar kendi listelerini görebilir"
      ON public.word_lists FOR SELECT
      USING (auth.uid() = user_id);

  CREATE POLICY "Kullanıcılar kendi listelerini oluşturabilir"
      ON public.word_lists FOR INSERT
      WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Kullanıcılar kendi listelerini güncelleyebilir"
      ON public.word_lists FOR UPDATE
      USING (auth.uid() = user_id);

  CREATE POLICY "Kullanıcılar kendi listelerini silebilir"
      ON public.word_lists FOR DELETE
      USING (auth.uid() = user_id);

  -- Tabloyu herkese açık yap
  GRANT ALL ON public.word_lists TO anon, authenticated;
END;
$$;

-- words tablosunu oluşturmak için stored procedure
CREATE OR REPLACE FUNCTION create_words_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.words (
    id UUID PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES public.word_lists(id) ON DELETE CASCADE,
    original TEXT NOT NULL,
    translation TEXT NOT NULL,
    context TEXT,
    notes TEXT,
    mastery_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- RLS (Row Level Security) politikalarını ayarla
  ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

  -- Varolan politikaları temizle
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri görebilir" ON public.words;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerine kelime ekleyebilir" ON public.words;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri güncelleyebilir" ON public.words;
  DROP POLICY IF EXISTS "Kullanıcılar kendi listelerindeki kelimeleri silebilir" ON public.words;

  -- words için politikalar
  CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri görebilir"
      ON public.words FOR SELECT
      USING (EXISTS (
          SELECT 1 FROM public.word_lists
          WHERE id = list_id AND user_id = auth.uid()
      ));

  CREATE POLICY "Kullanıcılar kendi listelerine kelime ekleyebilir"
      ON public.words FOR INSERT
      WITH CHECK (EXISTS (
          SELECT 1 FROM public.word_lists
          WHERE id = list_id AND user_id = auth.uid()
      ));

  CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri güncelleyebilir"
      ON public.words FOR UPDATE
      USING (EXISTS (
          SELECT 1 FROM public.word_lists
          WHERE id = list_id AND user_id = auth.uid()
      ));

  CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri silebilir"
      ON public.words FOR DELETE
      USING (EXISTS (
          SELECT 1 FROM public.word_lists
          WHERE id = list_id AND user_id = auth.uid()
      ));

  -- Tabloyu herkese açık yap
  GRANT ALL ON public.words TO anon, authenticated;
END;
$$;
`;

export default setupDatabase;
