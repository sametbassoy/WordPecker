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
