CREATE TABLE public.installer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  years_in_trade int NOT NULL DEFAULT 0,
  jobs_done int NOT NULL DEFAULT 0,
  response_time text NOT NULL DEFAULT 'within 2 hours',
  badges text[] NOT NULL DEFAULT '{}',
  avatar_url text,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.installer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.installer_profiles TO authenticated;
GRANT ALL ON public.installer_profiles TO service_role;
ALTER TABLE public.installer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view installers" ON public.installer_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Installers create own profile" ON public.installer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Installers update own profile" ON public.installer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.installer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid NOT NULL REFERENCES public.installer_profiles(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.installer_reviews TO anon;
GRANT SELECT, INSERT, DELETE ON public.installer_reviews TO authenticated;
GRANT ALL ON public.installer_reviews TO service_role;
ALTER TABLE public.installer_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.installer_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed-in can review" ON public.installer_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND NOT EXISTS (SELECT 1 FROM public.installer_profiles p WHERE p.id = installer_id AND p.user_id = auth.uid()));
CREATE POLICY "Authors delete own review" ON public.installer_reviews FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER installer_profiles_touch BEFORE UPDATE ON public.installer_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.installer_profiles (slug, name, company, area, bio, phone, years_in_trade, jobs_done, response_time, badges) VALUES
('mark-hughes','Mark Hughes','Copperline Security','Manchester & Stockport','Hikvision & Ajax specialist. Clean cable runs, no visible clips.','447700900111',14,1240,'within 1 hour','{NSI Gold,SSAIB,DBS checked,£5m insured}'),
('sara-patel','Sara Patel','Brightwatch CCTV','Leeds & Bradford','Wireless and battery systems for rentals and new builds.','447700900222',9,640,'within 2 hours','{SSAIB,DBS checked,Reolink Pro}'),
('dan-oconnor','Dan O''Connor','Ironside Alarms','Birmingham','Graded alarms with police URN, monitoring and keyholding.','447700900333',21,2100,'same day','{NSI Silver,Texecom Pro,Police response}');

INSERT INTO public.installer_reviews (installer_id, author_name, rating, body)
SELECT id, 'Jason, Didsbury', 5, 'Cameras up in a day, cables hidden perfectly. Quoted from my phone video — spot on.' FROM public.installer_profiles WHERE slug='mark-hughes'
UNION ALL SELECT id, 'Helen, Sale', 5, 'Alarm and 4 cameras. Explained the app brilliantly.' FROM public.installer_profiles WHERE slug='mark-hughes'
UNION ALL SELECT id, 'Ravi, Headingley', 5, 'Battery cameras on our rental, tidy and fast.' FROM public.installer_profiles WHERE slug='sara-patel'
UNION ALL SELECT id, 'Claire, Moseley', 4, 'Great alarm, monitoring set up same week.' FROM public.installer_profiles WHERE slug='dan-oconnor';