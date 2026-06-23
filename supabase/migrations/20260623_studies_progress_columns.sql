-- Migration: Ajout des colonnes de progression temps réel à la table studies
-- À exécuter dans le SQL Editor Supabase :
-- https://supabase.com/dashboard/project/utwjfsomblhupghbgvgv/sql/new
--
-- Ces colonnes sont utilisées par le webhook CF Pages (generation-webhook.ts)
-- pour stocker la progression temps réel de la génération d'étude.

ALTER TABLE studies
  ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eta_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phase integer,
  ADD COLUMN IF NOT EXISTS phase_total integer,
  ADD COLUMN IF NOT EXISTS progress_label text,
  ADD COLUMN IF NOT EXISTS phase_label text;

-- Après avoir exécuté cette migration, décommenter dans generation-webhook.ts :
--   update.progress = 100;
--   update.eta_seconds = 0;
-- et restaurer les blocs intField/strField pour progress, eta, phase, etc.
